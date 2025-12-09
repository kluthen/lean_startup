import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, description, plateElementIds, ingredients, attributeIds } = body

    if (!name) {
        throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    // Use a transaction
    return await sql.begin(async (tx) => {
        // 1. Create Recipe
        const [recipe] = await tx`
      INSERT INTO recipe (name, description)
      VALUES (${name}, ${description || null})
      RETURNING id, name
    `

        // 2. Link Plate Elements
        if (plateElementIds && plateElementIds.length > 0) {
            for (const peId of plateElementIds) {
                await tx`
          INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
          VALUES (${recipe.id}, ${peId})
        `
            }
        }

        // 3. Link Ingredients
        if (ingredients && ingredients.length > 0) {
            // ingredients: { ingredientId, quantity, unit, optional, preparation }[]
            for (const item of ingredients) {
                await tx`
          INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit, optional, preparation)
          VALUES (
            ${recipe.id}, 
            ${item.ingredientId}, 
            ${item.quantity || null}, 
            ${item.unit || null}, 
            ${item.optional || false},
            ${item.preparation || null}
          )
        `
            }
        }

        // 4. Link Attributes (Constraints/Tags)
        if (attributeIds && attributeIds.length > 0) {
            for (const attrId of attributeIds) {
                await tx`
          INSERT INTO recipe_attribute (recipe_id, food_attribute_id)
          VALUES (${recipe.id}, ${attrId})
        `
            }
        }

        return recipe
    })
})
