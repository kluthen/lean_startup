import { sql } from '../../utils/db'
import type { PlateElement } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  const elements = await sql<PlateElement[]>`
    SELECT id, code, label
    FROM plate_element
    ORDER BY label
  `
  return elements
})
