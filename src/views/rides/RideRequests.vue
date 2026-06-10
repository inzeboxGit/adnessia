<template>
  <admin-layout>
    <page-breadcrumb page-title="Gestion des courses" />

    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article class="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Total des courses</p>
              <p class="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{{ totalRides }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18" />
                <path d="M7 16h10" />
                <path d="M6 8h12l2 8H4l2-8Z" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-blue-600/80 dark:text-blue-300/80">Base globale</p>
          <div class="h-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60"><div class="h-full rounded-full bg-blue-500" style="width: 100%" /></div>
        </article>

        <article class="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Courses annulées</p>
              <p class="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-200">{{ canceledRides }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-rose-600/80 dark:text-rose-300/80">Taux: {{ canceledRate }}%</p>
          <div class="h-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60"><div class="h-full rounded-full bg-rose-500" :style="{ width: `${canceledRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Courses terminées</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{{ completedRides }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-emerald-600/80 dark:text-emerald-300/80">Taux: {{ completedRate }}%</p>
          <div class="h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60"><div class="h-full rounded-full bg-emerald-500" :style="{ width: `${completedRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-cyan-200/70 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Revenue généré</p>
              <p class="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-200">{{ formatMoney(totalRevenue) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-cyan-600/80 dark:text-cyan-300/80">Somme de la colonne Montant</p>
          <div class="h-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60"><div class="h-full rounded-full bg-cyan-500" :style="{ width: `${completedRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Commission Nessia</p>
              <p class="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-200">{{ formatMoney(totalCommission) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-violet-600/80 dark:text-violet-300/80">Taux appliqué: {{ commissionRate }}%</p>
          <div class="h-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60"><div class="h-full rounded-full bg-violet-500" :style="{ width: `${commissionRateValue}%` }" /></div>
        </article>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une course, client, chauffeur..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
          <select v-model="statusFilter" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="">Tous statuts</option>
            <option value="canceled">canceled</option>
            <option value="completed">completed</option>
            <option value="open">open</option>
            <option value="confirmed">confirmed</option>
          </select>
          <select v-model="sortBy" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="created-desc">Création récente</option>
            <option value="amount-desc">Montant décroissant</option>
            <option value="distance-desc">Distance décroissante</option>
            <option value="status-asc">Statut A-Z</option>
          </select>
          <select v-model="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="30">30 / page</option>
          </select>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="min-w-full divide-y divide-gray-100">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Demande</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Trajet</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Client</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Chauffeur</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Statut</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Driver stage</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Catégorie</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Paiement</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Montant</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Créée le</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="loading">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
              </tr>
              <tr v-else-if="paginatedRows.length === 0">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Aucune course trouvée.</td>
              </tr>
              <tr v-for="row in paginatedRows" :key="row.id" class="hover:bg-gray-50/80">
                <td class="px-3 py-3">
                  <!-- <p class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ row.id }}</p> -->
                  <p class="text-xs text-gray-500">N Commande (Paiements N Commande) {{ row.orderId || 'Sans orderId' }}</p>
                </td>
                <td class="px-3 py-3 text-sm text-gray-600">
                  <p class="max-w-xs truncate font-medium text-gray-700">{{ row.pickupAddress }}</p>
                  <p class="max-w-xs truncate text-xs text-gray-500">{{ row.dropoffAddress }}</p>
                </td>
                <td class="px-3 py-3">
                  <p class="text-sm font-medium text-gray-700">{{ row.clientName || '—' }}</p>
                  <!-- <p class="text-xs text-gray-500">{{ row.userId || '—' }}</p> -->
                </td>
                <td class="px-3 py-3">
                  <p class="text-sm font-medium text-gray-700">{{ row.driverName || '—' }}</p>
                  <p class="text-xs text-gray-500">{{ row.selectedDriverId || row.paymentDriverId || '—' }}</p>
                  <p class="text-xs text-gray-500" v-if="row.arrivedAtPickup === true">Arrivé au pickup</p>
                </td>
                <td class="px-3 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(row.statusGroup)">{{ displayStatus(row.status, row.statusGroup) }}</span>
                  <p v-if="row.canceledBy" class="mt-1 text-xs text-gray-500">par {{ row.canceledBy }}</p>
                </td>
                <td class="px-3 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="stageClass(row.driverStage)">{{ row.driverStage || '—' }}</span>
                  <p v-if="typeof row.isBusy === 'boolean'" class="mt-1 text-xs text-gray-500">{{ row.isBusy ? 'busy' : 'free' }}</p>
                </td>
                <td class="px-3 py-3 text-sm text-gray-600">
                  <p>{{ row.categoryLabel }}</p>
                  <p class="text-xs text-gray-500">{{ formatDistance(row.distanceKm) }}</p>
                </td>
                <td class="px-3 py-3">
                  <p class="text-sm font-medium text-gray-700">{{ row.paymentMethod || '—' }}</p>
                  <p class="text-xs text-gray-500">{{ row.clientPaidAt ? 'Payé' : 'Non payé' }}</p>
                </td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatMoney(row.amount, row.currency) }}</td>
                
                <td class="px-3 py-3 text-sm text-gray-600">{{ formatDateTime(row.createdAt) }}</td>
                <td class="px-3 py-3">
                  <button
                    type="button"
                    class="rounded-lg border border-brand-200 px-3 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="reassigningRideId === row.id"
                    @click="openReassignModal(row)"
                  >
                    {{ reassigningRideId === row.id ? 'Affectation...' : 'Affecter à un autre chauffeur' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ sortedRows.length }} resultat(s)</p>
          <div class="flex items-center gap-2">
            <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage <= 1" @click="currentPage -= 1">Precedent</button>
            <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
            <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage >= totalPages" @click="currentPage += 1">Suivant</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReassignModal && selectedRide" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Réaffecter la course</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ selectedRide.clientName || 'Client inconnu' }} • {{ selectedRide.pickupAddress }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            Chauffeur actuel: {{ selectedRide.driverName || '—' }}
          </p>
        </div>

        <div class="space-y-3">
          <label for="driver-reassign-select" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Nouveau chauffeur</label>
          <select
            id="driver-reassign-select"
            v-model="selectedDriverId"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">Sélectionner un chauffeur</option>
            <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id">
              {{ driver.name }}{{ driver.id === selectedRide.selectedDriverId ? ' (actuel)' : '' }}
            </option>
          </select>
          <p v-if="reassignError" class="text-sm text-error-600">{{ reassignError }}</p>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            :disabled="reassigningRideId === selectedRide.id"
            @click="closeReassignModal"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!selectedDriverId || selectedDriverId === selectedRide.selectedDriverId || reassigningRideId === selectedRide.id"
            @click="submitReassignment"
          >
            {{ reassigningRideId === selectedRide.id ? 'Enregistrement...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import {
  getRideDriverOptions,
  getRideRequestsData,
  reassignRideRequest,
  type RideDriverOption,
  type RideRequestRow,
  type RideStatusGroup,
} from '@/services/ride-requests'

defineOptions({ name: 'RideRequestsPage' })

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('created-desc')
const currentPage = ref(1)
const perPage = ref(10)
const rows = ref<RideRequestRow[]>([])
const commissionRate = ref(0)
const availableDrivers = ref<RideDriverOption[]>([])
const showReassignModal = ref(false)
const selectedRide = ref<RideRequestRow | null>(null)
const selectedDriverId = ref('')
const reassigningRideId = ref('')
const reassignError = ref('')

watch([searchQuery, statusFilter, sortBy, perPage], () => {
  currentPage.value = 1
})

const toTimestamp = (value?: Date | { seconds?: number } | null) => {
  if (!value) return 0
  if (value instanceof Date) return value.getTime()
  return (value.seconds ?? 0) * 1000
}

const formatDateTime = (value?: Date | { seconds?: number } | null) => {
  const timestamp = toTimestamp(value)
  if (!timestamp) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

const formatMoney = (value: number, currency = 'MAD') => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(value || 0))

  return currency === 'MAD' ? formatted.replace('MAD', 'Dhs') : formatted
}

const formatDistance = (distanceKm?: number) => {
  if (!distanceKm) return '—'
  return `${distanceKm.toFixed(1)} km`
}

const displayStatus = (status?: string, group?: RideStatusGroup) => {
  if (status && status !== '—') return status
  if (group === 'canceled') return 'canceled'
  if (group === 'completed') return 'completed'
  if (group === 'confirmed') return 'confirmed'
  if (group === 'open') return 'open'
  return '—'
}

const statusClass = (statusGroup?: RideStatusGroup) => {
  if (statusGroup === 'completed') return 'bg-success-50 text-success-600'
  if (statusGroup === 'confirmed') return 'bg-blue-50 text-blue-600'
  if (statusGroup === 'open') return 'bg-warning-50 text-warning-600'
  if (statusGroup === 'canceled') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const stageClass = (stage?: string) => {
  const value = String(stage || '').toLowerCase()
  if (value === 'on_trip') return 'bg-success-50 text-success-600'
  if (value === 'arrived' || value === 'arrived_at_pickup') return 'bg-blue-50 text-blue-600'
  if (value === 'searching' || value === 'pending') return 'bg-warning-50 text-warning-600'
  if (!value) return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-600'
}

const totalRides = computed(() => rows.value.length)
const canceledRides = computed(() => rows.value.filter((row) => row.statusGroup === 'canceled').length)
const completedRides = computed(() => rows.value.filter((row) => row.statusGroup === 'completed').length)
const totalRevenue = computed(() => rows.value.reduce((sum, row) => sum + row.amount, 0))
const totalCommission = computed(() => Number((totalRevenue.value * (commissionRate.value / 100)).toFixed(2)))
const canceledRate = computed(() => (totalRides.value ? Math.round((canceledRides.value / totalRides.value) * 100) : 0))
const completedRate = computed(() => (totalRides.value ? Math.round((completedRides.value / totalRides.value) * 100) : 0))
const commissionRateValue = computed(() => Math.min(100, Math.max(0, Math.round(commissionRate.value))))

const filteredRows = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    if (statusFilter.value && row.statusGroup !== statusFilter.value) return false
    if (!needle) return true

    const haystack = [
      row.id,
      row.clientName,
      row.userId,
      row.driverName,
      row.selectedDriverId,
      row.paymentDriverId,
      row.status,
      row.driverStage,
      row.categoryLabel,
      row.pickupAddress,
      row.dropoffAddress,
      row.orderId,
      row.transactionId,
    ].join(' ').toLowerCase()

    return haystack.includes(needle)
  })
})

