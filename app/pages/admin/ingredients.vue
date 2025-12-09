<script setup lang="ts">
import type { Ingredient } from '~/shared/types'

const { data: ingredients, refresh } = await useFetch<Ingredient[]>('/api/ingredients')
const toast = useToast()

const isOpen = ref(false)
const newIngredientName = ref('')
const loading = ref(false)

async function addIngredient() {
  if (!newIngredientName.value) return
  loading.value = true
  try {
    await $fetch('/api/ingredients', {
      method: 'POST',
      body: { name: newIngredientName.value }
    })
    toast.add({ title: 'Success', description: 'Ingredient added' })
    newIngredientName.value = ''
    isOpen.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.statusMessage || 'Failed to add ingredient', color: 'red' })
  } finally {
    loading.value = false
  }
}

async function deleteIngredient(id: string) {
  if (!confirm('Are you sure?')) return
  try {
    await $fetch(`/api/ingredients/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Deleted', description: 'Ingredient removed' })
    refresh()
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed', color: 'red' })
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Ingredients List</h2>
      <UButton icon="i-heroicons-plus" @click="isOpen = true">Add Ingredient</UButton>
    </div>

    <UCard>
      <UTable :rows="ingredients || []" :columns="[{ key: 'name', label: 'Name' }, { key: 'actions', label: '' }]">
        <template #actions-data="{ row }">
          <UButton 
            color="red" 
            variant="ghost" 
            icon="i-heroicons-trash" 
            size="xs"
            @click="deleteIngredient(row.id)"
          />
        </template>
      </UTable>
    </UCard>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="font-bold">New Ingredient</h3>
        </template>
        
        <form @submit.prevent="addIngredient" class="space-y-4">
          <UFormField label="Name" required>
            <UInput v-model="newIngredientName" placeholder="e.g. Tomatoes" autofocus />
          </UFormField>
          
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
            <UButton type="submit" :loading="loading">Create</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
