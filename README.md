# Waste Watch

A civic bin-reporting app. Residents report an overflowing bin with no
account required; collectors and admins log in to manage bins, reports,
alerts, and accounts. Backed by **SQLite** (a single local file, no
database server needed), raw SQL queries — see `backend/config/db.js` and
`backend/models/`.

## What changed in this rebuild

- **Database**: SQL Server → **SQLite**, using the `better-sqlite3`
  package. There's nothing to install or start separately — the whole
  database is one file, `backend/data/wastewatch.db`, created
  automatically the first time you run the app. That makes it easy to
  hand the project to someone else and have it run on their laptop with
  just `npm install` — see `backend/README.md` for details.
- **Collector dashboard**: `/collector` page where collectors see open
  reports, mark bins as collected, and update fill levels.
- **Real accounts**: no hardcoded demo logins. You set a real admin
  email/password in `.env` before seeding; that admin then creates every
  other real collector/admin account from the Admin → Users screen.
- **Citizens don't log in**: reporting a full bin is a public form. Only
  collectors and admins have accounts and log in.
- **Collection confirmation loop**: when a collector marks a report
  collected, the resident is asked (by tracking code / email link) to
  confirm it was actually emptied. "No" reopens the report and raises a
  critical alert for the admin team.
- **Contact Admin**: a real, working contact form (stored + emailed, not a
  dead link), and the login page surfaces it automatically after a failed
  login attempt.
- **Working navigation**: every nav link, button, and dashboard action is
  wired to a real route/handler; unmatched routes show a proper 404 instead
  of a blank page.

## Running it locally

### 1. Backend

```
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:
- `JWT_SECRET` — any long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — **your real** first admin login (8+ chars)
- `ADMIN_CONTACT_EMAIL` — where "Contact Admin" messages should go
- `SMTP_*` — optional; leave blank to just log emails to the console locally
- `DB_FILE` — optional; defaults to `./data/wastewatch.db`, no setup needed

Then:
```
npm install
npm run seed     # creates the local database file, your admin account + sample bin locations
npm run dev      # http://localhost:5000
```

### 2. Frontend

```
cd frontend
npm install
npm run dev       # http://localhost:5173
```

`frontend/.env` already points at `http://localhost:5000/api` — change
`VITE_API_URL` there if your backend runs elsewhere.

### 3. Log in

Go to `http://localhost:5173/login` and use the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` you set. From **Admin → Users** you can create real
collector accounts (and additional admins) with their real emails and
passwords — that's the only way new accounts get created, on purpose.

### Running it on someone else's laptop

Since there's no database server to install, getting the app running on a
different machine is the same three steps above: `npm install` in both
`backend` and `frontend`, `npm run seed` once to create that laptop's own
local database file, then `npm run dev` in both. No SQL Server, no
connection strings, no extra services to start.

See `backend/README.md` for the full API reference and the exact
collection-confirmation flow.
