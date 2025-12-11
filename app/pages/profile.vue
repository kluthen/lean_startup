<script setup lang="ts">
import type { FoodAttribute } from '~~/shared/types'
const { user } = useAuth()

interface Profile {
    id: string;
    user_id: string;
    name: string;
    type: string;
    constraints: any;
    created_at?: string;
}

const profiles = ref<Profile[]>([])
const loading = ref(false)

const { data: attributesRaw } = await useFetch<FoodAttribute[]>('/api/attributes')

const attributes = computed(() => {
  return attributesRaw.value?.map(attr => ({
    id: attr.id,
    label: `${attr.type}: ${attr.value}`,
    attr_value: attr.value,
    attr_type: attr.type
  })) || []
})

const weights: { label: string; value: string; step: number; color: 'error' | 'warning' | 'success' | 'primary' }[] = [
  { label: 'Interdit', value: '--', step: 0, color: 'error' },
  { label: 'Eviter', value: '-', step: 1, color: 'warning' },
  { label: 'Preferer', value: '+', step: 2, color: 'success' },
  { label: 'Obligatoire', value: '++', step: 3, color: 'primary' },
]

function getWeightByStep(step: number) {
    return weights.find(w => w.step === step) || weights[0]
}

const fetchProfiles = async () => {
    try {
        profiles.value = await $fetch<Profile[]>('/api/profile')
    } catch (e) {
        console.error(e)
    }
}

onMounted(fetchProfiles)

// Edit Modal
const isModalOpen = ref(false)
const editingProfile = ref<Partial<Profile>>({})
// We'll map the JSON constraints to a UI-friendly array
// JSON: { "uuid": 0, "uuid2": 2 }
// UI: [ { attributeId: "uuid", stepValue: 0 }, ... ]
const editingConstraints = ref<{ attributeId: string; stepValue: number }[]>([])

const openEditMatrix = (profile: Profile) => {
    editingProfile.value = profile
    
    // Parse JSON to UI array
    const c: { attributeId: string; stepValue: number }[] = []
    if (profile.constraints) {
        for (const [key, val] of Object.entries(profile.constraints)) {
            if (typeof val === 'number') {
                c.push({ attributeId: key, stepValue: val })
            }
        }
    }
    editingConstraints.value = c
    isModalOpen.value = true
}

const openNewProfile = () => {
    editingProfile.value = { name: '', type: 'family', constraints: {} }
    editingConstraints.value = []
    isModalOpen.value = true
}

const addConstraint = () => {
    editingConstraints.value.push({ attributeId: '', stepValue: 0 })
}

const removeConstraint = (index: number) => {
    editingConstraints.value.splice(index, 1)
}

const saveProfile = async () => {
    try {
        // Convert UI array back to JSON
        const constraintsObj: Record<string, number> = {}
        for (const c of editingConstraints.value) {
            if (c.attributeId) {
                // handle object (if select menu returns object) or string
                const id = typeof c.attributeId === 'object' ? (c.attributeId as any).id : c.attributeId
                constraintsObj[id] = c.stepValue
            }
        }

        if (editingProfile.value.id) {
            await $fetch(`/api/profile/${editingProfile.value.id}`, {
                method: 'PUT',
                body: {
                    name: editingProfile.value.name,
                    constraints: constraintsObj
                }
            })
        } else {
            await $fetch('/api/profile', {
                method: 'POST',
                body: {
                    name: editingProfile.value.name,
                    type: editingProfile.value.type,
                    constraints: constraintsObj
                }
            })
        }
        isModalOpen.value = false
        await fetchProfiles()
    } catch (e) {
        alert('Failed to save')
    }
}

const deleteProfile = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
        await $fetch(`/api/profile/${id}`, { method: 'DELETE' })
        await fetchProfiles()
    } catch (e) {
        alert('Failed to delete')
    }
}

function getAttributeLabel(id: string) {
    return attributes.value.find(a => a.id === id)?.label || id
}
</script>

<template>
    <UContainer class="py-10">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Manage Profiles</h1>
            <UButton icon="i-heroicons-plus" @click="openNewProfile">Add Profile</UButton>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UCard v-for="profile in profiles" :key="profile.id">
                <template #header>
                    <div class="flex justify-between">
                        <span class="font-bold">{{ profile.name }}</span>
                        <UBadge :color="profile.type === 'me' ? 'primary' : 'neutral'">{{ profile.type }}</UBadge>
                    </div>
                </template>

                <div class="text-sm space-y-1">
                    <div v-if="!profile.constraints || Object.keys(profile.constraints).length === 0" class="text-gray-400 italic">
                        No constraints
                    </div>
                    <div v-for="(val, key) in profile.constraints" :key="key" class="flex justify-between">
                        <span class="truncate pr-2">{{ getAttributeLabel(key as string) }}</span>
                        <span :class="`text-${getWeightByStep(val as number)?.color}-500 font-bold`">
                             {{ getWeightByStep(val as number)?.value }}
                        </span>
                    </div>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton size="sm" variant="ghost" icon="i-heroicons-pencil" @click="openEditMatrix(profile)" />
                        <UButton v-if="profile.type !== 'me'" size="sm" color="error" variant="ghost" icon="i-heroicons-trash" @click="deleteProfile(profile.id)" />
                    </div>
                </template>
            </UCard>
        </div>

        <!-- Edit Modal -->
        <UModal v-model="isModalOpen">
            <UCard class="overflow-visible"> 
                <template #header>
                    <div class="text-lg font-bold">{{ editingProfile?.id ? 'Edit' : 'New' }} Profile</div>
                </template>

                <div class="space-y-4">
                    <UFormGroup label="Name">
                        <UInput v-model="editingProfile.name" />
                    </UFormGroup>
                    
                    <UFormGroup v-if="!editingProfile.id || editingProfile.type !== 'me'" label="Type">
                        <UInput v-model="editingProfile.type" :disabled="!!editingProfile.id" />
                    </UFormGroup>

                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700">Constraints</label>
                        <div v-for="(constraint, idx) in editingConstraints" :key="idx" class="flex gap-2 items-center">
                             <USelectMenu 
                                v-model="constraint.attributeId" 
                                :items="attributes"
                                valueKey="id"
                                placeholder="Attribute..."
                                class="flex-1 min-w-0"
                             />
                             <div class="w-32 flex flex-col gap-1">
                                 <USlider 
                                    v-model="constraint.stepValue" :min="0" :max="3" :step="1"
                                    :color="getWeightByStep(constraint.stepValue)?.color"
                                 />
                                 <div class="text-[10px] text-center font-bold" :class="`text-${getWeightByStep(constraint.stepValue)?.color}-500`">
                                    {{ getWeightByStep(constraint.stepValue)?.label }}
                                 </div>
                             </div>
                             <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="removeConstraint(idx)" />
                        </div>
                        <UButton size="sm" variant="soft" icon="i-heroicons-plus" @click="addConstraint">Add Constraint</UButton>
                    </div>
                </div>

                <template #footer>
                     <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Cancel</UButton>
                        <UButton @click="saveProfile">Save</UButton>
                     </div>
                </template>
            </UCard>
        </UModal>
    </UContainer>
</template>