const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    if (sortBy.value === 'amount-desc') return b.amount - a.amount
    if (sortBy.value === 'distance-desc') return b.distanceKm - a.distanceKm
    if (sortBy.value === 'status-asc') return displayStatus(a.status, a.statusGroup).localeCompare(displayStatus(b.status, b.statusGroup))
    return toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / perPage.value)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedRows.value.slice(start, start + perPage.value)
})

const loadData = async () => {
  const [ridesData, drivers] = await Promise.all([
    getRideRequestsData(),
    getRideDriverOptions(),
  ])

  rows.value = ridesData.rows
  commissionRate.value = ridesData.commissionRate
  availableDrivers.value = drivers
}

const openReassignModal = (row: RideRequestRow) => {
  selectedRide.value = row
  selectedDriverId.value = row.selectedDriverId || row.paymentDriverId || ''
  reassignError.value = ''
  showReassignModal.value = true
}

const closeReassignModal = () => {
  showReassignModal.value = false
  selectedRide.value = null
  selectedDriverId.value = ''
  reassignError.value = ''
}

const submitReassignment = async () => {
  if (!selectedRide.value?.id) return
  if (!selectedDriverId.value) {
    reassignError.value = 'Sélectionnez un chauffeur.'
    return
  }

  reassigningRideId.value = selectedRide.value.id
  reassignError.value = ''

  try {
    await reassignRideRequest(selectedRide.value.id, selectedDriverId.value)
    await loadData()
    closeReassignModal()
  } catch (error) {
    console.error(error)
    reassignError.value = 'Impossible de changer le chauffeur pour cette course.'
  } finally {
    reassigningRideId.value = ''
  }
}

onMounted(async () => {
  try {
    await loadData()
  } finally {
    loading.value = false
  }
})
</script>
