<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Commissions Nessia" />
    <p class="mb-4 text-sm text-gray-500">Calcul des commissions a partir des paiements et reservations (confirmed/terminee, cancelled/annulee, pending).</p>

    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-xs text-gray-500">Commission totale</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ formatCurrency(summary.totalCommission) }}</p>
        <p class="mt-1 text-xs text-gray-500">Taux Nessia: {{ commissionRate }}%</p>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-xs text-gray-500">Confirmed / terminee</p>
        <p class="mt-1 text-2xl font-semibold text-success-600">{{ formatCurrency(summary.successCommission) }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ summary.successCount }} operations</p>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-xs text-gray-500">Cancelled / annulee</p>
        <p class="mt-1 text-2xl font-semibold text-error-600">{{ formatCurrency(summary.cancelledCommission) }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ summary.cancelledCount }} operations</p>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-xs text-gray-500">Pending</p>
        <p class="mt-1 text-2xl font-semibold text-warning-600">{{ formatCurrency(summary.pendingCommission) }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ summary.pendingCount }} operations</p>
      </article>
    </div>

    <div class="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Resume par periode</h3>
        <div class="inline-flex w-full rounded-xl border border-gray-300 p-1 md:w-auto dark:border-gray-700">
          <button
            v-for="option in granularityOptions"
            :key="option.value"
            class="rounded-lg px-3 py-1.5 text-sm font-medium"
            :class="selectedGranularity === option.value ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300'"
            @click="selectedGranularity = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement des calculs de commissions...
    </div>
    <div v-else-if="error" class="rounded-2xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
      {{ error }}
    </div>

    <div v-else class="space-y-5 sm:space-y-6">
      <ComponentCard title="Commission Nessia (semaine/mois/annee)">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <div class="min-w-[900px] xl:min-w-full">
            <VueApexCharts type="area" height="320" :options="commissionChartOptions" :series="commissionSeries" />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Volumes paiements vs reservations">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <div class="min-w-[900px] xl:min-w-full">
            <VueApexCharts type="bar" height="300" :options="volumeChartOptions" :series="volumeSeries" />
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ComponentCard from '@/components/common/ComponentCard.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getPaiementListData } from '~/services/paiements'
import { getCentralizedReservations } from '~/services/reservations'

type Granularity = 'week' | 'month' | 'year'
type StatusGroup = 'success' | 'cancelled' | 'pending'

type UnifiedEntry = {
  source: 'paiement' | 'reservation'
  statusGroup: StatusGroup
  amount: number
  date: Date
}

type Bucket = {
  key: string
  label: string
  from: Date
  to: Date
}

const loading = ref(true)
const error = ref<string | null>(null)

const selectedGranularity = ref<Granularity>('month')
const granularityOptions: Array<{ value: Granularity; label: string }> = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Annee' },
]

const commissionRate = ref(0)
const entries = ref<UnifiedEntry[]>([])

const normalizeStatus = (value: unknown): string => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const statusToGroup = (value: unknown): StatusGroup | null => {
  const status = normalizeStatus(value)
  if (status === 'confirmed' || status === 'confirmee' || status === 'terminee' || status === 'paid') return 'success'
  if (status === 'cancelled' || status === 'annulee' || status === 'refunded' || status === 'partially_refunded') return 'cancelled'
  if (status === 'pending') return 'pending'
  return null
}

const clampStartOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0)

const startOfWeek = (value: Date) => {
  const date = clampStartOfDay(new Date(value))
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date
}

const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0, 0)
const startOfYear = (value: Date) => new Date(value.getFullYear(), 0, 1, 0, 0, 0, 0)

const addDays = (value: Date, days: number) => {
  const copy = new Date(value)
  copy.setDate(copy.getDate() + days)
  return copy
}

const addMonths = (value: Date, months: number) => {
  const copy = new Date(value)
  copy.setMonth(copy.getMonth() + months)
  return copy
}

const addYears = (value: Date, years: number) => {
  const copy = new Date(value)
  copy.setFullYear(copy.getFullYear() + years)
  return copy
}

const toDateFromMaybeTimestamp = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value && 'seconds' in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds || 0)
    if (!seconds) return null
    return new Date(seconds * 1000)
  }
  return null
}

const buildBuckets = (granularity: Granularity): Bucket[] => {
  const now = new Date()
  if (granularity === 'week') {
    const start = startOfWeek(now)
    const result: Bucket[] = []
    for (let i = 7; i >= 0; i -= 1) {
      const from = addDays(start, -i * 7)
      const to = addDays(from, 7)
      const weekLabel = `S${Math.ceil((((from.getTime() - startOfYear(from).getTime()) / 86400000) + 1) / 7)}`
      result.push({
        key: `${from.getFullYear()}-W${weekLabel}`,
        label: `${weekLabel} ${from.getFullYear()}`,
        from,
        to,
      })
    }
    return result
  }

  if (granularity === 'year') {
    const start = startOfYear(now)
    const result: Bucket[] = []
    for (let i = 4; i >= 0; i -= 1) {
      const from = addYears(start, -i)
      const to = addYears(from, 1)
      result.push({
        key: String(from.getFullYear()),
        label: String(from.getFullYear()),
        from,
        to,
      })
    }
    return result
  }

  const start = startOfMonth(now)
  const result: Bucket[] = []
  for (let i = 11; i >= 0; i -= 1) {
    const from = addMonths(start, -i)
    const to = addMonths(from, 1)
    result.push({
      key: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(from),
      from,
      to,
    })
  }
  return result
}

