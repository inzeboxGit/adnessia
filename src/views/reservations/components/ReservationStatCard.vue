<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="mb-2 flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ item.title }}</p>
        <h3 class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ item.value }}</h3>
      </div>
      <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="toneClass">{{ item.change > 0 ? '+' : '' }}{{ item.change }}%</span>
    </div>
    <p class="text-sm text-gray-500">{{ item.description }}</p>
    <p class="mt-1 text-xs text-gray-400">{{ item.changeLabel }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReservationStatItem } from '@/services/reservations-dashboard'

const props = defineProps<{
  item: ReservationStatItem
}>()

const toneClass = computed(() => {
  if (props.item.tone === 'success') return 'bg-success-50 text-success-600'
  if (props.item.tone === 'warning') return 'bg-warning-50 text-warning-600'
  if (props.item.tone === 'danger') return 'bg-error-50 text-error-600'
  if (props.item.tone === 'info') return 'bg-blue-light-50 text-blue-light-600'
  return 'bg-brand-50 text-brand-600'
})
</script>
