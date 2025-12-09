import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set.')
    process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Assuming script is in server/scripts/migrate.ts and migrations are in migrations/ (project root)
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations')

async function ensureMigrationTable() {
    await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `
}

async function getAppliedMigrations() {
    const rows = await sql`SELECT name FROM _migrations`
    return new Set(rows.map(r => r.name))
}

async function resetDatabase() {
    console.log('Resetting database...')
    await sql`DROP SCHEMA IF EXISTS public CASCADE`
    await sql`CREATE SCHEMA public`
    await sql`GRANT ALL ON SCHEMA public TO postgres`
    await sql`GRANT ALL ON SCHEMA public TO public`
    console.log('Database reset complete.')
}

async function runMigrations() {
    const args = process.argv.slice(2)
    if (args.includes('--reset')) {
        await resetDatabase()
    }

    await ensureMigrationTable()
    const applied = await getAppliedMigrations()

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort()

    if (files.length === 0) {
        console.log('No migrations found.')
        return
    }

    for (const file of files) {
        if (applied.has(file)) {
            continue
        }

        console.log(`Applying migration: ${file}`)
        const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')

        try {
            await sql.begin(async sql => {
                await sql.unsafe(content)
                await sql`INSERT INTO _migrations (name) VALUES (${file})`
            })
            console.log(`Successfully applied: ${file}`)
        } catch (e) {
            console.error(`Error applying migration ${file}:`, e)
            process.exit(1)
        }
    }

    console.log('All migrations applied.')
    await sql.end()
}

runMigrations().catch(e => {
    console.error(e)
    process.exit(1)
})
