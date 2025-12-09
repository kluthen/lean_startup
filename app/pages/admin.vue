<template>
  <UContainer class="py-10">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
        Administration
      </h1>
      <UButton to="/" icon="i-heroicons-home" variant="soft">Return Home</UButton>
    </div>

    <div class="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
      <UButton 
        to="/admin/ingredients" 
        variant="ghost" 
        :class="{'bg-gray-100 dark:bg-gray-800 text-primary-500': $route.path === '/admin/ingredients'}"
      >
        Ingredients
      </UButton>
      <UButton 
        to="/admin/recipes" 
        variant="ghost"
        :class="{'bg-gray-100 dark:bg-gray-800 text-primary-500': $route.path === '/admin/recipes'}"
      >
        Recipes
      </UButton>
    </div>

    <NuxtPage />
  </UContainer>
</template>
