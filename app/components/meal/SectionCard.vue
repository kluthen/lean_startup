<script setup lang="ts">
import type { Recipe } from '~~/shared/types'

// Define the shape of the section prop based on usage in meal.vue
interface MealSectionData {
  selected: Recipe | null;
  alternatives: Recipe[];
}

interface SectionProp {
  id: string;
  label: string;
  data: MealSectionData;
}

const props = defineProps<{
  section: SectionProp
}>()

const emit = defineEmits<{
  (e: 'swap', newItem: Recipe): void
  (e: 'open-swap-modal', ingredient: any): void
}>()
</script>

<template>
  <UCard :class="{'opacity-50': !section.data?.selected}">
     <template #header>
        <div class="flex justify-between items-center">
            <div class="text-xs uppercase tracking-widest text-gray-500">{{ section.label }}</div>
            
            <!-- Swap Control -->
            <USelectMenu 
                v-if="section.data?.alternatives && section.data.alternatives.length > 1"
                :model-value="section.data.selected ?? undefined"
                @update:model-value="(val) => emit('swap', val)"
                :items="section.data.alternatives"
                option-attribute="name"
                placeholder="Swap..."
                class="w-48"
                size="xs"
            />
        </div>
     </template>
     <div v-if="section.data?.selected">
         <div class="flex justify-between items-start">
             <div>
                <h3 class="text-xl font-bold">{{ section.data.selected.name }}</h3>
                <p class="text-gray-600 dark:text-gray-400">{{ section.data.selected.description }}</p>
             </div>
             <UBadge v-if="(section.data.selected as any).score" color="neutral" variant="soft">Score: {{ (section.data.selected as any).score }}</UBadge>
         </div>
         
         <!-- Expandable Details -->
         <UAccordion :items="[{ label: 'Ingredients & Details', slot: 'details' }]" class="mt-4">
            <template #details>
                <div class="p-2 space-y-2">
                    <h4 class="font-bold text-sm">Ingredients:</h4>
                    <ul class="space-y-1 mt-2">
                        <li v-for="ing in (section.data.selected as any).ingredients" :key="ing.ingredientId" class="flex items-center gap-2 group text-sm text-gray-700 dark:text-gray-300">
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span>
                                {{ ing.quantity }} {{ ing.unit }} {{ ing.name || ing.ingredient?.name }}
                                <span v-if="ing.optional" class="text-xs text-gray-500">(Optional)</span>
                            </span>
                            
                            <UButton 
                                icon="i-heroicons-arrow-path" 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                class="opacity-0 group-hover:opacity-100 transition-opacity"
                                @click="emit('open-swap-modal', ing)"
                                title="Swap ingredient"
                            />
                        </li>
                    </ul>
                    
                    <div v-if="(section.data.selected as any).attributes?.length" class="pt-2">
                        <h4 class="font-bold text-sm">Tags:</h4>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <UBadge v-for="attr in (section.data.selected as any).attributes" :key="attr.id" size="xs" variant="subtle">
                                {{ attr.value }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </template>
         </UAccordion>

         <!-- Issues / Notes display -->
         <div v-if="(section.data.selected as any).issues?.length" class="mt-2 text-xs text-orange-500">
            <div v-for="iss in (section.data.selected as any).issues">{{ iss }}</div>
         </div>
     </div>
     <div v-else class="text-gray-400 italic">No option selected</div>
  </UCard>
</template>
