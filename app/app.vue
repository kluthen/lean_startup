<script setup lang="ts">
const { fetchUser } = useAuth()
await fetchUser()
</script>

<template>
  <UApp>
    <NuxtLayout>
    <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
