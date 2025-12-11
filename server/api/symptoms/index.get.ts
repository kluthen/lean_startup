export default eventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const result = await sql`
        SELECT * FROM symptoms 
        WHERE user_id = ${user.id} 
        ORDER BY begin_date DESC
    `

    console.log('[API] Symptoms fetch for user:', user.id)
    console.log('[API] Found symptoms:', result.length)

    return result
})
