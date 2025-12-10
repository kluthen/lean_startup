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
      toast.add({ title: 'Success', description: 'Ingredient modifié' })
    } else {
      await $fetch('/api/ingredients', {
        method: 'POST',
        body: { name: newIngredientName.value }
      })
      toast.add({ title: 'Success', description: 'Ingredient ajouté' })
    }
    
    newIngredientName.value = ''
    isOpen.value = false
    isEditing.value = false
    editingId.value = null
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.statusMessage || 'Erreur lors de la sauvegarde', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function deleteIngredient(id: string) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingredient?')) return
  try {
    await $fetch(`/api/ingredients/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Deleted', description: 'Ingredient supprimé' })
    refresh()
  } catch (error) {
    toast.add({ title: 'Error', description: 'Erreur lors de la suppression', color: 'error' })
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
      <h2 class="text-xl font-semibold">Liste des ingredients</h2>
      <UButton icon="i-heroicons-plus" @click="isOpen = true; isEditing = false; newIngredientName = ''">Ajouter un ingredient</UButton>
    </div>

    <UCard>
      <UTable 
        :data="ingredients || []" 
        :columns="[
            { accessorKey: 'name', header: 'Nom' }, 
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

    <UModal v-model:open="isOpen" :title="isEditing ? 'Modifier un ingredient' : 'Ajouter un ingredient'">
      <template #body>
        <form @submit.prevent="addIngredient" class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="newIngredientName" placeholder="e.g. Tomatoes" autofocus />
          </UFormField>
          
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="close">Annuler</UButton>
            <UButton type="submit" :loading="loading">{{ isEditing ? 'Mettre à jour' : 'Créer' }}</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
