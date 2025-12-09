import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required',
        })
    }

    await sql`
    DELETE FROM ingredient
    WHERE id = ${id}
  `

    return { success: true }
})
