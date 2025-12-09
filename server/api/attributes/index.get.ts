import { sql } from '../../utils/db'
import type { FoodAttribute } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  const attributes = await sql<FoodAttribute[]>`
    SELECT id, type, value
    FROM food_attribute
    ORDER BY type, value
  `
  return attributes as FoodAttribute[]
})
