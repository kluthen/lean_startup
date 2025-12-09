import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing ID' })

    // Cascade delete handles relations usually, but let's verify schema.
    // Schema has ON DELETE CASCADE for all relations linked to recipe.
    await sql`DELETE FROM recipe WHERE id = ${id}`

    return { success: true }
})
