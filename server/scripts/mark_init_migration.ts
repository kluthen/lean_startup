import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

async function run() {
    console.log('Marking init migration as applied...')
    await sql`
        INSERT INTO _migrations (name) 
        VALUES ('251209_1110_init.sql') 
        ON CONFLICT (name) DO NOTHING
    `
    console.log('Done.')
    await sql.end()
}

run().catch(console.error)
