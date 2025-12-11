export default defineEventHandler(async (event) => {
    const session = await getUserFromSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Fetch user's "me" profile
    const [profile] = await sql`
        SELECT * FROM profile WHERE user_id = ${session.user_id} AND type = 'me'
    `

    return {
        user: {
            id: session.user_id,
            username: session.username
        },
        profile
    }
})
