/**
 * End-to-end check of auth + RLS against the live Supabase project.
 *
 *   npm run verify:backend
 *
 * Signs in as each seeded role over the real Auth API, decodes the JWT to prove
 * the access-token hook is injecting claims, then queries PostgREST to prove one
 * school cannot see another's data and that parents are read-only.
 *
 * Exits non-zero if any check fails, so it can gate CI later.
 */

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!URL || !KEY) {
  console.error('Missing env. Run with:  node --env-file=.env scripts/verify-backend.mjs');
  process.exit(1);
}

const ACCOUNTS = {
  teacherGreenwood: ['sana.tariq@greenwoodschool.edu', 'Passw0rd!23'],
  teacherCrescent: ['imran.shah@crescentschool.edu', 'Passw0rd!23'],
  adminGreenwood: ['admin@greenwoodschool.edu', 'Passw0rd!23'],
  parentMalik: ['p923001234567@parents.classconnect.local', '112233'],
  parentIqbal: ['p923009876543@parents.classconnect.local', '112233'],
};

let failures = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label.padEnd(52)} ${JSON.stringify(actual)}`);
  if (!ok) console.log(`${' '.repeat(7)}expected ${JSON.stringify(expected)}`);
}

async function signIn([email, password]) {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!body.access_token)
    throw new Error(`sign-in failed for ${email}: ${body.error_description ?? body.msg}`);
  return body.access_token;
}

function claims(token) {
  const part = token.split('.')[1];
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

async function get(token, path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function post(token, table, row, extra = {}) {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...extra,
    },
    body: JSON.stringify(row),
  });
  return { status: res.status, body: await res.json() };
}

async function del(token, path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method: 'DELETE',
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
  });
  return res.status;
}

async function fn(token, name, body) {
  const res = await fetch(`${URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const tokens = {};
for (const [name, creds] of Object.entries(ACCOUNTS)) {
  tokens[name] = await signIn(creds);
}

console.log('\nJWT claims (proves the access-token hook is registered and running)');
const t = claims(tokens.teacherGreenwood);
check('teacher: reserved role claim untouched', t.role, 'authenticated');
check('teacher: user_role claim present', t.user_role, 'teacher');
check('parent: user_role claim present', claims(tokens.parentMalik).user_role, 'parent');
check('admin:  user_role claim present', claims(tokens.adminGreenwood).user_role, 'admin');
check(
  'crescent teacher is in a different school',
  claims(tokens.teacherCrescent).school_id !== t.school_id,
  true,
);

console.log('\nTenant isolation');
check(
  'Greenwood teacher -> students',
  (await get(tokens.teacherGreenwood, 'students?select=id')).length,
  32,
);
// Seeded 832 rows; anything marked from the app since is also Greenwood's.
check(
  'Greenwood teacher -> attendance (>= 832 seeded)',
  (await get(tokens.teacherGreenwood, 'attendance?select=id&limit=2000')).length >= 832,
  true,
);
check(
  'Crescent teacher  -> students',
  (await get(tokens.teacherCrescent, 'students?select=id')).length,
  2,
);
check(
  'Crescent teacher  -> attendance',
  (await get(tokens.teacherCrescent, 'attendance?select=id&limit=2000')).length,
  12,
);

console.log('\nRole scoping');
check(
  'teacher sees only the class they teach',
  (await get(tokens.teacherGreenwood, 'classes?select=id')).length,
  1,
);
check(
  'admin sees every class in the school',
  (await get(tokens.adminGreenwood, 'classes?select=id')).length,
  4,
);
check(
  'guardian of one child sees one child',
  (await get(tokens.parentMalik, 'students?select=full_name')).map((s) => s.full_name),
  ['Ayesha Malik'],
);
check(
  'guardian of siblings sees both',
  (await get(tokens.parentIqbal, 'students?select=full_name&order=full_name')).map(
    (s) => s.full_name,
  ),
  ['Hamza Iqbal', 'Zainab Iqbal'],
);

console.log('\nWrites are refused where they should be');
const [enr] = await get(tokens.parentMalik, 'enrollments?select=id,school_id,session_id&limit=1');
const row = {
  school_id: enr.school_id,
  session_id: enr.session_id,
  enrollment_id: enr.id,
  date: '2026-09-09',
  status: 'present',
};
check(
  'parent cannot write attendance',
  (await post(tokens.parentMalik, 'attendance', row)).status,
  403,
);
check(
  "teacher cannot write another school's attendance",
  (await post(tokens.teacherCrescent, 'attendance', { ...row, status: 'absent' })).status,
  403,
);

console.log('\nDerived data matches the approved design');
const [ayesha] = await get(
  tokens.parentMalik,
  'student_attendance_summary?select=attendance_pct,days_marked,present_days&month=eq.2026-08-01',
);
// PostgREST returns numeric as a JSON number, so compare numerically.
check('Ayesha August attendance = 90% (prototype figure)', Number(ayesha.attendance_pct), 90);
check('...over 20 school days', ayesha.days_marked, 20);

console.log('\nTests & results (views compute everything; trigger flips status)');
{
  const teacher = tokens.teacherGreenwood;
  const [klass] = await get(teacher, 'classes?select=id,school_id');
  const [session] = await get(teacher, 'sessions?select=id&is_current=eq.true');
  const [subject] = await get(teacher, `subjects?select=id&class_id=eq.${klass.id}&limit=1`);
  const roster = await get(
    teacher,
    `enrollments?select=id&class_id=eq.${klass.id}&session_id=eq.${session.id}&order=roll_no&limit=3`,
  );

  const created = await post(teacher, 'tests', {
    school_id: klass.school_id,
    session_id: session.id,
    class_id: klass.id,
    subject_id: subject.id,
    title: 'verify-backend probe',
    test_date: '2026-09-01',
    total_marks: 50,
  });
  check('teacher can schedule a test', created.status, 201);
  const test = created.body[0];
  check('new test starts scheduled', test.status, 'scheduled');

  check(
    'parent cannot enter results',
    (
      await post(tokens.parentMalik, 'test_results', {
        school_id: klass.school_id,
        test_id: test.id,
        enrollment_id: roster[0].id,
        obtained_marks: 50,
      })
    ).status,
    403,
  );

  const over = await post(teacher, 'test_results', {
    school_id: klass.school_id,
    test_id: test.id,
    enrollment_id: roster[0].id,
    obtained_marks: 51,
  });
  check('marks over total are refused by the trigger', over.body.code, 'P0001');

  const results = await post(
    teacher,
    'test_results',
    [45, 30, 20].map((m, i) => ({
      school_id: klass.school_id,
      test_id: test.id,
      enrollment_id: roster[i].id,
      obtained_marks: m,
    })),
    { Prefer: 'resolution=merge-duplicates,return=representation' },
  );
  check('teacher upserts three results', results.status, 201);

  const [after] = await get(teacher, `tests?select=status&id=eq.${test.id}`);
  check('status flips to results_entered automatically', after.status, 'results_entered');

  const [summary] = await get(
    tokens.parentMalik,
    `test_result_summary?select=pct,grade,rank_in_class,class_size,class_avg_pct&test_id=eq.${test.id}`,
  );
  check('parent sees own result: 45/50 = 90% = A, rank 1 of 3', summary, {
    pct: 90.0,
    grade: 'A',
    rank_in_class: 1,
    class_size: 3,
    class_avg_pct: 63.3,
  });
  check(
    'parent sees only own row of the summary',
    (await get(tokens.parentMalik, `test_result_summary?select=id&test_id=eq.${test.id}`)).length,
    1,
  );
  const [stats] = await get(
    teacher,
    `test_stats?select=results_count,highest&test_id=eq.${test.id}`,
  );
  check('test_stats for the teacher', stats, { results_count: 3, highest: 45 });

  check('teacher deletes the probe test', await del(teacher, `tests?id=eq.${test.id}`), 204);
  check(
    'results cascade with it',
    (await get(teacher, `test_results?select=id&test_id=eq.${test.id}`)).length,
    0,
  );
}

console.log('\nWeekly feedback (drafts stay private until sent)');
{
  const teacher = tokens.teacherGreenwood;
  const [enrAyesha] = await get(
    tokens.parentMalik,
    'enrollments?select=id,school_id,session_id&limit=1',
  );
  const entry = {
    school_id: enrAyesha.school_id,
    session_id: enrAyesha.session_id,
    enrollment_id: enrAyesha.id,
    week_start: '2026-08-31',
    academic: 'good',
    homework: 'completed',
    behaviour: 'excellent',
    participation: 'active',
    strengths: 'verify-backend probe',
  };
  const draft = await post(teacher, 'feedback_entries', entry);
  check('teacher saves a draft', draft.status, 201);
  check(
    'parent cannot see the draft',
    (await get(tokens.parentMalik, 'feedback_sent?select=id&week_start=eq.2026-08-31')).length,
    0,
  );
  const sent = await post(
    teacher,
    'feedback_entries?on_conflict=enrollment_id,week_start',
    { ...entry, sent_at: new Date().toISOString() },
    { Prefer: 'resolution=merge-duplicates,return=representation' },
  );
  check('sending upserts the same row', sent.body[0]?.id, draft.body[0].id);
  check(
    'parent sees it once sent',
    (await get(tokens.parentMalik, 'feedback_sent?select=strengths&week_start=eq.2026-08-31')).map(
      (f) => f.strengths,
    ),
    ['verify-backend probe'],
  );
  check(
    'sibling guardian does not see it',
    (await get(tokens.parentIqbal, 'feedback_sent?select=id&week_start=eq.2026-08-31')).length,
    0,
  );
  check('cleanup', await del(teacher, `feedback_entries?id=eq.${draft.body[0].id}`), 204);
}

console.log('\nAccount provisioning (Edge Function, admin only)');
{
  check(
    'teacher is refused',
    (await fn(tokens.teacherGreenwood, 'provision-user', { kind: 'teacher' })).status,
    403,
  );
  check(
    'admin: bad PIN is validated',
    (
      await fn(tokens.adminGreenwood, 'provision-user', {
        kind: 'parent',
        full_name: 'Probe',
        phone: '0300 0000000',
        pin: '12',
        student_ids: ['00000000-0000-0000-0000-000000000000'],
      })
    ).body.error,
    'PIN must be exactly 6 digits',
  );
  check(
    'admin: cannot link a student outside the school',
    (
      await fn(tokens.adminGreenwood, 'provision-user', {
        kind: 'parent',
        full_name: 'Probe',
        phone: '0300 0000000',
        pin: '123456',
        student_ids: ['00000000-0000-0000-0000-000000000000'],
      })
    ).body.error,
    'Unknown student',
  );
  check(
    'admin: duplicate phone is a clean 409',
    (
      await fn(tokens.adminGreenwood, 'provision-user', {
        kind: 'parent',
        full_name: 'Probe',
        phone: '0300 1234567',
        pin: '123456',
        student_ids: (await get(tokens.adminGreenwood, 'students?select=id&limit=1')).map(
          (s) => s.id,
        ),
      })
    ).status,
    409,
  );
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
