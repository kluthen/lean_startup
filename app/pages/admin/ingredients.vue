<script setup lang="ts">
import type { Ingredient } from '~~/shared/types'

const { data: ingredients, refresh } = await useFetch<Ingredient[]>('/api/ingredients')
const toast = useToast()

const isOpen = ref(false)
const newIngredientName = ref('')
const loading = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

async function addIngredient() {
  if (!newIngredientName.value) return
  loading.value = true
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/ingredients/${editingId.value}`, {
        method: 'PUT',
        body: { name: newIngredientName.value }
      })
      toast.add({ title: 'Success', description: 'Ingredient updated' })
    } else {
      await $fetch('/api/ingredients', {
        method: 'POST',
        body: { name: newIngredientName.value }
      })
      toast.add({ title: 'Success', description: 'Ingredient added' })
    }
    
    newIngredientName.value = ''
    isOpen.value = false
    isEditing.value = false
    editingId.value = null
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.statusMessage || 'Failed to save', color: 'error' })
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
    toast.add({ title: 'Error', description: 'Failed', color: 'error' })
  }
}

function openEdit(ingredient: Ingredient) {
  newIngredientName.value = ingredient.name
  editingId.value = ingredient.id
  isEditing.value = true
  isOpen.value = true
}

function close() {
  isOpen.value = false
  isEditing.value = false
  editingId.value = null
  newIngredientName.value = ''
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Ingredients List</h2>
      <UButton icon="i-heroicons-plus" @click="isOpen = true; isEditing = false; newIngredientName = ''">Add Ingredient</UButton>
    </div>

    <UCard>
      <UTable 
        :data="ingredients || []" 
        :columns="[
            { accessorKey: 'name', header: 'Name' }, 
            { accessorKey: 'actions', header: '' }
        ]"
      >
        <template #actions-cell="{ row }">
          <div class="flex gap-1 justify-end">
             <UButton 
                color="primary" 
                variant="ghost" 
                icon="i-heroicons-pencil" 
                size="xs"
                @click="openEdit(row.original)"
             />
             <UButton 
                color="error" 
                variant="ghost" 
                icon="i-heroicons-trash" 
                size="xs"
                @click="deleteIngredient(row.original.id)"
             />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Ingredient' : 'New Ingredient'">
      <template #body>
        <form @submit.prevent="addIngredient" class="space-y-4">
          <UFormField label="Name" required>
            <UInput v-model="newIngredientName" placeholder="e.g. Tomatoes" autofocus />
          </UFormField>
          
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="close">Cancel</UButton>
            <UButton type="submit" :loading="loading">{{ isEditing ? 'Update' : 'Create' }}</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
