<script setup lang="ts">
import type { Ingredient } from '~~/shared/types'

const open = defineModel<boolean>('open')

defineProps<{
  ingredient: any | null
  alternatives: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm', alternative: any): void
}>()
</script>

<template>
  <UModal v-model:open="open" :title="`Replacing ${ingredient?.name}`">
      <template #body>
          <div v-if="loading" class="flex justify-center p-8">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-primary-500" />
          </div>
          <div v-else-if="alternatives.length === 0" class="text-center p-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UIcon name="i-heroicons-face-frown" class="text-4xl mb-2 text-gray-400" />
              <p>No compatible alternatives found matching the current guest constraints.</p>
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto p-1">
              <UButton
                  v-for="alt in alternatives"
                  :key="alt.id"
                  block
                  variant="soft"
                  color="neutral"
                  class="justify-start group"
                  @click="emit('confirm', alt)"
              >
                  <div class="text-left w-full">
                      <div class="font-medium group-hover:text-primary-600 transition-colors">{{ alt.name }}</div>
                      <div v-if="alt.attributes?.length" class="flex gap-1 mt-1">
                           <UBadge v-for="attr in alt.attributes" :key="attr.id" size="xs" variant="subtle" color="neutral">{{ attr.value }}</UBadge>
                      </div>
                  </div>
              </UButton>
          </div>
      </template>
  </UModal>
</template>
