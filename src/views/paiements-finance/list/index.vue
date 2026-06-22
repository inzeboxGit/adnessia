<template>
  <admin-layout>
    <page-breadcrumb page-title="Paiements & finance" />

    <div class="mb-4 flex items-center justify-between gap-2">
      <p class="text-sm text-gray-500">Liste des paiements effectues par les clients.</p>
      <router-link to="/finance/payouts" class="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
        Paiement partenaires
      </router-link>
    </div>

    <div class="mb-4 flex justify-end">
      <div class="inline-flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
        <button
          v-for="period in periods"
          :key="period.value"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm"
          :class="selectedPeriod === period.value ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <ticket-widget v-for="item in ticketStatData" :key="item.id" :item="item" />
    </div>

    <ticket />
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getPaiementListData, type PaiementListPeriod, type PaiementListStats } from '~/services/paiements'
import Ticket from './components/Ticket.vue'
import TicketWidget from './components/TicketWidget.vue'
import type { TicketStatType } from './components/data'

defineOptions({ name: 'FinancePaymentsPage' })

const stats = ref<PaiementListStats | null>(null)
const selectedPeriod = ref<PaiementListPeriod>('month')
const periods: Array<{ label: string; value: PaiementListPeriod }> = [
  { label: 'Jour', value: 'day' },
  { label: 'Semaine', value: 'week' },
  { label: 'Mois', value: 'month' },
]

const loadStats = async () => {
  try {
    const response = await getPaiementListData(selectedPeriod.value)
    stats.value = response.stats
  } catch {
    stats.value = null
  }
}

watch(selectedPeriod, () => {
  void loadStats()
}, { immediate: true })

const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)

const formatChange = (value: number) => `${value > 0 ? '+' : ''}${value}%`

const ticketStatData = computed<TicketStatType[]>(() => {
  const source = stats.value

  return [
    {
      id: 1,
      count: String(source?.total.value ?? 0),
      change: formatChange(source?.total.change ?? 0),
      label: 'Toutes les transactions',
      positive: (source?.total.change ?? 0) >= 0,
    },
    {
      id: 2,
      count: String(source?.confirmed.value ?? 0),
      change: formatChange(source?.confirmed.change ?? 0),
      label: 'Paiements confirms',
      positive: (source?.confirmed.change ?? 0) >= 0,
    },
    {
      id: 3,
      count: formatAmount(source?.commission.value ?? 0),
      change: formatChange(source?.commission.change ?? 0),
      label: 'Commission',
      positive: (source?.commission.change ?? 0) >= 0,
      unit: 'MAD',
      // source?.commission.currency ?? 
    },
    {
      id: 4,
      count: String(source?.refunded.value ?? 0),
      change: formatChange(source?.refunded.change ?? 0),
      label: 'Remboursements Nessia',
      positive: (source?.refunded.change ?? 0) <= 0,
    },
    {
      id: 5,
      count: formatAmount(source?.confirmedAmount.value ?? 0),
      change: formatChange(source?.confirmedAmount.change ?? 0),
      label: 'Montant confirme',
      positive: (source?.confirmedAmount.change ?? 0) >= 0,
      unit: 'MAD',
      // source?.confirmedAmount.currency ?? 
    },
  ]
})
</script>