const buckets = computed(() => buildBuckets(selectedGranularity.value))

const seriesRows = computed(() => {
  return buckets.value.map((bucket) => {
    const row = {
      label: bucket.label,
      successCommission: 0,
      cancelledCommission: 0,
      pendingCommission: 0,
      paiementsCount: 0,
      reservationsCount: 0,
    }

    for (const entry of entries.value) {
      if (entry.date < bucket.from || entry.date >= bucket.to) continue
      const commission = Number(entry.amount || 0) * (commissionRate.value / 100)

      if (entry.statusGroup === 'success') row.successCommission += commission
      else if (entry.statusGroup === 'cancelled') row.cancelledCommission += commission
      else if (entry.statusGroup === 'pending') row.pendingCommission += commission

      if (entry.source === 'paiement') row.paiementsCount += 1
      if (entry.source === 'reservation') row.reservationsCount += 1
    }

    return {
      ...row,
      successCommission: Math.round(row.successCommission * 100) / 100,
      cancelledCommission: Math.round(row.cancelledCommission * 100) / 100,
      pendingCommission: Math.round(row.pendingCommission * 100) / 100,
    }
  })
})

const summary = computed(() => {
  const successCommission = seriesRows.value.reduce((sum, row) => sum + row.successCommission, 0)
  const cancelledCommission = seriesRows.value.reduce((sum, row) => sum + row.cancelledCommission, 0)
  const pendingCommission = seriesRows.value.reduce((sum, row) => sum + row.pendingCommission, 0)

  const successCount = entries.value.filter((entry) => entry.statusGroup === 'success').length
  const cancelledCount = entries.value.filter((entry) => entry.statusGroup === 'cancelled').length
  const pendingCount = entries.value.filter((entry) => entry.statusGroup === 'pending').length

  return {
    totalCommission: Math.round((successCommission + cancelledCommission + pendingCommission) * 100) / 100,
    successCommission: Math.round(successCommission * 100) / 100,
    cancelledCommission: Math.round(cancelledCommission * 100) / 100,
    pendingCommission: Math.round(pendingCommission * 100) / 100,
    successCount,
    cancelledCount,
    pendingCount,
  }
})

const categories = computed(() => seriesRows.value.map((row) => row.label))

const commissionSeries = computed(() => ([
  { name: 'Confirmed / terminee', data: seriesRows.value.map((row) => row.successCommission) },
  { name: 'Cancelled / annulee', data: seriesRows.value.map((row) => row.cancelledCommission) },
  { name: 'Pending', data: seriesRows.value.map((row) => row.pendingCommission) },
]))

const volumeSeries = computed(() => ([
  { name: 'Paiements', data: seriesRows.value.map((row) => row.paiementsCount) },
  { name: 'Reservations', data: seriesRows.value.map((row) => row.reservationsCount) },
]))

const commissionChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  },
  colors: ['#16A34A', '#DC2626', '#F59E0B'],
  stroke: { curve: 'smooth', width: [2, 2, 2] },
  fill: {
    gradient: {
      enabled: true,
      opacityFrom: 0.45,
      opacityTo: 0,
    },
  },
  dataLabels: { enabled: false },
  legend: { show: true, position: 'top', horizontalAlign: 'left' },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => `${Math.round(value)} MAD`,
    },
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${Math.round(value)} MAD`,
    },
  },
}))

const volumeChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
    stacked: false,
  },
  colors: ['#465FFF', '#06B6D4'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
    },
  },
  dataLabels: { enabled: false },
  legend: { show: true, position: 'top', horizontalAlign: 'left' },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => String(Math.round(value)),
    },
  },
}))

const formatCurrency = (value: number, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const [paiementData, reservationData] = await Promise.all([
      getPaiementListData('month'),
      getCentralizedReservations(),
    ])

    commissionRate.value = Number(paiementData.stats.commission.rate || 0)

    const unified: UnifiedEntry[] = []

    for (const paiement of paiementData.items) {
      const group = statusToGroup(paiement.statut)
      const date = toDateFromMaybeTimestamp(paiement.dateCreation)
      if (!group || !date) continue
      unified.push({
        source: 'paiement',
        statusGroup: group,
        amount: Number(paiement.montant || 0),
        date,
      })
    }

    for (const reservation of reservationData) {
      const group = statusToGroup(reservation.status)
      const date = toDateFromMaybeTimestamp(reservation.date) || toDateFromMaybeTimestamp(reservation.raw?.createdAt)
      if (!group || !date) continue
      unified.push({
        source: 'reservation',
        statusGroup: group,
        amount: Number(reservation.amount || 0),
        date,
      })
    }

    entries.value = unified
  } catch {
    error.value = 'Impossible de calculer les commissions Nessia.'
  } finally {
    loading.value = false
  }
})
</script>
