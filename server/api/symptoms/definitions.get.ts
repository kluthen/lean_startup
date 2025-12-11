export default eventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    // result: [{ name: 'Headache', color: 'red' }, ...]
    // We want unique names, and preferably the latest color associated with them.
    const result = await sql`
      SELECT DISTINCT ON (name) name, color 
      FROM symptoms 
      WHERE user_id = ${user.id}
      ORDER BY name, created_at DESC
    `

    return result
})
