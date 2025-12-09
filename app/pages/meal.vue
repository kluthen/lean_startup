<script setup lang="ts">
import type { Recipe, FoodAttribute } from '~/shared/types'

const { data: attributes } = await useFetch<FoodAttribute[]>('/api/attributes')

const mealState = useState<{ proteine: Recipe, feculent: Recipe, accompagnement: Recipe, sauce: Recipe, warning?: string }>('mealData')
const guests = useState<any[]>('mealConstraints')
const router = useRouter()

if (!mealState.value) {
  router.push('/')
}

const sections = computed(() => [
  { label: 'Protein', item: mealState.value?.proteine },
  { label: 'Starch', item: mealState.value?.feculent },
  { label: 'Side', item: mealState.value?.accompagnement },
  { label: 'Sauce', item: mealState.value?.sauce },
])

const shoppingList = computed(() => {
    if (!mealState.value) return []
    const list: any[] = []
    
    sections.value.forEach(sec => {
        if(sec.item && (sec.item as any).ingredients) {
            (sec.item as any).ingredients.forEach((ing: any) => {
                list.push({
                    name: ing.name || ing.ingredient?.name,
                    qty: ing.quantity,
                    unit: ing.unit,
                    for: sec.item!.name
                })
            })
        }
    })
    return list
})
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost">Back to Settings</UButton>
    </div>
    
    <div v-if="mealState?.warning" class="mb-6">
        <UAlert title="Warning" :description="mealState.warning" color="orange" variant="subtle" icon="i-heroicons-exclamation-triangle" />
    </div>

    <div class="grid lg:grid-cols-3 gap-10">
      <!-- Constraints Sidebar (moved here) -->
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
                        :color="c.weight === '--' || c.stepValue === 0 ? 'red' : c.weight === '-' || c.stepValue === 1 ? 'orange' : 'green'" 
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

      <!-- Menu Card matches layout -->
      <div :class="guests && guests.length ? 'lg:col-span-1' : 'lg:col-span-2'">
        <h2 class="text-3xl font-serif font-bold mb-6 text-primary-600 dark:text-primary-400">
          Proposed Menu
        </h2>
        <div class="space-y-6">
          <UCard v-for="sec in sections" :key="sec.label" :class="{'opacity-50': !sec.item}">
             <template #header>
                <div class="text-xs uppercase tracking-widest text-gray-500">{{ sec.label }}</div>
             </template>
             <div v-if="sec.item">
                 <div class="flex justify-between items-start">
                     <div>
                        <h3 class="text-xl font-bold">{{ sec.item.name }}</h3>
                        <p class="text-gray-600 dark:text-gray-400">{{ sec.item.description }}</p>
                     </div>
                     <UBadge v-if="(sec.item as any).score" color="gray" variant="soft">Score: {{ (sec.item as any).score }}</UBadge>
                 </div>
                 
                 <!-- Expandable Details -->
                 <UAccordion :items="[{ label: 'Ingredients & Details', slot: 'details' }]" class="mt-4">
                    <template #details>
                        <div class="p-2 space-y-2">
                            <h4 class="font-bold text-sm">Ingredients:</h4>
                            <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                <li v-for="ing in (sec.item as any).ingredients" :key="ing.ingredientId">
                                    {{ ing.quantity }} {{ ing.unit }} {{ ing.name || ing.ingredient?.name }}
                                    <span v-if="ing.optional" class="text-xs text-gray-500">(Optional)</span>
                                </li>
                            </ul>
                            
                            <div v-if="(sec.item as any).attributes?.length" class="pt-2">
                                <h4 class="font-bold text-sm">Tags:</h4>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <UBadge v-for="attr in (sec.item as any).attributes" :key="attr.id" size="xs" variant="subtle">
                                        {{ attr.value }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>
                    </template>
                 </UAccordion>

                 <!-- Issues / Notes display -->
                 <div v-if="(sec.item as any).issues?.length" class="mt-2 text-xs text-orange-500">
                    <div v-for="iss in (sec.item as any).issues">{{ iss }}</div>
                 </div>
             </div>
             <div v-else class="text-gray-400 italic">No option selected</div>
          </UCard>
        </div>
      </div>

      <!-- Shopping List -->
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
    </div>
  </UContainer>
</template>
