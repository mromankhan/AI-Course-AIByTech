@AGENTS.md

# Role

You are a **Senior Software Engineer** with deep expertise in system design, product architecture, and full-stack development. Approach every task as a principal engineer would:

- **System design first** — before writing code, think about data flow, component boundaries, and scalability trade-offs. Call these out explicitly when they matter.
- **Product thinking** — consider UX, edge cases, and real user impact alongside technical correctness.
- **Architecture decisions** — prefer simple, composable solutions over clever ones. When choosing patterns (e.g. server vs client component, REST vs server action), state the reasoning briefly.
- **Code quality** — write production-grade code: type-safe, secure, performant. No placeholders, no TODOs left in shipped code.
- **Direct communication** — give concrete recommendations, not options lists. If there's a clearly better approach, say so.


# Claude Code — Project-Specific Instructions

## Expo SDK Version
This project uses **Expo SDK 57** (see `package.json`). Always fetch versioned docs before writing Expo code:
- Use `mcp__plugin_expo_expo__read_documentation` with URLs starting `https://docs.expo.dev/versions/v57.0.0/`
- Use `mcp__plugin_expo_expo__add_library` to install packages — never `npm install` directly for SDK packages

## Supabase MCP
Always use `mcp__plugin_supabase_supabase__search_docs` before writing any RLS policy, Auth config, Realtime subscription, or Storage rule. The docs are always more current than training data.

## MCP Tool Priority
When in doubt about any behavior of Supabase, Expo, or EAS — use the MCP tools to fetch the official docs. Do not answer from memory for these topics.


# ClassConnect — School Management App

Multi-tenant school app for Pakistani schools. Three roles: **Admin**, **Teacher**, **Parent**.
Features: attendance, tests & results, homework, behaviour/participation tracking, weekly
teacher feedback. Bilingual English/Urdu.

**Status: Milestone 1 (attendance vertical slice) in progress.** The database, RLS, seed data
and auth are live and proved by `npm run verify:backend`. The app has sign-in, the teacher
dashboard and roster, mark-attendance with an offline queue, and the parent attendance view.
Tests/results and weekly feedback are still placeholder screens.

`classconnect_app_preview.html` is the design spec — the visual language and screen inventory.
Treat it as a spec, not as code to port; it contains real bugs (see the plan) that must be
fixed rather than reproduced.

Always use MCP servers when they can do the job.
Supabase project: **`pkkchkqdzdrhndtbyboc`** (`school-app`, org `hinymbvkfeppzkpjofco`,
region `ap-south-1`). Never act on any other project from this repo.

## Stack

| Layer | Choice |
|---|---|
| App | Expo (React Native) + Expo Router, TypeScript |
| Admin panel | A third role **inside the same Expo app**. No separate dashboard, no web target in v1 |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions |
| Server data | TanStack Query over `supabase-js` |
| Push | Expo Notifications, triggered from Edge Functions |
| Styling | RN `StyleSheet` + typed theme tokens ported from the prototype's CSS variables. No NativeWind |
| Platforms | **Android first.** iOS is possible later with no code change; do not add Apple tooling now |

Generate DB types with `supabase gen types typescript`. Never hand-write row types.

## Non-negotiable rules

**Tenancy.** Every tenant-scoped table has `school_id`, and every one has RLS enabled. No
exceptions, including join tables and lookup tables. A missing policy is a data leak between
schools, not a TODO.

**JWT claims.** `school_id` and `role` are injected via a **Custom Access Token Hook**. Policies
read them from the JWT. Never write a policy that subqueries `profiles` for the current user's
school — it is slow on every row and recurses once `profiles` itself has a policy.

**No self-signup, ever.** Admins are provisioned manually; admins create teachers; admins create
parents. Every account maps to a real enrolled person. Do not add a public signup screen.

**Parent login is phone + PIN**, provisioned by the admin. Not email. Most parents in this market
have no email address and will not complete an email verification flow.

**Guardians are many-to-many with students.** Use a `guardians` join table. Never
`students.parent_id` — siblings share a guardian, and a student has two guardians.

**Everything academic is scoped to a session.** Attendance, tests, results, and feedback all
carry `session_id` (e.g. 2025-26) and `class_id` as of that session. Students are promoted
between classes, not edited in place.

**Writes are offline-first.** Teachers mark attendance for 30+ students on bad classroom
connectivity. Attendance and marks go to a local queue (expo-sqlite) and sync on reconnect.
Supabase has no built-in offline persistence — this is ours to build. Reads may be online-only.

**Business logic lives in Postgres.** Attendance percentages, subject averages, and weekly
feedback digests are SQL views or functions. Do not fetch rows and aggregate them in the client.

## Localisation

- Strings are keyed, never inline. English and Urdu both live in the locale files.
- **Layout stays LTR.** Urdu text renders in an LTR layout, as the prototype does. Do not call
  `I18nManager.forceRTL()` — it requires an app restart and breaks in ways we cannot support.
- Bundle **Noto Nastaliq Urdu**. Android renders Urdu badly without it.

## Deliberately not used

- **Supabase Realtime.** Attendance is not collaborative. TanStack Query plus pull-to-refresh.
- **Messaging and meeting requests.** Cut from v1. The prototype shows a parent Messages tab, but
  chat is a whole subsystem and the only feature that would force Realtime back in. Do not build it.
- **Separate backend (Nest/Express).** Edge Functions and Postgres functions cover it.
- **Firebase.** The data is relational; RLS is the tenancy story.

Revisit these only with a concrete requirement that forces it.

## Working agreements

- Build single-school-shaped, with `school_id` present from day one. Do not build school
  onboarding or a signup funnel until there is a second school.
- Remote push needs a dev build — it does not work in Expo Go on Android. Expect a dev build early.
- Never commit Supabase keys. The service-role key never appears in app code, only Edge Functions.
- The Supabase MCP server is pinned to this project in `.mcp.json`. Use it rather than guessing SQL.
- Run `get_advisors` (type `security`) after every migration. A table without RLS is a bug, now.

## Open decisions

Do not silently pick these — raise them.

- SMS provider, if phone OTP ever replaces admin-provisioned PINs
- Whether report cards are generated as PDFs, and where they are stored
