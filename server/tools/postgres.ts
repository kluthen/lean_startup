import postgres from 'postgres'

export function usePostgres () {
  if (!process.env.DATABASE_URL) {
    throw createError('Missing `DATABASE_URL` environment variable')
  }

  return postgres(process.env.NUXT_PDATABASE_URLOSTGRES_URL as string, {
    ssl: 'require'
  }) 
}

/*
export default eventHandler(async (event) => {
  const sql = usePostgres()

  const products = await sql`SELECT * FROM products`

  // Ensure the database connection is closed after the request is processed
  event.waitUntil(sql.end())
  return products
})
*/