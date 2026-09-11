// provision-user — creates a teacher or parent account for the caller's school.
//
// This is the only code that touches the service-role key. It never trusts the
// body for tenancy: school_id comes from the caller's JWT, and the caller must be
// an admin. Parents get a synthetic email derived from their phone so the app can
// sign them in with phone + PIN (see docs/dev-accounts.md).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

type Body =
  | { kind: 'teacher'; full_name: string; email: string; password: string; employee_id?: string }
  | {
      kind: 'parent';
      full_name: string;
      phone: string;
      pin: string;
      student_ids: string[];
      relation?: string;
    };

const PARENT_EMAIL_DOMAIN = 'parents.classconnect.local';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Same rule as src/lib/phone.ts: 0300… or +92… → 92XXXXXXXXXX. */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (/^0\d{10}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^92\d{10}$/.test(digits)) return digits;
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Who is calling? Read the claims the access-token hook put in the JWT.
  const authHeader = req.headers.get('Authorization') ?? '';
  const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: claimsData, error: claimsError } = await caller.auth.getClaims(
    authHeader.replace(/^Bearer\s+/i, ''),
  );
  if (claimsError || !claimsData) return json(401, { error: 'Not signed in' });

  const claims = claimsData.claims as Record<string, unknown>;
  const schoolId = claims.school_id as string | undefined;
  if (claims.user_role !== 'admin' || !schoolId) {
    return json(403, { error: 'Only a school admin can create accounts' });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const fullName = (body.full_name ?? '').trim();
  if (!fullName) return json(400, { error: 'Name is required' });

  let email: string;
  let password: string;
  let phone: string | null = null;
  let studentIds: string[] = [];

  if (body.kind === 'teacher') {
    email = body.email?.trim().toLowerCase();
    password = body.password ?? '';
    if (!email || !email.includes('@')) return json(400, { error: 'A valid email is required' });
    if (password.length < 8) return json(400, { error: 'Password must be at least 8 characters' });
  } else if (body.kind === 'parent') {
    phone = normalisePhone(body.phone ?? '');
    if (!phone) return json(400, { error: 'Enter a Pakistani mobile number, e.g. 0300 1234567' });
    if (!/^\d{6}$/.test(body.pin ?? ''))
      return json(400, { error: 'PIN must be exactly 6 digits' });
    if (!Array.isArray(body.student_ids) || body.student_ids.length === 0) {
      return json(400, { error: 'Link at least one student' });
    }
    email = `p${phone}@${PARENT_EMAIL_DOMAIN}`;
    password = body.pin;
    studentIds = body.student_ids;
  } else {
    return json(400, { error: 'kind must be teacher or parent' });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Students must belong to the caller's school — never trust ids from the body.
  if (studentIds.length > 0) {
    const { count } = await admin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .in('id', studentIds);
    if (count !== studentIds.length) return json(400, { error: 'Unknown student' });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) {
    const msg = createError?.message ?? 'Could not create user';
    const taken = /already|exists|registered/i.test(msg);
    return json(taken ? 409 : 500, {
      error: taken
        ? body.kind === 'parent'
          ? 'An account with this phone number already exists'
          : 'An account with this email already exists'
        : msg,
    });
  }
  const userId = created.user.id;

  // Profile + guardian links. If any of it fails, remove the auth user so we do
  // not leave an account that can sign in but has no school.
  const rollback = async () => {
    await admin.auth.admin.deleteUser(userId);
  };

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    school_id: schoolId,
    role: body.kind,
    full_name: fullName,
    email: body.kind === 'teacher' ? email : null,
    phone: body.kind === 'parent' ? `+${phone}` : null,
    employee_id: body.kind === 'teacher' ? body.employee_id?.trim() || null : null,
  });
  if (profileError) {
    await rollback();
    return json(500, { error: profileError.message });
  }

  if (studentIds.length > 0) {
    const { error: guardianError } = await admin.from('guardians').insert(
      studentIds.map((student_id) => ({
        school_id: schoolId,
        student_id,
        profile_id: userId,
        relation: body.kind === 'parent' ? body.relation?.trim() || null : null,
      })),
    );
    if (guardianError) {
      await rollback();
      return json(500, { error: guardianError.message });
    }
  }

  await admin.from('notification_prefs').insert({ profile_id: userId });

  return json(200, { id: userId });
});
