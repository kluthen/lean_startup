<script setup lang="ts">
import type { FoodAttribute } from '~~/shared/types'
const { user } = useAuth()

interface Profile {
    id: string;
    user_id: string;
    name: string;
    type: string;
    constraints: any;
}

const { data: attributesRaw } = await useFetch<FoodAttribute[]>('/api/attributes')
const { data: userProfiles } = await useFetch<Profile[]>('/api/profile', {
    immediate: !!user.value
})

const attributes = computed(() => {
  return attributesRaw.value?.map(attr => ({
    id: attr.id,
    label: `${attr.type}: ${attr.value}`,
    attr_value: attr.value,
    attr_type: attr.type
  })) || []
})

// Helper functions & Constants
const weights: { label: string; value: string; step: number; color: 'error' | 'warning' | 'success' | 'primary' }[] = [
  { label: 'Interdit', value: '--', step: 0, color: 'error' },
  { label: 'Eviter', value: '-', step: 1, color: 'warning' },
  { label: 'Preferer', value: '+', step: 2, color: 'success' },
  { label: 'Obligatoire', value: '++', step: 3, color: 'primary' },
]

function getWeightByStep(step: number) {
    return weights.find(w => w.step === step) || weights[0]
}

function getStepByWeight(weight: string) {
    return weights.find(w => w.value === weight)?.step || 0
}

interface Constraint {
    attributeId: string;
    weight: string;
    stepValue: number;
}

interface Guest {
    id: string;
    name: string;
    constraints: Constraint[];
    isProfile?: boolean;
}

function mapProfileToGuest(profile: Profile): Guest {
    const constraints: Constraint[] = []
    if (profile.constraints) {
        for (const [key, val] of Object.entries(profile.constraints)) {
             if (typeof val === 'number') {
                 constraints.push({
                     attributeId: key,
                     stepValue: val,
                     weight: getWeightByStep(val)?.value || '--'
                 })
             }
        }
    }
    
    return {
        id: profile.id, 
        name: profile.name,
        constraints,
        isProfile: true
    }
}

// State
const mealConstraints = useState<any[]>('mealConstraints')
const guests = ref<Guest[]>([
  { id: '1', name: 'Invité 1', constraints: [] }
])

// Load profiles if user is logged in
watchEffect(() => {
    if (user.value && userProfiles.value) {
        const me = userProfiles.value.find(p => p.type === 'me')
        
        // If we only have the default initial guest and it's empty, replace with 'me'
        if (guests.value.length === 1 && guests.value[0].name === 'Invité 1' && guests.value[0].constraints.length === 0 && !guests.value[0].isProfile) {
             if (me) {
                 guests.value = [mapProfileToGuest(me)]
             }
        }
    }
})

function addGuest() {
  guests.value.push({
    id: `guest-${Date.now()}`,
    name: `Invité ${guests.value.length + 1}`,
    constraints: []
  })
}

// Add Profile to guests
function addProfileToGuests(profileId: string) {
    const profile = userProfiles.value?.find(p => p.id === profileId)
    if (profile) {
        if (guests.value.find(g => g.id === profile.id)) return
        guests.value.push(mapProfileToGuest(profile))
    }
}

function addConstraint(guestIndex: number) {
  guests.value[guestIndex]?.constraints.push({ attributeId: '', weight: '--', stepValue: 0 })
}

function removeConstraint(guestIndex: number, cIndex: number) {
  guests.value[guestIndex]?.constraints.splice(cIndex, 1)
}

// Generation
const router = useRouter()
const loading = ref(false)

