export default eventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const id = getRouterParam(event, 'id')

    // Verify ownership
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required'
        })
    }
    const symptom = await sql`
      SELECT * FROM symptoms WHERE id = ${id} AND user_id = ${user.id}
    `
    if (symptom.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Symptom not found'
        })
    }

    const result = await sql`
      UPDATE symptoms 
      SET end_date = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return result[0]
})
