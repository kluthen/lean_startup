import { sql } from '../../utils/db'
import type { Ingredient, FoodAttribute } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  // Fetch ingredients
  const ingredients = await sql<Ingredient[]>`
    SELECT 
      i.id, 
      i.name
    FROM ingredient i
    ORDER BY i.name ASC
  `

  // Fetch attributes for these ingredients
  // This could be optimized safely with a join or a second query if listing many
  // For now, let's do a simple join strategy or just return basic info
  // The user asked for "ingredients... needing to be searchable via criteria"
  // So we probably want attributes.

  // Let's do a JOIN to get attributes efficiently

  const ingredientsWithAttrs = await sql`
    SELECT 
      i.id, 
      i.name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fa.id,
            'type', fa.type,
            'value', fa.value
          )
        ) FILTER (WHERE fa.id IS NOT NULL),
        '[]'
      ) as attributes
    FROM ingredient i
    LEFT JOIN ingredient_attribute ia ON i.id = ia.ingredient_id
    LEFT JOIN food_attribute fa ON ia.food_attribute_id = fa.id
    GROUP BY i.id, i.name
    ORDER BY i.name ASC
  `

  return ingredientsWithAttrs as unknown as Ingredient[]
})
