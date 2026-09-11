# Running and testing ClassConnect

## 1. Backend (no device needed)

```bash
npm run verify:backend
```

Signs in as all five seeded accounts over the real Auth API, decodes the JWTs to prove the
custom access token hook is injecting `school_id` and `user_role`, then queries PostgREST to
prove tenant isolation, role scoping and that parents cannot write. It then schedules a test,
enters results, checks the parent's derived rank/grade/class average, walks a feedback entry
from draft to sent, and hits the `provision-user` Edge Function. 38 assertions; exits
non-zero on failure. Probe rows are deleted again at the end. Credentials are in `dev-accounts.md`.

## 2. The app

```bash
npx expo start
```

Scan the QR with **Expo Go** on an Android phone (phone and laptop on the same Wi-Fi). There is
no Android SDK installed on this machine, so there is no emulator — a physical phone is the
path. `npx expo start --web` also renders, but the offline queue and push are native concerns
and only web-approximate.

Expo Go stops being enough at push notifications, which do not work in Expo Go on Android. That
needs a dev build:

```bash
eas build --profile development --platform android
```

## 3. The proving run for Milestone 1

1. Sign in as `sana.tariq@greenwoodschool.edu` / `Passw0rd!23` — teacher tabs.
2. Dashboard shows Grade 5 — Section A, 32 students, today unmarked.
3. **Turn on airplane mode.**
4. Mark Attendance → tap through the class (or "All present", then override a few) → Save.
   The banner reads *"Saved on this device."*
5. Force-quit the app. Reopen. The marks are still there — they are in SQLite, not memory.
6. Turn Wi-Fi back on. The queue drains by itself; Profile → Sync shows "Everything is synced".
7. Sign out, sign in as `0300 9876543` / `112233` (Mrs. Iqbal, two children) and confirm the
   attendance appears, and that the child switcher shows both Zainab and Hamza.

The database is the single source of every percentage — the ring, the class summary and the
month chart all read views, never client-side arithmetic.

## 4. The proving run for tests, feedback and admin

**Teacher** (`sana.tariq@greenwoodschool.edu`):

1. Tests tab → *New test* → pick a subject, title, date, total marks → *Schedule test*.
   Set the date to today or earlier so it lands under *Results*.
2. Tap it → enter marks per student (the ✓ button fills full marks). Try 51 out of 50: the
   field turns coral and Save is disabled. Save. Airplane mode works here exactly as it does
   for attendance — the same outbox.
3. Feedback tab → a student → choose the four chips, write a concern → *Send to parent*.
   *Save draft* keeps it off the parent's screen; the dashboard's pending count only drops on
   send.

**Parent** (`0300 1234567` / `112233`, Ayesha's father):

4. Results tab: overall %, grade letter and *rank N of 32* come from Postgres. The rank is
   right even though RLS lets the parent read only Ayesha's own row (definer functions in
   `private.*` compute the class figures).
5. Feedback tab: the entry sent in step 3, with the concern in a coral block.

**Admin** (`admin@greenwoodschool.edu` / `Passw0rd!23`):

6. Home shows the four counts and which classes have marked today. Tap an unmarked class to
   mark it — the admin uses the same screen as the teacher.
7. Classes → a class → Subjects: add one. Tests and Feedback tabs work for any class.
8. Students → *Add* → name, avatar, class, roll number. Open the student → *Link parent*
   → *Create a new parent account* → phone + 6-digit PIN. That calls the `provision-user`
   Edge Function (the only place the service-role key is used). Sign out and sign in as that
   parent: the child is there.
9. People → *Add teacher* → email + password; assign them under Classes → edit.
10. Home → *Sessions & calendar*: add a holiday for a future date, then check the parent's
    attendance calendar shows it as a holiday, not an absence.

## Notes

- `.expo/types/router.d.ts` is generated. If typed-route errors look wrong after adding or
  moving a screen, delete it and run `npx expo start` once.
- Seeded attendance runs 3 Aug – 8 Sep 2026, deliberately leaving recent days unmarked so the
  mark-attendance flow has something to do.
