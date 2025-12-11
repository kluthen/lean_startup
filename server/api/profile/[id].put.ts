export default defineEventHandler(async (event) => {
    const session = await getUserFromSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    const id = event.context.params?.id
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Profile ID is required'
        })
    }

    const body = await readBody(event)
    const { name, constraints } = body

    // Ensure profile belongs to user
    const [existingProfile] = await sql`
        SELECT * FROM profile WHERE id = ${id} AND user_id = ${session.user_id}
    `

    if (!existingProfile) {
        throw createError({
            statusCode: 404,
            message: 'Profile not found'
        })
    }

    // Dont update type, only name and constraints
    const [updatedProfile] = await sql`
        UPDATE profile
        SET name = ${name || existingProfile.name},
            constraints = ${constraints || existingProfile.constraints}::jsonb
        WHERE id = ${id}
        RETURNING *
    `

    return updatedProfile
})
