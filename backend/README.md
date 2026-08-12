# Waste-Watch Backend (v4)

Node/Express API backed by **SQLite** via the `better-sqlite3` package —
no database server to install, configure, or keep running. The entire
database is a single file at `backend/data/wastewatch.db`, created
automatically the first time the app runs. Every query is plain SQL in
`models/*.js` — no ORM.

This means the app can be handed to someone else, unzipped on their
laptop, and run with just `npm install` — nothing else to set up first.

## 1. Configure and run the app

1. `cp .env.example .env` and fill in:
   - `JWT_SECRET` — any long random string
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your real first admin login (8+ chars)
   - `ADMIN_CONTACT_EMAIL` — where "Contact Admin" messages go
   - `DB_FILE` — optional; defaults to `./data/wastewatch.db`
2. `npm install`
3. `npm run seed` — creates the SQLite database file, its tables, your
   admin account, and sample bin locations.
4. `npm run dev`

If it can't open/create the database file, the error message printed will
usually tell you exactly what's wrong (e.g. a permissions issue on the
`data/` folder) — send it to me and I'll help debug it.

Once it's running, you can browse/edit the same data two ways: any SQLite
browser (e.g. [DB Browser for SQLite](https://sqlitebrowser.org/), just
open `backend/data/wastewatch.db`), or through the app itself.

### Moving the app to another computer

The whole database is that one file — copy
`backend/data/wastewatch.db` alongside the code (or re-run `npm run seed`
on the new machine to start fresh) and everything works the same, with no
separate database install on the new machine either.

## Roles & login

- **Citizens/residents never log in.** They report a full bin via a public
  form and get a tracking code back, used to check status and confirm
  collection later.
- **Collectors and admins log in** with real email/password. Only an
  existing admin can create new collector/admin accounts (Admin → Users in
  the UI, or `POST /api/auth/register`).

## Collection confirmation flow

1. Resident reports a full bin → gets tracking code `WW-XXXXXX`.
2. Collector marks it collected in their dashboard → status becomes
   `collected` and (if an email was given) the resident gets an email
   asking them to confirm.
3. Resident visits `/confirm/:code` (no login) and taps **Yes, it was
   collected** or **No, it wasn't**.
   - Yes → status `confirmed`.
   - No → status `reopened` and a critical alert is raised for the admin.

## API overview

- `POST /api/auth/login`
- `POST /api/auth/register` (admin only)
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/bins`, `PATCH /api/bins/:id/fill-level`
- `POST /api/reports` (public), `GET /api/reports/track/:code` (public),
  `POST /api/reports/track/:code/confirm` (public)
- `GET /api/reports`, `GET /api/reports/:id`, `PATCH /api/reports/:id`,
  `PATCH /api/reports/:id/collect` (collector/admin)
- `GET/POST /api/alerts`, `PATCH /api/alerts/:id/resolve`
- `GET/PATCH/DELETE /api/users` (admin only)
- `POST /api/contact` (public), `GET /api/contact` + `PATCH /api/contact/:id/close` (admin)
