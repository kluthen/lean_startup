<script setup lang="ts">
import type { FoodAttribute } from '~~/shared/types'

const { data: attributesRaw } = await useFetch<FoodAttribute[]>('/api/attributes')

const attributes = computed(() => {
  return attributesRaw.value?.map(attr => ({
    id: attr.id,
    label: `${attr.type}: ${attr.value}`,
    attr_value: attr.value,
    attr_type: attr.type
  })) || []
})

// State
const mealConstraints = useState<any[]>('mealConstraints')
const guests = ref([
  { id: 1, name: 'Invité 1', constraints: [] as { attributeId: string, weight: string, stepValue: number }[] }
])

if (mealConstraints.value && mealConstraints.value.length) {
  guests.value = JSON.parse(JSON.stringify(mealConstraints.value))
}

const weights: { label: string; value: string; step: number; color: 'error' | 'warning' | 'success' | 'primary' }[] = [
  { label: 'Forbidden', value: '--', step: 0, color: 'error' },
  { label: 'Avoid', value: '-', step: 1, color: 'warning' },
  { label: 'Preferred', value: '+', step: 2, color: 'success' },
  { label: 'Mandatory', value: '++', step: 3, color: 'primary' },
]

function getWeightByStep(step: number) {
    return weights.find(w => w.step === step) || weights[0]
}

function getStepByWeight(weight: string) {
    return weights.find(w => w.value === weight)?.step || 0
}

function addGuest() {
  guests.value.push({
    id: guests.value.length + 1,
    name: `Invité ${guests.value.length + 1}`,
    constraints: []
  })
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
       const attrId = typeof c.attributeId === 'object' ? (c.attributeId as any).id : c.attributeId
       return {
          guestId: g.name,
          attributeId: attrId,
          weight: getWeightByStep(c?.stepValue)?.value || '--'
       }
    })
  ).filter(c => c.attributeId) // Ensure ID is set

  try {
    // We can pass data via state or query. For simplicity, let's use a store or just pass to next page via state
    // For this MVP, let's fetch here and show results locally or navigate.
    // Navigation is cleaner.
    
    // Store in localStorage or useNuxtState to pass to /meal
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
</script>

<template>
  <UContainer class="py-10">
    <!-- Guest Forms -->
    <div class="space-y-8 max-w-4xl mx-auto">
      <UCard v-for="(guest, gIdx) in guests" :key="guest.id">
        <div class="flex justify-between items-center mb-4">
          <UInput v-model="guest.name" class="font-bold text-lg" variant="none" placeholder="Nom de l'invité" />
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