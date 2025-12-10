import { sql } from '../../utils/db'
import type { GuestConstraint } from '../../utils/meal-generator'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { ingredientId, constraints } = body as { ingredientId: string, constraints: GuestConstraint[] }

    if (!ingredientId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Ingredient ID is required'
        })
    }

    // 1. Get the equivalence group(s) for the ingredient
    // An ingredient might belong to multiple groups? Assuming one relevant group for substitution for now, or union of all.
    // The seed shows ingredients like 'Carotte' in 'legume_racine'

    // We want to find other ingredients in the same groups.
    const alternatives = await sql`
        WITH source_groups AS (
            SELECT equivalence_group_id 
            FROM ingredient_equivalence 
            WHERE ingredient_id = ${ingredientId}
        )
        SELECT 
            i.id, 
            i.name,
            -- Fetch attributes for constraint checking
            COALESCE(
                json_agg(json_build_object('id', fa.id, 'value', fa.value))
                FILTER (WHERE fa.id IS NOT NULL), '[]'
            ) as attributes
        FROM ingredient i
        JOIN ingredient_equivalence ie ON i.id = ie.ingredient_id
        JOIN source_groups sg ON ie.equivalence_group_id = sg.equivalence_group_id
        LEFT JOIN ingredient_attribute ia ON i.id = ia.ingredient_id
        LEFT JOIN food_attribute fa ON ia.food_attribute_id = fa.id
        WHERE i.id != ${ingredientId} -- Exclude self
        GROUP BY i.id
    `

    // 2. Filter by constraints
    // Reuse logic similar to rateRecipe but for ingredients
    // We only care if it's forbidden (weight '--'). 
    // We could also rank them, but filtering forbidden is priority.

    const validAlternatives = alternatives.filter((ing: any) => {
        const ingAttributeIds = new Set(ing.attributes.map((a: any) => a.id))

        for (const constraint of (constraints || [])) {
            if (ingAttributeIds.has(constraint.attributeId)) {
                if (constraint.weight === '--') {
                    // Forbidden
                    return false
                }
            }
        }
        return true
    })

    return validAlternatives
})
