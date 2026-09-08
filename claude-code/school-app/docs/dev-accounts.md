# Dev accounts & seed data

Seeded into Supabase project `pkkchkqdzdrhndtbyboc`. **Development only** — these
credentials are deliberately weak and must never exist in a production project.

## Accounts

| Role | Sign-in | Password | Notes |
|---|---|---|---|
| Admin (Greenwood) | `admin@greenwoodschool.edu` | `Passw0rd!23` | Principal Nadia Aslam |
| Teacher (Greenwood) | `sana.tariq@greenwoodschool.edu` | `Passw0rd!23` | Ms. Sana Tariq, class teacher of Grade 5-A |
| Parent — Mr. Malik | `+92 300 1234567` | `112233` | Guardian of Ayesha Malik |
| Parent — Mrs. Malik | `+92 300 5555555` | `112233` | Second guardian of Ayesha |
| Parent — Mrs. Iqbal | `+92 300 9876543` | `112233` | Guardian of **two** children (Zainab + Hamza) |
| Admin (Crescent) | `admin@crescentschool.edu` | `Passw0rd!23` | Isolation fixture |
| Teacher (Crescent) | `imran.shah@crescentschool.edu` | `Passw0rd!23` | Isolation fixture |

**Parents never type an email.** The app derives one from the phone number:
`+923001234567` → `p923001234567@parents.classconnect.local`. Only the derived
address reaches Supabase Auth.

## What is seeded

- **Two schools.** Greenwood Public School and Crescent Model School. The second
  exists purely so cross-tenant leakage is testable — never delete it.
- **Sessions.** Greenwood has 2026-27 (current) and 2025-26; Crescent has 2026-27.
- **Classes.** Grade 5-A (Sana's), plus Grade 2-A / 7-A / 9-A with no class teacher,
  which is what makes them render locked for her.
- **32 students** in Grade 5-A, rolls 01–32. The eight from the prototype keep their
  names and roll numbers; the rest are new so the class actually adds up.
- **Attendance** for every school day from 3 Aug to 8 Sep 2026. **Today is left
  unmarked on purpose** so the "Mark Today's Attendance" flow has something to do.
- **14 Aug 2026 is a holiday** (Independence Day) in `school_calendar`. That is what
  makes August 20 school days rather than 21.
- **Ayesha Malik (roll 01) is pinned** to 18 present / 1 absent / 1 late = **90.0%**,
  matching the prototype exactly. Verify against her when changing the summary view.

## Gotchas found the hard way

**Seeding `auth.users` by SQL requires empty strings, not NULL.** GoTrue scans
`confirmation_token`, `recovery_token`, `email_change`, `email_change_token_new`,
`email_change_token_current`, `phone_change`, `phone_change_token` and
`reauthentication_token` into Go strings, which cannot hold NULL. Leave them NULL and
*every* sign-in fails with a misleading `500 Database error querying schema` that
looks like a broken access-token hook. Always set them to `''`.

**Calling a function needs USAGE on its schema, not just EXECUTE.** Policies calling
`private.*` helpers failed with `permission denied for schema private` until
`grant usage on schema private to authenticated` (migration 010). Individual EXECUTE
grants are not sufficient on their own.

## Verified behaviour

Confirmed by signing in over the real Auth API and querying PostgREST:

- JWT carries `school_id` and `user_role`; the reserved `role` claim stays `authenticated`.
- Greenwood teacher sees 32 students, 1 class, 832 attendance rows.
- Crescent teacher sees 2 students and 12 attendance rows — never Greenwood's.
- Mr. Malik sees only Ayesha. Mrs. Iqbal sees both her children.
- A parent writing attendance is rejected by RLS.
- A teacher writing another school's attendance row is rejected by RLS.

## Open decision

Supabase's **leaked-password protection is off**, and the security advisor flags it.
Turning it on checks passwords against HaveIBeenPwned — which would reject six-digit
PINs like `112233` outright. Enabling it means parents need longer secrets, so it is a
product decision, not just a toggle.
