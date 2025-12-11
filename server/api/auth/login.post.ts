import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const startTime = performance.now()
    try {
        const body = await readBody(event)
        const { username, password } = body

        if (!username || !password) {
            throw createError({
                statusCode: 400,
                message: 'Username and password are required'
            })
        }

        const [user] = await sql`
            SELECT * FROM app_user WHERE username = ${username}
        `

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            throw createError({
                statusCode: 401,
                message: 'Invalid username or password'
            })
        }

        // Create session
        await createUserSession(event, user.id)

        return {
            user: {
                id: user.id,
                username: user.username
            }
        }
    } finally {
        const duration = performance.now() - startTime
        console.log(`[Auth] Login execution time: ${duration.toFixed(2)}ms`)
    }
})
