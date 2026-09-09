import NetInfo from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

/**
 * Offline write queue.
 *
 * Teachers mark 30+ students on classroom connectivity that drops mid-list, so a
 * write must never depend on the network. Every write lands in SQLite first and
 * the UI treats that as done; a drain pass replays the queue whenever the device
 * is online.
 *
 * Safe to replay because attendance carries `unique (enrollment_id, date)` and we
 * send an upsert on that constraint — a row sent twice is the same row, not two.
 * `client_uuid` is generated once at enqueue time and stored on the row, so the
 * server can tell a retry from a genuine second edit.
 *
 * Reads stay online-only by decision: cached attendance that is subtly stale is
 * worse than an honest spinner.
 */

type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];

export type PendingWrite = {
  client_uuid: string;
  table: 'attendance';
  payload: AttendanceInsert;
  created_at: string;
  attempts: number;
  last_error: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function db() {
  dbPromise ??= (async () => {
    const handle = await SQLite.openDatabaseAsync('classconnect.db');
    await handle.execAsync(`
      pragma journal_mode = WAL;
      create table if not exists pending_writes (
        client_uuid text primary key,
        table_name  text not null,
        payload     text not null,
        created_at  text not null,
        attempts    integer not null default 0,
        last_error  text
      );
    `);
    return handle;
  })();
  return dbPromise;
}

/**
 * Queues one attendance mark. Returns immediately — callers must not await the
 * network. Re-marking the same student on the same day replaces the queued row
 * rather than stacking a second one, so the last tap wins locally too.
 */
export async function queueAttendance(payload: AttendanceInsert): Promise<string> {
  const handle = await db();
  const clientUuid = payload.client_uuid ?? Crypto.randomUUID();
  const row: AttendanceInsert = { ...payload, client_uuid: clientUuid };

  await handle.runAsync(
    `insert into pending_writes (client_uuid, table_name, payload, created_at)
     values (?, 'attendance', ?, ?)
     on conflict (client_uuid) do update set payload = excluded.payload, last_error = null`,
    clientUuid,
    JSON.stringify(row),
    new Date().toISOString(),
  );

  return clientUuid;
}

/** Replaces any queued mark for the same student and date — one row per cell. */
export async function queueAttendanceForCell(payload: AttendanceInsert): Promise<void> {
  const handle = await db();
  const existing = await handle.getFirstAsync<{ client_uuid: string }>(
    `select client_uuid from pending_writes
     where table_name = 'attendance'
       and json_extract(payload, '$.enrollment_id') = ?
       and json_extract(payload, '$.date') = ?`,
    payload.enrollment_id,
    payload.date,
  );
  await queueAttendance({ ...payload, client_uuid: existing?.client_uuid });
}

/**
 * Queued marks for one date, keyed by enrollment. The mark-attendance screen
 * overlays these on the server rows so a teacher who reopens the screen offline
 * still sees what they marked.
 */
export async function pendingForDate(
  date: string,
): Promise<Record<string, AttendanceInsert['status']>> {
  const handle = await db();
  const rows = await handle.getAllAsync<{ payload: string }>(
    `select payload from pending_writes
     where table_name = 'attendance' and json_extract(payload, '$.date') = ?`,
    date,
  );

  const out: Record<string, AttendanceInsert['status']> = {};
  for (const r of rows) {
    const p = JSON.parse(r.payload) as AttendanceInsert;
    out[p.enrollment_id] = p.status;
  }
  return out;
}

export async function pendingCount(): Promise<number> {
  const handle = await db();
  const row = await handle.getFirstAsync<{ n: number }>('select count(*) as n from pending_writes');
  return row?.n ?? 0;
}

async function pendingRows(): Promise<PendingWrite[]> {
  const handle = await db();
  const rows = await handle.getAllAsync<{
    client_uuid: string;
    table_name: string;
    payload: string;
    created_at: string;
    attempts: number;
    last_error: string | null;
  }>('select * from pending_writes order by created_at');

  return rows.map((r) => ({
    client_uuid: r.client_uuid,
    table: 'attendance',
    payload: JSON.parse(r.payload) as AttendanceInsert,
    created_at: r.created_at,
    attempts: r.attempts,
    last_error: r.last_error,
  }));
}

export type DrainResult = { sent: number; failed: number; remaining: number };

let draining: Promise<DrainResult> | null = null;

/**
 * Sends everything queued, oldest first, in one batched upsert.
 *
 * A rejection that is the server's final answer — RLS refusing the write, or an
 * enrollment that no longer exists — must not be retried forever, so those rows
 * are dropped. Everything else stays queued for the next drain.
 */
export async function drain(): Promise<DrainResult> {
  // A second caller (reconnect and screen focus firing together) joins the run
  // in flight rather than sending the same rows twice.
  draining ??= runDrain().finally(() => {
    draining = null;
  });
  return draining;
}

async function runDrain(): Promise<DrainResult> {
  const handle = await db();
  const rows = await pendingRows();
  if (rows.length === 0) return { sent: 0, failed: 0, remaining: 0 };

  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return { sent: 0, failed: 0, remaining: rows.length };

  const { error } = await supabase.from('attendance').upsert(
    rows.map((r) => r.payload),
    { onConflict: 'enrollment_id,date' },
  );

  if (!error) {
    await handle.runAsync(
      `delete from pending_writes where client_uuid in (${rows.map(() => '?').join(',')})`,
      ...rows.map((r) => r.client_uuid),
    );
    return { sent: rows.length, failed: 0, remaining: 0 };
  }

  const permanent = isPermanent(error);
  if (permanent) {
    await handle.runAsync(
      `delete from pending_writes where client_uuid in (${rows.map(() => '?').join(',')})`,
      ...rows.map((r) => r.client_uuid),
    );
    return { sent: 0, failed: rows.length, remaining: 0 };
  }

  await handle.runAsync(
    `update pending_writes set attempts = attempts + 1, last_error = ?
     where client_uuid in (${rows.map(() => '?').join(',')})`,
    error.message,
    ...rows.map((r) => r.client_uuid),
  );
  return { sent: 0, failed: 0, remaining: rows.length };
}

/** PostgREST reports the HTTP status in `code` for RLS and constraint failures. */
function isPermanent(error: { code?: string; message: string }): boolean {
  if (error.code === '42501') return true; // RLS refused it; retrying cannot help
  if (error.code === '23503') return true; // enrollment no longer exists
  return false;
}

/**
 * Drains on every transition into "connected". Call once at app start; the
 * returned function unsubscribes.
 */
export function startOutboxSync(onDrained?: (result: DrainResult) => void) {
  let wasOnline = true;

  return NetInfo.addEventListener((state) => {
    const online = !!state.isConnected && state.isInternetReachable !== false;
    if (online && !wasOnline) {
      drain().then((r) => onDrained?.(r));
    }
    wasOnline = online;
  });
}

/** For a manual "retry now" and for the mark-attendance screen's save button. */
export async function drainIfOnline(): Promise<DrainResult> {
  const state = await NetInfo.fetch();
  const online = !!state.isConnected && state.isInternetReachable !== false;
  if (!online) return { sent: 0, failed: 0, remaining: await pendingCount() };
  return drain();
}
