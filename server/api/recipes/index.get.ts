import { sql } from '../../utils/db'
import type { Recipe } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  const recipes = await sql`
    SELECT 
      r.id, 
      r.name, 
      r.description,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'id', pe.id, 
          'code', pe.code, 
          'label', pe.label
        )), '[]')
        FROM recipe_plate_element rpe
        JOIN plate_element pe ON rpe.plate_element_id = pe.id
        WHERE rpe.recipe_id = r.id
      ) as "plateElements",
      (
        SELECT COALESCE(json_agg(json_build_object(
          'ingredientId', i.id,
          'name', i.name,
          'quantity', ri.quantity,
          'unit', ri.unit,
          'optional', ri.optional,
          'preparation', ri.preparation
        )), '[]')
        FROM recipe_ingredient ri
        JOIN ingredient i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = r.id
      ) as "ingredients",
      (
        SELECT COALESCE(json_agg(json_build_object(
          'id', fa.id, 
          'type', fa.type, 
          'value', fa.value
        )), '[]')
        FROM recipe_attribute ra
        JOIN food_attribute fa ON ra.food_attribute_id = fa.id
        WHERE ra.recipe_id = r.id
      ) as "attributes"
    FROM recipe r
    ORDER BY r.name ASC
  `
  return recipes
})