async function generate() {
  loading.value = true
  
  // Flatten constraints
  const flatConstraints = guests.value.flatMap(g => 
    g.constraints.map(c => {
       // Handle cases where USelectMenu might return an object instead of value if not configured correctly, 
       // but here we typings say string. We'll trust v-model but keep safety if needed.
       // Actually USelectMenu with value-attribute should return the value.
       const attrId = typeof c.attributeId === 'object' ? (c.attributeId as any).id : c.attributeId
       return {
          guestId: g.name,
          attributeId: attrId,
          weight: getWeightByStep(c?.stepValue)?.value || '--'
       }
    })
  ).filter(c => c.attributeId) // Ensure ID is set

  try {
    const mealState = useState('mealData')
    const constraintsState = useState('mealConstraints')
    
    // Sanitize state for consumption by meal.vue
    const cleanGuests = guests.value.map(g => ({
        ...g,
        constraints: g.constraints.map(c => ({
            ...c,
            attributeId: typeof c.attributeId === 'object' ? (c.attributeId as any).id : c.attributeId,
            weight: getWeightByStep(c?.stepValue)?.value || '--' 
        }))
    }))
    
    const result = await $fetch('/api/generate', {
      method: 'POST',
      body: { constraints: flatConstraints }
    })
    
    constraintsState.value = cleanGuests 
    mealState.value = result
    router.push('/meal')
    
  } catch (e) {
    alert('Error generating meal')
  } finally {
    loading.value = false
  }
}

// Filter out profiles already in guests
const availableProfiles = computed(() => {
    if (!userProfiles.value) return []
    return userProfiles.value.filter(p => !guests.value.find(g => g.id === p.id))
})
</script>

<template>
  <UContainer class="py-10">
    <!-- Authenticated User Profile Selector -->
    <div v-if="user && availableProfiles.length > 0" class="mb-8">
        <div class="flex gap-2 flex-wrap">
            <UButton 
                v-for="profile in availableProfiles" 
                :key="profile.id"
                variant="soft"
                icon="i-heroicons-plus"
                @click="addProfileToGuests(profile.id)"
            >
                Add {{ profile.name }}
            </UButton>
        </div>
    </div>

    <!-- Guest Forms -->
    <div class="space-y-8 max-w-4xl mx-auto">
      <UCard v-for="(guest, gIdx) in guests" :key="guest.id">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
              <UAvatar v-if="guest.isProfile" :alt="guest.name" size="sm" />
              <UInput v-model="guest.name" class="font-bold text-lg" variant="none" placeholder="Nom de l'invité" :disabled="!!guest.isProfile" />
          </div>
          <UButton v-if="guests.length > 1" color="error" variant="ghost" icon="i-heroicons-trash" @click="guests.splice(gIdx, 1)" />
        </div>

        <div class="space-y-3">
          <div v-for="(constraint, cIdx) in guest.constraints" :key="cIdx" class="flex gap-2 items-center">
             <USelectMenu 
                v-model="constraint.attributeId" 
                :items="attributes"
                valueKey="id"
                placeholder="Restriction..."
                class="flex-1"
             />
             
             <div class="w-48 flex flex-col gap-1">
                 <USlider 
                    :key="constraint.stepValue"
                    v-model="constraint.stepValue" 
                    :min="0" 
                    :max="3" 
                    :step="1"
                    :color="getWeightByStep(constraint.stepValue)?.color"
                 />
                 <div class="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                    <span :class="{'text-red-500': constraint.stepValue === 0}">--</span>
                    <span :class="{'text-orange-500': constraint.stepValue === 1}">-</span>
                    <span :class="{'text-green-500': constraint.stepValue === 2}">+</span>
                    <span :class="{'text-primary-500': constraint.stepValue === 3}">++</span>
                 </div>
                 <div class="text-xs text-center font-medium" :class="`text-${getWeightByStep(constraint.stepValue)?.color}-500`">
                    {{ getWeightByStep(constraint.stepValue)?.label }}
                 </div>
             </div>
             
             <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="removeConstraint(gIdx, cIdx)" />
          </div>

          <div class="pt-2">
            <UButton size="sm" variant="soft" icon="i-heroicons-plus" @click="addConstraint(gIdx)">
              Ajouter une restriction
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex justify-center flex-col items-center gap-4 mt-8">
        <UButton variant="outline" icon="i-heroicons-user-plus" @click="addGuest">
          Ajouter un autre invité
        </UButton>
        <UButton size="xl" @click="generate" :loading="loading" class="px-12">
          Générer le menu
        </UButton>
      </div>
    </div>
  </UContainer>
</template>