export default defineEventHandler(async (event) => {
    const session = await getUserFromSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    const profiles = await sql`
        SELECT * FROM profile WHERE user_id = ${session.user_id} ORDER BY created_at
    `

    return profiles
})
