# SmartSpend

A minimal full-stack personal expense tracker built with React, FastAPI, PostgreSQL and Google Sign-In.

## Features
- Google Sign-In (Google Identity Services ID-token flow)
- JWT-protected API
- Dashboard with income, expenses, balance and recent transactions
- Create, edit and delete transactions
- Categories and monthly budgets
- Monthly/category analytics and rule-based spending insights
- Responsive UI

> Google Sign-In requires a Google OAuth Web Client ID. Telegram and Gmail integrations are intentionally left as future integrations; they are not silently simulated.

## Requirements
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

## 1. Configure PostgreSQL
Create a database and user, for example:

```sql
CREATE USER smartspend_user WITH PASSWORD 'change_this_password';
CREATE DATABASE smartspend OWNER smartspend_user;
```

## 2. Backend setup

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://smartspend_user:change_this_password@localhost:5432/smartspend
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
FRONTEND_ORIGINS=http://localhost:5173
```

Generate a strong JWT secret with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Run the API:

```powershell
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## 3. Configure Google Sign-In
1. Open https://console.cloud.google.com/
2. Create/select a Google Cloud project.
3. Configure the OAuth consent screen.
4. Create an OAuth Client ID of type **Web application**.
5. Add `http://localhost:5173` to **Authorized JavaScript origins**.
6. Put the same client ID in both:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

For local testing, add your Google account as a test user if the consent screen is in Testing mode.

## 4. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`, then:

```powershell
npm run dev
```

Open http://localhost:5173.

## Notes
- The backend creates tables on startup for this starter project. For production, use Alembic migrations.
- The app stores a hashed Google subject identifier, not a Google password.
- The Google ID token is verified server-side. The app then issues its own short-lived JWT.
- Keep `.env` files private. Never commit credentials.
- Currency is currently INR (₹). Amounts are stored as PostgreSQL `NUMERIC`, not floating-point values.
- The initial dashboard uses a default monthly budget of ₹10,000 until the user creates or edits a budget.
- This is a solid MVP foundation, not a production financial-data service. Before public deployment, add rate limiting, refresh-token/session strategy, CSRF protections where cookie auth is used, audit logging, database migrations, backups, monitoring and a security review.
