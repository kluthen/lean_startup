import { sql } from '../../utils/db'
import type { Ingredient } from '../../../shared/types'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name } = body

    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })
    if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })

    try {
        const [ingredient] = await sql<Ingredient[]>`
            UPDATE ingredient 
            SET name = ${name}
            WHERE id = ${id}
            RETURNING id, name
        `

        if (!ingredient) {
            throw createError({ statusCode: 404, statusMessage: 'Ingredient not found' })
        }

        return ingredient
    } catch (error: any) {
        if (error.code === '23505') {
            throw createError({ statusCode: 409, statusMessage: 'Ingredient name exists' })
        }
        throw error
    }
})
