# Running and testing ClassConnect

## 1. Backend (no device needed)

```bash
npm run verify:backend
```

Signs in as all five seeded accounts over the real Auth API, decodes the JWTs to prove the
custom access token hook is injecting `school_id` and `user_role`, then queries PostgREST to
prove tenant isolation, role scoping and that parents cannot write. 17 assertions; exits
non-zero on failure. Credentials are in `dev-accounts.md`.

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

## Notes

- `.expo/types/router.d.ts` is generated. If typed-route errors look wrong after adding or
  moving a screen, delete it and run `npx expo start` once.
- Seeded attendance runs 3 Aug – 8 Sep 2026, deliberately leaving recent days unmarked so the
  mark-attendance flow has something to do.
