<template>
  <admin-layout>
    <page-breadcrumb page-title="Reservations" />

    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <reservation-stat-card v-for="item in statItems" :key="item.title" :item="item" />
      </div>

      <reservations-table :reservations="reservations" :loading="loading" :error="error" />
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ReservationStatCard from './components/ReservationStatCard.vue'
import ReservationsTable from './components/ReservationsTable.vue'
import { getReservationStatItems } from '@/services/reservations-dashboard'
import { getCentralizedReservations, type CentralizedReservationItem } from '~/services/reservations'

defineOptions({ name: 'ReservationsPage' })

const loading = ref(true)
const error = ref<string | null>(null)
const reservations = ref<CentralizedReservationItem[]>([])

onMounted(async () => {
  try {
    reservations.value = await getCentralizedReservations()
  } catch {
    error.value = 'Impossible de charger les reservations.'
  } finally {
    loading.value = false
  }
})

const statItems = computed(() => getReservationStatItems(reservations.value))
</script>
