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

async function post(token, table, row) {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
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
check(
  'Greenwood teacher -> attendance',
  (await get(tokens.teacherGreenwood, 'attendance?select=id&limit=2000')).length,
  832,
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

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
