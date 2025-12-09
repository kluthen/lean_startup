import { sql } from '../../utils/db'
import type { Recipe } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  // Fetch recipes with plate elements (simple view for list)
  const recipes = await sql`
    SELECT 
      r.id, 
      r.name, 
      r.description,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pe.id,
            'code', pe.code,
            'label', pe.label
          )
        ) FILTER (WHERE pe.id IS NOT NULL),
        '[]'
      ) as plateElements
    FROM recipe r
    LEFT JOIN recipe_plate_element rpe ON r.id = rpe.recipe_id
    LEFT JOIN plate_element pe ON rpe.plate_element_id = pe.id
    GROUP BY r.id, r.name, r.description
    ORDER BY r.name ASC
  `
  return recipes
})
