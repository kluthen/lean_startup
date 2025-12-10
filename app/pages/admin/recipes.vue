<script setup lang="ts">
import type { Recipe, Ingredient, PlateElement, FoodAttribute } from '~~/shared/types'

const { data: recipes, refresh: refreshRecipes } = await useFetch<Recipe[]>('/api/recipes')
const { data: ingredients } = await useFetch<Ingredient[]>('/api/ingredients')
const { data: plateElements } = await useFetch<PlateElement[]>('/api/plate-elements')
const { data: attributesRaw } = await useFetch<FoodAttribute[]>('/api/attributes')

const attributes = computed(() => {
  return attributesRaw.value?.map(attr => ({
    id: attr.id,
    label: `${attr.type}: ${attr.value}`,
    attr_type: attr.type,
    attr_value: attr.value
  })) || []
})

const toast = useToast()
const isOpen = ref(false)
const loading = ref(false)
// Form State
const form = reactive({
  name: '',
  description: '',
  selectedPlateElements: [] as PlateElement[],
  selectedAttributes: [] as any[],
  ingredients: [] as { ingredientId: string; quantity: number; unit: string; optional: boolean; preparation?: string }[]
})
const isEditing = ref(false)
const editingId = ref<string | null>(null)

function resetForm() {
  form.name = ''
  form.description = ''
  form.selectedPlateElements = []
  form.selectedAttributes = []
  form.ingredients = []
  isEditing.value = false
  editingId.value = null
}

function editRecipe(recipe: Recipe) {
  resetForm()
  isEditing.value = true
  editingId.value = recipe.id
  form.name = recipe.name
  form.description = recipe.description || ''
  
  if ((recipe as any).plateElements) {
     form.selectedPlateElements = (recipe as any).plateElements.map((pe: any) => 
        plateElements.value?.find(p => p.id === pe.id) || pe
     )
  }
  
  if (recipe.attributes) {
     form.selectedAttributes = recipe.attributes.map((attr: any) => 
        attributes.value?.find(a => a.id === attr.id) || attr
     )
  }

  if (recipe.ingredients) {
    form.ingredients = recipe.ingredients.map(ri => ({
      ingredientId: ri.ingredientId,
      quantity: ri.quantity || 0,
      unit: ri.unit || '',
      optional: ri.optional,
      preparation: ri.preparation || ''
    }))
  }
  
  isOpen.value = true
}

function addIngredientRow() {
  form.ingredients.push({ ingredientId: '', quantity: 0, unit: '', optional: false, preparation: '' })
}

function removeIngredientRow(index: number) {
  form.ingredients.splice(index, 1)
}

async function createRecipe() {
  if (!form.name) return
  loading.value = true
  try {
    const payload = {
      ...form,
      plateElementIds: form.selectedPlateElements.map(e => e.id),
      attributeIds: form.selectedAttributes.map(a => a.id),
    }

    if (isEditing.value && editingId.value) {
       await $fetch(`/api/recipes/${editingId.value}`, {
         method: 'PUT',
         body: payload
       })
       toast.add({ title: 'Success', description: 'Recipe updated' })
    } else {
       await $fetch('/api/recipes', {
         method: 'POST',
         body: payload
       })
       toast.add({ title: 'Success', description: 'Recipe created' })
    }

    resetForm()
    isOpen.value = false
    refreshRecipes()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.statusMessage || 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function deleteRecipe(id: string) {
  if (!confirm('Delete recipe?')) return
  await $fetch(`/api/recipes/${id}`, { method: 'DELETE' })
  refreshRecipes()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Recipes</h2>
      <UButton icon="i-heroicons-plus" @click="isOpen = true">Add Recipe</UButton>
    </div>

    <div class="grid gap-4">
      <UCard v-for="recipe in recipes" :key="recipe.id">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg">{{ recipe.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ recipe.description }}</p>
            <div class="flex gap-2 flex-wrap">
              <UBadge v-for="pe in (recipe as any).plateElements" :key="pe.id" color="neutral" size="xs">
                {{ pe.label }}
              </UBadge>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton color="primary" variant="ghost" icon="i-heroicons-pencil" @click="editRecipe(recipe)" />
            <UButton color="error" variant="ghost" icon="i-heroicons-trash" @click="deleteRecipe(recipe.id)" />
          </div>
        </div>
      </UCard>
    </div>
 
    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Recipe' : 'New Recipe'" :ui="{ content: 'sm:max-w-3xl' }">
      <template #body>
        <form @submit.prevent="createRecipe" class="space-y-6">
          <div class="grid md:grid-cols-2 gap-4">
            <UFormField label="Name" required>
              <UInput v-model="form.name" />
            </UFormField>
            <UFormField label="Plate Category">
              <USelectMenu 
                v-model="form.selectedPlateElements" 
                :items="plateElements || []" 
                option-attribute="label"
                multiple 
                placeholder="Select category..."
              />
            </UFormField>
          </div>

          <UFormField label="Description">
            <UTextarea v-model="form.description" />
          </UFormField>

          <!-- Ingredients Section -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold text-sm">Ingredients</h4>
              <UButton size="xs" variant="soft" icon="i-heroicons-plus" @click="addIngredientRow">Add</UButton>
            </div>
            
            <div v-for="(item, idx) in form.ingredients" :key="idx" class="flex gap-2 mb-2 items-start">
              <USelectMenu
                v-model="item.ingredientId"
                :options="ingredients || []"
                option-attribute="name"
                value-attribute="id"
                searchable
                placeholder="Ingredient"
                class="flex-1"
              />
              <UInput v-model.number="item.quantity" type="number" placeholder="Qty" class="w-20" />
              <UInput v-model="item.unit" placeholder="Unit" class="w-24" />
              <UInput v-model="item.preparation" placeholder="Prep note" class="flex-1" />
              <div class="pt-2">
                  <UCheckbox v-model="item.optional" label="Opt" />
              </div>
              <UButton color="error" variant="ghost" icon="i-heroicons-x-mark" @click="removeIngredientRow(idx)" />
            </div>
          </div>
          
          <!-- Attributes Section (Tags) -->
           <UFormField label="Attributes / Tags">
              <USelectMenu 
                v-model="form.selectedAttributes" 
                :items="attributes || []" 
                multiple 
                searchable
                placeholder="Search attributes..."
              >
                 <template #item="{ item }">
                    <span class="truncate">{{ item.attr_type }}: {{ item.attr_value }}</span>
                 </template>
              </USelectMenu>
            </UFormField>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
            <UButton type="submit" :loading="loading">{{ isEditing ? 'Update' : 'Create' }}</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
