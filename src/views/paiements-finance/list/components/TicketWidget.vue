<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <p class="text-xs uppercase tracking-wide text-gray-500">{{ item.label }}</p>
    <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
      {{ item.count }}
      <span v-if="item.unit" class="text-sm font-medium text-gray-500">{{ item.unit }}</span>
    </p>
    <p class="mt-1 text-xs" :class="item.positive ? 'text-success-600' : 'text-error-600'">{{ item.change }}</p>
  </div>
</template>

<script setup lang="ts">
import type { TicketStatType } from './data'

defineProps<{ item: TicketStatType }>()
</script>
