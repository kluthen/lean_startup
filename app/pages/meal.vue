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
      <UButton to="/" icon="i-heroicons-home" variant="soft">Retour à l'accueil</UButton>
    </div>
    
    <div v-if="mealState?.warning" class="mb-6">
        <UAlert title="Warning" :description="mealState.warning" color="warning" variant="subtle" icon="i-heroicons-exclamation-triangle" />
    </div>

    <div class="grid lg:grid-cols-3 gap-10">
      <!-- Constraints Sidebar -->
      <MealGuests :guests="guests" :attributes="attributes" />

      <!-- Menu Card matches layout -->
      <div :class="guests && guests.length ? 'lg:col-span-1' : 'lg:col-span-2'">
        <h2 class="text-3xl font-serif font-bold mb-6 text-primary-600 dark:text-primary-400">
          Menu proposé
        </h2>
        <div class="space-y-6">
          <MealSectionCard 
            v-for="sec in sections" 
            :key="sec.id" 
            :section="sec"
            @swap="(newItem: Recipe) => swapItem(sec.id as any, newItem)"
            @open-swap-modal="(ing: any) => openSwapModal(ing, sec.id)"
          />
        </div>
      </div>

      <!-- Shopping List -->
      <MealShoppingList :shoppingList="shoppingList" />
    </div>
  </UContainer>

  <!-- Swap Ingredient Modal -->
  <MealSwapModal 
    v-model:open="isSwapModalOpen"
    :ingredient="swappingIngredient"
    :alternatives="swapAlternatives"
    :loading="isLoadingAlternatives"
    @confirm="confirmIngredientSwap"
  />
</template>
