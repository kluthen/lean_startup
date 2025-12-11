export default eventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const body = await readBody(event)
    const { name, severity, comments, color } = body

    if (!name || !severity) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Name and severity are required'
        })
    }

    // Auto-assign color if not provided
    let finalColor = color
    if (!finalColor) {
        // Try to find previous color for this symptom name
        const previous = await sql`
      SELECT color FROM symptoms 
      WHERE user_id = ${user.id} AND name = ${name} AND color IS NOT NULL 
      ORDER BY created_at DESC LIMIT 1
    `
        if (previous.length > 0) {
            finalColor = previous[0].color
        } else {
            // Default to a generic color or error? 
            // Requirement said "expects color or generates one". Let's default to gray if nothing found and nothing provided
            finalColor = 'gray'
        }
    }

    const result = await sql`
    INSERT INTO symptoms (user_id, name, severity, comments, color)
    VALUES (${user.id}, ${name}, ${severity}, ${comments}, ${finalColor})
    RETURNING *
  `

    return result[0]
})
