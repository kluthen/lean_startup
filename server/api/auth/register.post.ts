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

        // Check if user exists
        const [existingUser] = await sql`
            SELECT id FROM app_user WHERE username = ${username}
        `

        if (existingUser) {
            throw createError({
                statusCode: 400,
                message: 'Username already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [user] = await sql`
            INSERT INTO app_user (username, password_hash)
            VALUES (${username}, ${hashedPassword})
            RETURNING id, username
        `

        // Create 'me' profile
        await sql`
            INSERT INTO profile (user_id, name, type, constraints)
            VALUES (${user.id}, ${username}, 'me', '{}'::jsonb)
        `

        // Create session
        await createUserSession(event, user.id)

        return {
            user
        }
    } finally {
        const duration = performance.now() - startTime
        console.log(`[Auth] Register execution time: ${duration.toFixed(2)}ms`)
    }
})
