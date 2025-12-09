<script setup lang="ts">
import type { Recipe } from '~/shared/types'

const mealState = useState<{ proteine: Recipe, feculent: Recipe, accompagnement: Recipe, sauce: Recipe, warning?: string }>('mealData')
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
    <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost" class="mb-6">Back to Settings</UButton>
    
    <div v-if="mealState?.warning" class="mb-6">
        <UAlert title="Warning" :description="mealState.warning" color="orange" variant="subtle" icon="i-heroicons-exclamation-triangle" />
    </div>

    <div class="grid lg:grid-cols-2 gap-10">
      <!-- Menu Card -->
      <div>
        <h2 class="text-3xl font-serif font-bold mb-6 text-primary-600 dark:text-primary-400">
          Proposed Menu
        </h2>
        <div class="space-y-6">
          <UCard v-for="sec in sections" :key="sec.label" :class="{'opacity-50': !sec.item}">
             <template #header>
                <div class="text-xs uppercase tracking-widest text-gray-500">{{ sec.label }}</div>
             </template>
             <div v-if="sec.item">
                 <h3 class="text-xl font-bold">{{ sec.item.name }}</h3>
                 <p class="text-gray-600 dark:text-gray-400">{{ sec.item.description }}</p>
                 
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
