<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'

const UBadge = resolveComponent('UBadge')
const table = useTemplateRef('table')


interface Symptom {
    id: string
    user_id: string
    name: string
    begin_date: string
    end_date?: string
    last_update: string
    severity: number
    comments?: string
    color: string
}

const { user } = useAuth()
const toast = useToast()

const symptoms = ref<Symptom[]>([])
const definitions = ref<{ name: string; color: string }[]>([])
const loading = ref(false)

// Edit/Create Modal
const isModalOpen = ref(false)
const editingSymptom = ref<any>({})
const isNew = ref(false)

const colors = [
    { label: 'Red', value: 'red', hex: 'bg-red-500' },
    { label: 'Orange', value: 'orange', hex: 'bg-orange-500' },
    { label: 'Amber', value: 'amber', hex: 'bg-amber-500' },
    { label: 'Yellow', value: 'yellow', hex: 'bg-yellow-500' },
    { label: 'Lime', value: 'lime', hex: 'bg-lime-500' },
    { label: 'Green', value: 'green', hex: 'bg-green-500' },
    { label: 'Emerald', value: 'emerald', hex: 'bg-emerald-500' },
    { label: 'Teal', value: 'teal', hex: 'bg-teal-500' },
    { label: 'Cyan', value: 'cyan', hex: 'bg-cyan-500' },
    { label: 'Sky', value: 'sky', hex: 'bg-sky-500' },
    { label: 'Blue', value: 'blue', hex: 'bg-blue-500' },
    { label: 'Indigo', value: 'indigo', hex: 'bg-indigo-500' },
    { label: 'Violet', value: 'violet', hex: 'bg-violet-500' },
    { label: 'Purple', value: 'purple', hex: 'bg-purple-500' },
    { label: 'Fuchsia', value: 'fuchsia', hex: 'bg-fuchsia-500' },
    { label: 'Pink', value: 'pink', hex: 'bg-pink-500' },
    { label: 'Rose', value: 'rose', hex: 'bg-rose-500' },
    { label: 'Gray', value: 'gray', hex: 'bg-gray-500' }
]

const fetchSymptoms = async () => {
    try {
        symptoms.value = await $fetch<Symptom[]>('/api/symptoms')
    } catch (e) {
        console.error(e)
    }
}

const fetchDefinitions = async () => {
     try {
        definitions.value = await $fetch<{ name: string; color: string }[]>('/api/symptoms/definitions')
        console.log('[Frontend] Definitions fetched:', definitions.value)
    } catch (e) {
        console.error(e)
    }
}

const symptomOptions = computed(() => definitions.value.map(d => d.name))


onMounted(() => {
    fetchSymptoms()
    fetchDefinitions()
})


const openNewSymptom = () => {
    console.log('[Frontend] Opening new symptom modal')
    isNew.value = true
    editingSymptom.value = { 
        name: '', 
        severity: 5, 
        comments: '', 
        color: 'red' // Default
    }
    isModalOpen.value = true
}

const openEditSymptom = (s: any) => {
    isNew.value = false
    editingSymptom.value = { ...s }
    isModalOpen.value = true
}

const onNameChange = (val: any) => {
    console.log('[Frontend] Name changed:', val, 'Current model:', editingSymptom.value.name)
    // If name matches a definition, pre-fill color
    if (!editingSymptom.value.name) return
    const def = definitions.value.find(d => d.name.toLowerCase() === editingSymptom.value.name.toLowerCase())
    if (def && isNew.value) {
        console.log('[Frontend] Found definition, checking color:', def.color)
        editingSymptom.value.color = def.color
    }
}

const saveSymptom = async () => {
    console.log('[Frontend] Saving symptom:', editingSymptom.value)

    try {
        if (isNew.value) {
            await $fetch('/api/symptoms', {
                method: 'POST',
                body: editingSymptom.value
            })
        } else {
             await $fetch(`/api/symptoms/${editingSymptom.value.id}`, {
                method: 'PUT',
                body: editingSymptom.value
            })
        }
        isModalOpen.value = false
        await fetchSymptoms()
        await fetchDefinitions() // Refresh definitions in case new name
        toast.add({ title: 'Succès' })
    } catch (e) {
        toast.add({ title: 'Erreur', color: 'error' })
    }
}

const endSymptom = async (id: string) => {
    try {
        await $fetch(`/api/symptoms/${id}/end`, { method: 'PATCH' })
        await fetchSymptoms()
    } catch (e) {
        toast.add({ title: 'Erreur', color: 'error' })
    }
}

