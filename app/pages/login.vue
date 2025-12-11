<script setup lang="ts">
const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
    try {
        await login(username.value, password.value)
    } catch (e: any) {
        error.value = e.data?.message || 'Connexion echouée'
    }
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h1 class="text-2xl font-bold text-center">Se connecter</h1>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block mb-1 text-sm font-medium">Utilisateur</label>
                    <input v-model="username" type="text" class="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium">Mot de passe</label>
                    <input v-model="password" type="password" class="w-full px-3 py-2 border rounded" required />
                </div>
                <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
                <button type="submit" class="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                    Se connecter
                </button>
            </form>
            <div class="text-center text-sm">
                Pas de compte ? <NuxtLink to="/register" class="text-blue-600 hover:underline">S'inscrire</NuxtLink>
            </div>
        </div>
    </div>
</template>
