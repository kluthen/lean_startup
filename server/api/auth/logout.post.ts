export default defineEventHandler(async (event) => {
    const startTime = performance.now()
    try {
        await clearUserSession(event)
        return {
            message: 'Logged out successfully'
        }
    } finally {
        const duration = performance.now() - startTime
        console.log(`[Auth] Logout execution time: ${duration.toFixed(2)}ms`)
    }
})