function formatDate(d: string) {
    if(!d) return ''
    return new Date(d).toLocaleString()
}
// Table configuration
const historySymptoms = computed(() => symptoms.value.filter(x => x.end_date))

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

const globalFilter = ref('')

// Table configuration


const columns = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }: any) => {
      const color = row.original.color
      const name = row.getValue('name')
      return h(UBadge as any, { color: color, variant: 'subtle' }, () => name)
    }
  },
  {
    accessorKey: 'begin_date',
    header: 'Début',
    cell: ({ row }: any) => formatDate(row.getValue('begin_date'))
  },
  {
    accessorKey: 'end_date',
    header: 'Fin',
    cell: ({ row }: any) => formatDate(row.getValue('end_date'))
  },
  {
    accessorKey: 'severity',
    header: 'Sévérité',
    cell: ({ row }: any) => {
      const color = row.original.color
      const severity = row.getValue('severity')
      return h(UBadge as any, { color: color, variant: 'subtle' }, () => `${severity}/10`)
    }
  }
]
</script>

<template>
    <UContainer class="py-10">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Suivi des symptômes</h1>
            <UButton icon="i-heroicons-plus" @click="openNewSymptom">Nouveau symptôme</UButton>
        </div>

        <div class="space-y-4">
            <h2 class="text-lg font-semibold">En cours</h2>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <UCard v-for="s in symptoms.filter(x => !x.end_date)" :key="s.id" :class="`border-l-4 border-${s.color}-500`">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">{{ s.name }}</h3>
                        <UBadge :color="(s.color as any)">{{ s.severity }}/10</UBadge>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">Début: {{ formatDate(s.begin_date) }}</div>
                    <div class="text-xs text-gray-500 mb-2">MAJ: {{ formatDate(s.last_update) }}</div>
                    <p class="text-sm italic mb-4">{{ s.comments }}</p>
                    
                    <div class="flex justify-end gap-2">
                         <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" @click="openEditSymptom(s)">Modifier</UButton>
                         <UButton size="xs" color="success" variant="soft" icon="i-heroicons-check" @click="endSymptom(s.id)">Terminer</UButton>
                    </div>
                 </UCard>
                 <div v-if="!symptoms.some(x => !x.end_date)" class="text-gray-500 italic col-span-full">Aucun symptôme en cours</div>
            </div>

            <h2 class="text-lg font-semibold mt-8">Historique</h2>
             <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 gap-4 justify-between items-center">
                <UInput v-model="globalFilter" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass-20-solid" />
             </div>
             <UTable 
                ref="table"
                v-model:pagination="pagination"
                v-model:global-filter="globalFilter"
                :data="historySymptoms" 
                :columns="columns"
                :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }"
             />
             <div class="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4 px-4">
                <UPagination
                    :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                    :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                    :total="table?.tableApi?.getFilteredRowModel().rows.length"
                    @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
                />
            </div>
        </div>

        <UModal v-model:open="isModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="text-lg font-bold">{{ isNew ? 'Nouveau' : 'Modifier' }} symptôme</div>
                    </template>

                    <div class="space-y-4">
                        <UFormField label="Nom">
                            <UInputMenu
                                v-model="editingSymptom.name"
                                :options="symptomOptions"
                                creatable
                                @change="onNameChange"
                            />
                        </UFormField>

                        <UFormField label="Sévérité">
                            <div class="flex items-center gap-4">
                                <USlider 
                                    v-model="editingSymptom.severity" 
                                    :min="1" 
                                    :max="10" 
                                    :color="(editingSymptom.color as any) || 'neutral'"
                                />
                                <div class="text-[10px] text-center font-bold" :class="`text-${editingSymptom.color}-500`">{{ editingSymptom.severity }}</div>
                            </div>
                        </UFormField>

                        <UFormField label="Couleur">
                            <div class="flex flex-wrap gap-2">
                                <div 
                                    v-for="c in colors" 
                                    :key="c.value"
                                    class="w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-1"
                                    :class="[c.hex, editingSymptom.color === c.value ? 'ring-gray-400' : 'ring-transparent']"
                                    :title="c.label"
                                    @click="editingSymptom.color = c.value"
                                />
                            </div>
                        </UFormField>

                        <UFormField label="Commentaires">
                            <UTextarea v-model="editingSymptom.comments" />
                        </UFormField>
                    </div>

                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Annuler</UButton>
                            <UButton @click="saveSymptom">Enregistrer</UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
