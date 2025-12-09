<script setup lang="ts">
import type { FoodAttribute } from '~/shared/types'

const { data: attributesRaw } = await useFetch<FoodAttribute[]>('/api/attributes')

const attributes = computed(() => {
  return attributesRaw.value?.map(attr => ({
    ...attr,
    label: `${attr.type}: ${attr.value}`
  })) || []
})

// State
const guests = ref([
  { id: 1, name: 'Guest 1', constraints: [] as { attributeId: string, weight: string, stepValue: number }[] }
])

const weights = [
  { label: 'Forbidden', value: '--', step: 0, color: 'red' },
  { label: 'Avoid', value: '-', step: 1, color: 'orange' },
  { label: 'Preferred', value: '+', step: 2, color: 'green' },
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
    name: `Guest ${guests.value.length + 1}`,
    constraints: []
  })
}

function addConstraint(guestIndex: number) {
  guests.value[guestIndex].constraints.push({ attributeId: '', weight: '--', stepValue: 0 })
}

function removeConstraint(guestIndex: number, cIndex: number) {
  guests.value[guestIndex].constraints.splice(cIndex, 1)
}

// Generation
const router = useRouter()
const loading = ref(false)

async function generate() {
  loading.value = true
  
  // Flatten constraints
  const flatConstraints = guests.value.flatMap(g => 
    g.constraints.map(c => ({
      guestId: g.name,
      attributeId: c.attributeId,
      weight: getWeightByStep(c.stepValue).value
    }))
  ).filter(c => c.attributeId) // Ensure ID is set

  try {
    // We can pass data via state or query. For simplicity, let's use a store or just pass to next page via state
    // For this MVP, let's fetch here and show results locally or navigate.
    // Navigation is cleaner.
    
    // Store in localStorage or useNuxtState to pass to /meal
    const mealState = useState('mealData')
    const result = await $fetch('/api/generate', {
      method: 'POST',
      body: { constraints: flatConstraints }
    })
    
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
          <UInput v-model="guest.name" class="font-bold text-lg" variant="none" placeholder="Guest Name" />
          <UButton v-if="guests.length > 1" color="red" variant="ghost" icon="i-heroicons-trash" @click="guests.splice(gIdx, 1)" />
        </div>

        <div class="space-y-3">
          <div v-for="(constraint, cIdx) in guest.constraints" :key="cIdx" class="flex gap-2 items-center">
             <USelectMenu 
                v-model="constraint.attributeId" 
                :items="attributes"
                value-attribute="id"
                placeholder="Select restriction..."
                class="flex-1"
             />
             
             <div class="w-48 flex flex-col gap-1">
                 <USlider 
                    :key="constraint.stepValue"
                    v-model="constraint.stepValue" 
                    :min="0" 
                    :max="3" 
                    :step="1"
                    :color="getWeightByStep(constraint.stepValue).color"
                 />
                 <div class="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                    <span :class="{'text-red-500': constraint.stepValue === 0}">--</span>
                    <span :class="{'text-orange-500': constraint.stepValue === 1}">-</span>
                    <span :class="{'text-green-500': constraint.stepValue === 2}">+</span>
                    <span :class="{'text-primary-500': constraint.stepValue === 3}">++</span>
                 </div>
                 <div class="text-xs text-center font-medium" :class="`text-${getWeightByStep(constraint.stepValue).color}-500`">
                    {{ getWeightByStep(constraint.stepValue).label }}
                 </div>
             </div>
             
             <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="removeConstraint(gIdx, cIdx)" />
          </div>

          <div class="pt-2">
            <UButton size="sm" variant="soft" icon="i-heroicons-plus" @click="addConstraint(gIdx)">
              Add Constraint
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex justify-center flex-col items-center gap-4 mt-8">
        <UButton variant="outline" icon="i-heroicons-user-plus" @click="addGuest">
          Add Another Guest
        </UButton>
        <UButton size="xl" @click="generate" :loading="loading" class="px-12">
          Generate Meal
        </UButton>
      </div>
    </div>
  </UContainer>
</template>