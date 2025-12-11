import { type H3Event } from 'h3'
import { v4 as uuidv4 } from 'uuid'

export async function createUserSession(event: H3Event, userId: string) {
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days

    await sql`
        INSERT INTO user_session (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
    `

    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        path: '/',
        expires: expiresAt,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return token
}

export async function getUserFromSession(event: H3Event) {
    const token = getCookie(event, 'auth_token')
    if (!token) return null

    const [session] = await sql`
        SELECT user_session.*, app_user.username, app_user.id as user_id
        FROM user_session
        JOIN app_user ON user_session.user_id = app_user.id
        WHERE token = ${token} AND expires_at > NOW()
    `

    if (!session) {
        // Invalid session, clear cookie
        deleteCookie(event, 'auth_token')
        return null
    }

    return session
}

export async function clearUserSession(event: H3Event) {
    const token = getCookie(event, 'auth_token')
    if (token) {
        await sql`DELETE FROM user_session WHERE token = ${token}`
    }
    deleteCookie(event, 'auth_token')
}
