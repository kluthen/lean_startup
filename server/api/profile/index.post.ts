export default defineEventHandler(async (event) => {
    const session = await getUserFromSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    const body = await readBody(event)
    const { name, type, constraints } = body

    if (!name || !type) {
        throw createError({
            statusCode: 400,
            message: 'Name and type are required'
        })
    }

    const [profile] = await sql`
        INSERT INTO profile (user_id, name, type, constraints)
        VALUES (${session.user_id}, ${name}, ${type}, ${constraints || {}}::jsonb)
        RETURNING *
    `

    return profile
})
