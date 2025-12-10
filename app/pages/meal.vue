<script setup lang="ts">
import type { FoodAttribute, Recipe } from '~~/shared/types';


const { data: attributes } = await useFetch<FoodAttribute[]>('/api/attributes')

// Updated State Type
interface MealSection {
    selected: Recipe | null;
    alternatives: Recipe[];
}
interface MealData {
    proteine: MealSection;
    feculent: MealSection;
    accompagnement: MealSection;
    sauce: MealSection;
    warning?: string;
}

const mealState = useState<MealData>('mealData')
const guests = useState<any[]>('mealConstraints')
const router = useRouter()

if (!mealState.value) {
  router.push('/')
}

const sections = computed(() => [
  { id: 'proteine', label: 'Protein', data: mealState.value?.proteine },
  { id: 'feculent', label: 'Starch', data: mealState.value?.feculent },
  { id: 'accompagnement', label: 'Side', data: mealState.value?.accompagnement },
  { id: 'sauce', label: 'Sauce', data: mealState.value?.sauce },
])

const shoppingList = computed(() => {
    if (!mealState.value) return []
    const list: any[] = []
    
    sections.value.forEach(sec => {
        const item = sec.data?.selected
        if(item && (item as any).ingredients) {
            (item as any).ingredients.forEach((ing: any) => {
                list.push({
                    name: ing.name || ing.ingredient?.name,
                    qty: ing.quantity,
                    unit: ing.unit,
                    for: item.name
                })
            })
        }
    })
    return list
})

function swapItem(sectionId: keyof MealData, newItem: Recipe) {
    if (mealState.value && mealState.value[sectionId]) {
        (mealState.value[sectionId] as MealSection).selected = newItem
    }
}

// Ingredient Swapping Logic
const isSwapModalOpen = ref(false)
const swappingIngredient = ref<any>(null)
const swapAlternatives = ref<any[]>([])
const isLoadingAlternatives = ref(false)
const activeSectionId = ref<string | null>(null)

async function openSwapModal(ing: any, sectionId: string) {
    swappingIngredient.value = ing
    activeSectionId.value = sectionId
    swapAlternatives.value = []
    isLoadingAlternatives.value = true
    isSwapModalOpen.value = true

    try {
        const alternatives = await $fetch('/api/ingredients/alternatives', {
            method: 'POST',
            body: {
                ingredientId: ing.ingredientId || ing.id, // Handle different shapes if necessary
                constraints: guests.value.flatMap(g => g.constraints)
            }
        })
        swapAlternatives.value = alternatives
    } catch (e) {
        console.error('Failed to fetch alternatives', e)
        // Optionally show error toast
    } finally {
        isLoadingAlternatives.value = false
    }
}

