import { sql } from './db'
import type { Recipe, FoodAttribute } from '../../shared/types'

type ConstraintWeight = '++' | '+' | '-' | '--';

export interface GuestConstraint {
    guestId: string;
    attributeId: string; // The attribute (e.g., Gluten, Pork)
    weight: ConstraintWeight;
}

interface RatedRecipe extends Recipe {
    score: number;
    issues: string[]; // Reasons for rejection or warnings
    valid: boolean;
    plate_elements: { code: string }[];
}

export async function generateMeal(constraints: GuestConstraint[]) {
    // 1. Fetch deep data: Recipes + Attributes + Ingredients + IngredientAttributes
    // We need a comprehensive query.
    // This is expensive, but we assume dataset is manageable (<1000 recipes).
    // Optimization: Filter in DB? Hard because logic is complex "Any ingredient has attribute X".
    // Let's fetch all and filter in app memory for flexibility first.

    const recipes = await sql`
     SELECT 
      r.id, r.name, r.description,
      -- Recipe Attributes
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', fa.id, 'type', fa.type, 'value', fa.value)) 
        FILTER (WHERE fa.id IS NOT NULL), '[]'
      ) as attributes,
      -- Plate Elements (categories)
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', pe.id, 'code', pe.code)) 
        FILTER (WHERE pe.id IS NOT NULL), '[]'
      ) as plate_elements,
      -- Ingredients (nested with their attributes)
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', i.id, 
            'name', i.name,
            'attributes', (
                SELECT json_agg(json_build_object('id', food_attribute.id, 'value', food_attribute.value))
                FROM ingredient_attribute 
                JOIN food_attribute ON ingredient_attribute.food_attribute_id = food_attribute.id
                WHERE ingredient_attribute.ingredient_id = i.id
            )
        )) 
        FILTER (WHERE i.id IS NOT NULL), '[]'
      ) as ingredients
    FROM recipe r
    LEFT JOIN recipe_attribute ra ON r.id = ra.recipe_id
    LEFT JOIN food_attribute fa ON ra.food_attribute_id = fa.id
    LEFT JOIN recipe_plate_element rpe ON r.id = rpe.recipe_id
    LEFT JOIN plate_element pe ON rpe.plate_element_id = pe.id
    LEFT JOIN recipe_ingredient ri ON r.id = ri.recipe_id
    LEFT JOIN ingredient i ON ri.ingredient_id = i.id
    GROUP BY r.id
  `;

    // 2. Score and Filter
    const ratedRecipes = recipes.map(r => rateRecipe(r as any, constraints));

    // 3. Selection (Protéine, Féculent, Accompagnement, Sauce)
    // Logic: Group by plate element code.
    // Note: One recipe might act as multiple things? Assuming standard classification.

    const validRecipes = ratedRecipes.filter(r => r.valid);

    const proteins = validRecipes.filter(r => r.plate_elements.some((pe: any) => pe.code === 'proteine'));
    const starchs = validRecipes.filter(r => r.plate_elements.some((pe: any) => pe.code === 'feculent'));
    const sides = validRecipes.filter(r => r.plate_elements.some((pe: any) => pe.code === 'accompagnement'));
    const sauces = validRecipes.filter(r => r.plate_elements.some((pe: any) => pe.code === 'sauce'));

    // Simple selection: Best score.
    // In future: Randomize among top 3 to vary.

    return {
        proteine: pickBest(proteins),
        feculent: pickBest(starchs),
        accompagnement: pickBest(sides),
        sauce: pickBest(sauces),
        warning: validRecipes.length === 0 ? "No valid recipes found for criteria" : null
    };
}

function pickBest(candidates: RatedRecipe[]) {
    if (candidates.length === 0) return null;
    // Sort desc score
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
}

function rateRecipe(recipe: any, constraints: GuestConstraint[]): RatedRecipe {
    let score = 0;
    let valid = true;
    const issues: string[] = [];

    // Flatten all attributes of the recipe (recipe's own + all ingredients')
    const recipeAttributeIds = new Set<string>();
    recipe.attributes.forEach((a: any) => recipeAttributeIds.add(a.id));

    recipe.ingredients.forEach((ing: any) => {
        if (ing.attributes) {
            ing.attributes.forEach((a: any) => recipeAttributeIds.add(a.id));
        }
    });

    for (const constraint of constraints) {
        const hasAttribute = recipeAttributeIds.has(constraint.attributeId);

        if (hasAttribute) {
            if (constraint.weight === '--') {
                valid = false;
                issues.push(`Contains forbidden attribute ID: ${constraint.attributeId} (Guest ${constraint.guestId})`);
            } else if (constraint.weight === '-') {
                score -= 10;
            } else if (constraint.weight === '+') {
                score += 5;
            } else if (constraint.weight === '++') {
                score += 20;
            }
        } else {
            // Does NOT have attribute.
            // If constraint was "I want ++ meat", and this is veg, maybe logic is inverted?
            // User spec: "Contraintes sont pondérées... associé à un ingredient / origine".
            // Usually, "I want X" means if X is present, score ++.
            // "I don't want Y" means if Y is present, score -- (or ban).
            // Checks out.
        }
    }

    return {
        ...recipe,
        score,
        valid,
        issues
    };
}
