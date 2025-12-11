import { generateMeal, type GuestConstraint } from '../utils/meal-generator'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { constraints } = body

    if (!constraints) {
        return { error: "No constraints provided" }
    }

    const start = performance.now()

    const meal = await generateMeal(constraints)

    const duration = performance.now() - start
    console.log(`[MealGeneration] Took ${duration.toFixed(2)}ms`)
    setHeader(event, 'Server-Timing', `generate;dur=${duration}`)

    return {
        ...meal,
        _debug: {
            durationMs: duration
        }
    }
})
