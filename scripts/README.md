# scripts/

Utility scripts for this repository.

## Database connection helper (`db.js`)

`db.js` initializes a connection pool to a Postgres database (e.g. Supabase)
using environment variables, loaded securely via [`dotenv`](https://www.npmjs.com/package/dotenv).
No connection string or credentials are hardcoded anywhere in this file.

### Setup

1. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your real Supabase/Postgres
   credentials:
   ```bash
   cp .env.example .env
   ```
   `.env` is git-ignored and must never be committed.
3. Provide either `DATABASE_URL` (a full Postgres connection string, as
   found on your Supabase project's "Connection string" settings page) or
   the discrete `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD`
   variables.

### Usage

```js
const { connect, closePool } = require('./db');

async function main() {
  const client = await connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log(result.rows[0]);
  } finally {
    client.release();
    await closePool();
  }
}

main();
```

### Verifying connectivity

```bash
npm run test:db
```
