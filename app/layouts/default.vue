<script setup lang="ts">
const { user, logout } = useAuth()

const items = computed(() => [
  [{
    label: user.value?.username || 'Guest',
    slot: 'account',
    disabled: true
  }],
  user.value ? [
    {
      label: 'Profile',
      icon: 'i-heroicons-user-circle',
      to: '/profile'
    },
    {
      label: 'Symptoms',
      icon: 'i-heroicons-heart', // Or another appropriate icon like 'i-heroicons-clipboard-document-list'
      to: '/symptoms'
    },
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: logout
    }
  ] : [
    {
      label: 'Login',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      to: '/login'
    },
    {
      label: 'Register',
      icon: 'i-heroicons-user-plus',
      to: '/register'
    }
  ]
])
</script>

<template>
  <div>
    <header class="border-b p-4 flex justify-between items-center bg-white">
        <NuxtLink to="/" class="text-xl font-bold">On Mange Ensemble</NuxtLink>
        
        <UDropdownMenu :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-end' }">
            <UAvatar v-if="user" :alt="user.username" />
            <UButton v-else color="neutral" variant="ghost" icon="i-heroicons-user" />

            <template #account="{ item }">
                <div class="text-left">
                    <p>Signed in as</p>
                    <p class="truncate font-medium text-gray-900 dark:text-white">
                        {{ item.label }}
                    </p>
                </div>
            </template>
        </UDropdownMenu>
    </header>
    <slot />
    <AppFooter />
  </div>
</template>
