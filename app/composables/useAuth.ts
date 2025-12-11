export const useAuth = () => {
    // Define a User type
    interface User {
        id: string;
        username: string;
    }

    const user = useState<User | null>('user', () => null)
    const router = useRouter()

    const fetchUser = async () => {
        try {
            const data = await $fetch<{ user: User }>('/api/auth/me')
            user.value = data.user
        } catch (e) {
            user.value = null
        }
    }

    const login = async (username: string, password: string) => {
        try {
            const data = await $fetch<{ user: User }>('/api/auth/login', {
                method: 'POST',
                body: { username, password }
            })
            user.value = data.user
            await fetchUser() // Ensure we have fresh state
            router.push('/')
        } catch (e) {
            throw e
        }
    }

    const register = async (username: string, password: string) => {
        try {
            const data = await $fetch<{ user: User }>('/api/auth/register', {
                method: 'POST',
                body: { username, password }
            })
            user.value = data.user
            router.push('/')
        } catch (e) {
            throw e
        }
    }

    const logout = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        router.push('/login')
    }

    return {
        user,
        fetchUser,
        login,
        register,
        logout
    }
}
