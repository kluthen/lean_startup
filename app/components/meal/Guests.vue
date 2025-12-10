<script setup lang="ts">
import type { FoodAttribute } from '~~/shared/types'

defineProps<{
  guests: any[]
  attributes?: FoodAttribute[]
}>()
</script>

<template>
  <div v-if="guests && guests.length" class="bg-white dark:bg-gray-800 p-6 rounded-xl h-fit border border-gray-100 dark:border-gray-700">
     <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-users" />
        Guests Constraints
     </h2>
     <div v-for="guest in guests" :key="guest.id" class="mb-6 last:mb-0">
         <h3 class="font-bold text-sm mb-2 text-primary-600 border-b border-gray-100 pb-1">{{ guest.name }}</h3>
         <ul v-if="guest.constraints.length" class="space-y-2">
             <li v-for="c in guest.constraints" :key="c.attributeId" class="flex justify-between items-center text-sm">
                 <span class="text-gray-700 dark:text-gray-300">
                     {{ attributes?.find(a => a.id === c.attributeId)?.value || c.attributeId.substring(0,8) + '...' }}
                 </span>
                 <UBadge 
                    :color="c.weight === '--' || c.stepValue === 0 ? 'error' : c.weight === '-' || c.stepValue === 1 ? 'warning' : 'success'" 
                    size="xs"
                    variant="soft"
                 >
                    {{ c.weight === '--' || c.stepValue === 0 ? 'Forbidden' : c.weight === '-' || c.stepValue === 1 ? 'Avoid' : 'Prefer' }}
                 </UBadge>
             </li>
         </ul>
         <div v-else class="text-xs text-gray-400 italic">No constraints</div>
     </div>
  </div>
</template>
