export default defineEventHandler(async (event) => {
    const session = await getUserFromSession(event)
    // console.log('[Middleware] Auth check. Session:', !!session)
    if (session) {
        event.context.user = {
            id: session.user_id,
            username: session.username
        }
    }
})
