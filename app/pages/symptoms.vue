<script setup lang="ts">


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
        symptoms.value = await $fetch('/api/symptoms')
    } catch (e) {
        console.error(e)
    }
}

const fetchDefinitions = async () => {
     try {
        definitions.value = await $fetch('/api/symptoms/definitions')
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    fetchSymptoms()
    fetchDefinitions()
})

const openNewSymptom = () => {
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

const onNameChange = () => {
    // If name matches a definition, pre-fill color
    const def = definitions.value.find(d => d.name.toLowerCase() === editingSymptom.value.name.toLowerCase())
    if (def && isNew.value) {
        editingSymptom.value.color = def.color
    }
}

const saveSymptom = async () => {
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
             <UTable :rows="symptoms.filter(x => x.end_date)" :columns="[{ key: 'name', label: 'Nom' }, { key: 'begin_date', label: 'Début' }, { key: 'end_date', label: 'Fin' }, { key: 'severity', label: 'Sévérité' }]">
                <template #begin_date-data="{ row }">{{ formatDate(row.begin_date) }}</template>
                <template #end_date-data="{ row }">{{ formatDate(row.end_date) }}</template>
                <template #severity-data="{ row }">
                     <UBadge :color="(row.color as any)">{{ row.severity }}/10</UBadge>
                </template>
             </UTable>
        </div>

        <UModal v-model="isModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="text-lg font-bold">{{ isNew ? 'Nouveau' : 'Modifier' }} symptôme</div>
                    </template>

                    <div class="space-y-4">
                        <UFormGroup label="Nom">
                            <UInputMenu
                                v-model="editingSymptom.name"
                                :options="definitions.map(d => d.name)"
                                creatable
                                @change="onNameChange"
                            />
                        </UFormGroup>

                        <UFormGroup label="Sévérité">
                            <div class="flex items-center gap-4">
                                <USlider 
                                    v-model="editingSymptom.severity" 
                                    :min="1" 
                                    :max="10" 
                                    :color="(editingSymptom.color as any) || 'neutral'"
                                />
                                <div class="text-[10px] text-center font-bold" :class="`text-${editingSymptom.color}-500`">{{ editingSymptom.severity }}</div>
                            </div>
                        </UFormGroup>

                        <UFormGroup label="Couleur">
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
                        </UFormGroup>

                        <UFormGroup label="Commentaires">
                            <UTextarea v-model="editingSymptom.comments" />
                        </UFormGroup>
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
