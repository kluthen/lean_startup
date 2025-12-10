<script setup lang="ts">
defineProps<{
  shoppingList: any[]
}>()
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl h-fit">
     <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <UIcon name="i-heroicons-shopping-bag" />
        Shopping List
     </h2>
     
     <ul class="space-y-3">
        <li v-for="(item, idx) in shoppingList" :key="idx" class="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
            <div>
                <span class="font-medium">{{ item.name }}</span>
                <span class="text-xs text-gray-500 block">for {{ item.for }}</span>
            </div>
            <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {{ item.qty }} {{ item.unit }}
            </div>
        </li>
     </ul>
  </div>
</template>
