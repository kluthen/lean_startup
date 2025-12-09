import { generateMeal, type GuestConstraint } from '../utils/meal-generator'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { constraints } = body as { constraints: GuestConstraint[] }

    if (!constraints) {
        return { error: "No constraints provided" }
    }

    const meal = await generateMeal(constraints)
    return meal
})