function confirmIngredientSwap(newIng: any) {
    if (!mealState.value || !activeSectionId.value || !swappingIngredient.value) return

    // Find the section and recipe
    const section = mealState.value[activeSectionId.value as keyof MealData]
    if (section && typeof section !== 'string' && section.selected) {
        const recipe = section.selected as any
        // Find ingredient index
        const idx = recipe.ingredients.findIndex((i: any) => i.ingredientId === swappingIngredient.value.ingredientId)
        if (idx !== -1) {
            // Update the ingredient in place
            // We keep quantity/unit but change name and id
            recipe.ingredients[idx] = {
                ...recipe.ingredients[idx],
                ingredientId: newIng.id,
                name: newIng.name,
                ingredient: { ...newIng } // Update nested object if used for display
            }
            // Trigger reactivity? Vue 3 deep reactivity should handle this if state is proper
        }
    }
    isSwapModalOpen.value = false
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost">Back to Settings</UButton>
    </div>
    
    <div v-if="mealState?.warning" class="mb-6">
        <UAlert title="Warning" :description="mealState.warning" color="warning" variant="subtle" icon="i-heroicons-exclamation-triangle" />
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

      <!-- Menu Card matches layout -->
      <div :class="guests && guests.length ? 'lg:col-span-1' : 'lg:col-span-2'">
        <h2 class="text-3xl font-serif font-bold mb-6 text-primary-600 dark:text-primary-400">
          Proposed Menu
        </h2>
        <div class="space-y-6">
          <UCard v-for="sec in sections" :key="sec.id" :class="{'opacity-50': !sec.data?.selected}">
             <template #header>
                <div class="flex justify-between items-center">
                    <div class="text-xs uppercase tracking-widest text-gray-500">{{ sec.label }}</div>
                    
                    <!-- Swap Control -->
                    <USelectMenu 
                        v-if="sec.data?.alternatives && sec.data.alternatives.length > 1"
                        :model-value="sec.data.selected ?? undefined"
                        @update:model-value="(val) => swapItem(sec.id as any, val)"
                        :items="sec.data.alternatives"
                        option-attribute="name"
                        placeholder="Swap..."
                        class="w-48"
                        size="xs"
                    />
                </div>
             </template>
             <div v-if="sec.data?.selected">
                 <div class="flex justify-between items-start">
                     <div>
                        <h3 class="text-xl font-bold">{{ sec.data.selected.name }}</h3>
                        <p class="text-gray-600 dark:text-gray-400">{{ sec.data.selected.description }}</p>
                     </div>
                     <UBadge v-if="(sec.data.selected as any).score" color="neutral" variant="soft">Score: {{ (sec.data.selected as any).score }}</UBadge>
                 </div>
                 
                 <!-- Expandable Details -->
                 <UAccordion :items="[{ label: 'Ingredients & Details', slot: 'details' }]" class="mt-4">
                    <template #details>
                        <div class="p-2 space-y-2">
                            <h4 class="font-bold text-sm">Ingredients:</h4>
                            <ul class="space-y-1 mt-2">
                                <li v-for="ing in (sec.data.selected as any).ingredients" :key="ing.ingredientId" class="flex items-center gap-2 group text-sm text-gray-700 dark:text-gray-300">
                                    <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span>
                                        {{ ing.quantity }} {{ ing.unit }} {{ ing.name || ing.ingredient?.name }}
                                        <span v-if="ing.optional" class="text-xs text-gray-500">(Optional)</span>
                                    </span>
                                    
                                    <UButton 
                                        icon="i-heroicons-arrow-path" 
                                        size="xs" 
                                        color="neutral" 
                                        variant="ghost" 
                                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                                        @click="openSwapModal(ing, sec.id)"
                                        title="Swap ingredient"
                                    />
                                </li>
                            </ul>
                            
                            <div v-if="(sec.data.selected as any).attributes?.length" class="pt-2">
                                <h4 class="font-bold text-sm">Tags:</h4>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <UBadge v-for="attr in (sec.data.selected as any).attributes" :key="attr.id" size="xs" variant="subtle">
                                        {{ attr.value }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>
                    </template>
                 </UAccordion>

                 <!-- Issues / Notes display -->
                 <div v-if="(sec.data.selected as any).issues?.length" class="mt-2 text-xs text-orange-500">
                    <div v-for="iss in (sec.data.selected as any).issues">{{ iss }}</div>
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
    <!-- Swap Ingredient Modal -->
    <UModal v-model="isSwapModalOpen">
        <UCard>
            <template #header>
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold">Swap Ingredient</h3>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="isSwapModalOpen = false" />
                </div>
                <div class="text-sm text-gray-500 mt-1">Replacing <span class="font-medium text-gray-900 dark:text-gray-100">{{ swappingIngredient?.name }}</span></div>
            </template>
            
            <div v-if="isLoadingAlternatives" class="flex justify-center p-8">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-primary-500" />
            </div>
            <div v-else-if="swapAlternatives.length === 0" class="text-center p-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <UIcon name="i-heroicons-face-frown" class="text-4xl mb-2 text-gray-400" />
                <p>No compatible alternatives found matching the current guest constraints.</p>
            </div>
            <div v-else class="space-y-2 max-h-60 overflow-y-auto p-1">
                <UButton
                    v-for="alt in swapAlternatives"
                    :key="alt.id"
                    block
                    variant="soft"
                    color="neutral"
                    class="justify-start group"
                    @click="confirmIngredientSwap(alt)"
                >
                    <div class="text-left w-full">
                        <div class="font-medium group-hover:text-primary-600 transition-colors">{{ alt.name }}</div>
                        <div v-if="alt.attributes?.length" class="flex gap-1 mt-1">
                             <UBadge v-for="attr in alt.attributes" :key="attr.id" size="xs" variant="subtle" color="neutral">{{ attr.value }}</UBadge>
                        </div>
                    </div>
                </UButton>
            </div>
        </UCard>
    </UModal>
  </UContainer>
</template>
