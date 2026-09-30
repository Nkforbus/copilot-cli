'use strict';

// Loads variables from a local .env file (if present) into process.env.
// In production/deployment environments, real environment variables should
// be set directly and this call is a harmless no-op if no .env file exists.
require('dotenv').config();

const { Pool } = require('pg');

let pool;

/**
 * Builds the Postgres connection configuration from environment variables.
 *
 * Supports either:
 *  - DATABASE_URL (a full Supabase/Postgres connection string), or
 *  - Discrete PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD variables.
 *
 * No connection string or credentials are ever hardcoded here.
 *
 * @returns {import('pg').PoolConfig}
 */
function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return {
      connectionString,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    };
  }

  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error(
      'Missing database configuration. Set DATABASE_URL, or PGHOST, PGDATABASE, ' +
        'PGUSER and PGPASSWORD environment variables (see scripts/.env.example).'
    );
  }

  return {
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : 5432,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  };
}

/**
 * Returns a singleton pg.Pool, lazily created on first use.
 *
 * @returns {import('pg').Pool}
 */
function getPool() {
  if (!pool) {
    pool = new Pool(getConnectionConfig());
  }
  return pool;
}

/**
 * Opens a client connection from the pool, verifying connectivity.
 * Callers are responsible for releasing the returned client.
 *
 * @returns {Promise<import('pg').PoolClient>}
 */
async function connect() {
  const currentPool = getPool();
  const client = await currentPool.connect();
  return client;
}

/**
 * Closes the connection pool. Useful for graceful shutdown in scripts.
 *
 * @returns {Promise<void>}
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  getPool,
  connect,
  closePool,
};
