import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, description, plateElementIds, ingredients, attributeIds } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }
    if (!name) {
        throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    // Use a transaction
    return await sql.begin(async (tx) => {
        // 1. Update Recipe
        const [recipe] = await tx`
      UPDATE recipe 
      SET name = ${name}, description = ${description || null}
      WHERE id = ${id}
      RETURNING id, name
    `

        if (!recipe) {
            throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
        }

        // 2. Clear existing relations
        await tx`DELETE FROM recipe_plate_element WHERE recipe_id = ${id}`
        await tx`DELETE FROM recipe_ingredient WHERE recipe_id = ${id}`
        await tx`DELETE FROM recipe_attribute WHERE recipe_id = ${id}`

        // 3. Link Plate Elements
        if (plateElementIds && plateElementIds.length > 0) {
            for (const peId of plateElementIds) {
                await tx`
          INSERT INTO recipe_plate_element (recipe_id, plate_element_id)
          VALUES (${id}, ${peId})
        `
            }
        }

        // 4. Link Ingredients
        if (ingredients && ingredients.length > 0) {
            // ingredients: { ingredientId, quantity, unit, optional, preparation }[]
            for (const item of ingredients) {
                await tx`
          INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit, optional, preparation)
          VALUES (
            ${id}, 
            ${item.ingredientId}, 
            ${item.quantity || null}, 
            ${item.unit || null}, 
            ${item.optional || false},
            ${item.preparation || null}
          )
        `
            }
        }

        // 5. Link Attributes (Constraints/Tags)
        if (attributeIds && attributeIds.length > 0) {
            for (const attrId of attributeIds) {
                await tx`
          INSERT INTO recipe_attribute (recipe_id, food_attribute_id)
          VALUES (${id}, ${attrId})
        `
            }
        }

        return recipe
    })
})
