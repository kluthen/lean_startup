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

    if (existingProfile.type === 'me') {
        throw createError({
            statusCode: 400,
            message: 'Cannot delete main profile'
        })
    }

    await sql`
        DELETE FROM profile WHERE id = ${id}
    `

    return {
        message: 'Profile deleted'
    }
})
