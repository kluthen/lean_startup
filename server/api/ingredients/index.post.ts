import { sql } from '../../utils/db'
import type { Ingredient } from '../../../shared/types'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Name is required',
        })
    }

    try {
        const [ingredient] = await sql<Ingredient[]>`
      INSERT INTO ingredient (name)
      VALUES (${name})
      RETURNING id, name
    `
        return ingredient
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            throw createError({
                statusCode: 409,
                statusMessage: 'Ingredient already exists',
            })
        }
        throw error
    }
})
