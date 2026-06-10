<template>
  <admin-layout>
    <page-breadcrumb page-title="Liste des Chauffeurs" />

    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article class="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Chauffeurs</p>
              <p class="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{{ totalDrivers }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-blue-600/80 dark:text-blue-300/80">Base totale</p>
          <div class="h-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60"><div class="h-full rounded-full bg-blue-500" style="width: 100%" /></div>
        </article>

        <article class="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Vérifiés</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{{ verifiedDrivers }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-emerald-600/80 dark:text-emerald-300/80">Taux: {{ verifiedRate }}%</p>
          <div class="h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60"><div class="h-full rounded-full bg-emerald-500" :style="{ width: `${verifiedRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">Occupés</p>
              <p class="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-200">{{ busyDrivers }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-amber-600/80 dark:text-amber-300/80">Taux: {{ busyRate }}%</p>
          <div class="h-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60"><div class="h-full rounded-full bg-amber-500" :style="{ width: `${busyRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-cyan-200/70 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Solde total</p>
              <p class="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-200">{{ formatMoney(totalBalance) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-cyan-600/80 dark:text-cyan-300/80">Moyenne: {{ avgBalancePerDriver }}</p>
          <div class="h-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60"><div class="h-full rounded-full bg-cyan-500" :style="{ width: `${verifiedRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Note moyenne</p>
              <p class="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-200">{{ avgRating }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-violet-600/80 dark:text-violet-300/80">Basée sur l'ensemble des chauffeurs</p>
          <div class="h-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60"><div class="h-full rounded-full bg-violet-500" :style="{ width: `${avgRatingValue}%` }" /></div>
        </article>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un chauffeur..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
          <select v-model="statusFilter" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="">Tous statuts</option>
            <option value="verified">verified</option>
            <option value="busy">busy</option>
            <option value="suspended">suspended</option>
          </select>
          <select v-model="sortBy" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="inscrit-desc">Inscription recente</option>
            <option value="balance-desc">Solde decroissant</option>
            <option value="rating-desc">Note decroissante</option>
            <option value="name-asc">Nom A-Z</option>
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
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Chauffeur</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Téléphone</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Vérifié</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Véhicule</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Modération</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Trajets</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Solde</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Note</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Inscrit le</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="loading">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
              </tr>
              <tr v-else-if="paginatedRows.length === 0">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Aucun chauffeur trouvé.</td>
              </tr>
              <tr v-for="row in paginatedRows" :key="row.id" class="hover:bg-gray-50/80">
                <td class="px-3 py-3">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                      <img v-if="row.profileImage" :src="row.profileImage" alt="avatar" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-600">{{ initials(row.fullName) }}</div>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ row.fullName }}</p>
                      <p class="text-xs text-gray-500">{{ row.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ row.email }}</td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ row.phone || '—' }}</td>
                <td class="px-3 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">{{ row.status }}</span>
                </td>
                <td class="px-3 py-3">
                  <span v-if="typeof row.isVerified === 'boolean'" class="rounded-full px-2 py-0.5 text-xs font-medium" :class="verifiedClass(row.isVerified)">
                    {{ row.isVerified ? 'Vérifié' : 'Non vérifié' }}
                  </span>
                  <span v-else class="text-xs text-gray-500">—</span>
                </td>
                <td class="px-3 py-3 text-sm text-gray-600">
                  <router-link
                    v-if="row.vehicleId"
                    :to="{ name: 'listings.detail', params: { category: 'VTC', id: row.vehicleId } }"
                    class="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {{ row.vehicle }}
                  </router-link>
                  <span v-else>{{ row.vehicle }}</span>
                </td>
                <td class="px-3 py-3">
                  <span v-if="row.moderationStatus" class="rounded-full px-2 py-0.5 text-xs font-medium" :class="moderationClass(row.moderationStatus)">{{ row.moderationStatus }}</span>
                  <span v-else class="text-xs text-gray-500">—</span>
                </td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ row.totalTrips }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatMoney(row.balance) }}</td>
                <td class="px-3 py-3 text-sm text-gray-700">{{ row.rating > 0 ? `${row.rating}/5` : '—' }}</td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(row.createdAt) }}</td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-2">
                    <router-link
                      :to="{ name: 'drivers.detail', params: { id: row.id } }"
                      class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      aria-label="Voir detail"
                    >
                      <EyeIcon />
                    </router-link>
                    <router-link
                      :to="{ name: 'drivers.detail', params: { id: row.id }, hash: '#histories' }"
                      class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      aria-label="Voir historique"
                    >
                      Hist
                    </router-link>
                  </div>
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
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getDriversTable, type DriverRow } from '@/services/drivers'
import { EyeIcon } from '@/icons'

defineOptions({ name: 'DriversPage' })

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('inscrit-desc')
const currentPage = ref(1)
const perPage = ref(10)
const rows = ref<DriverRow[]>([])

watch([searchQuery, statusFilter, sortBy, perPage], () => {
  currentPage.value = 1
})

const initials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?'
}

const formatDate = (value?: Date | { seconds?: number } | null) => {
  if (!value) return '—'
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(value)
  }
  if (typeof value?.seconds === 'number') {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value.seconds * 1000))
  }
  return '—'
}

const statusClass = (status?: string) => {
  if (status === 'online') return 'bg-success-50 text-success-600'
  if (status === 'busy') return 'bg-warning-50 text-warning-600'
  if (status === 'offline' || status === 'banned') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const verifiedClass = (isVerified?: boolean) => {
  if (isVerified === true) return 'bg-success-50 text-success-600'
  if (isVerified === false) return 'bg-warning-50 text-warning-600'
  return 'bg-gray-100 text-gray-600'
}

const moderationClass = (status?: string) => {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'bg-success-50 text-success-600'
  if (s === 'rejected') return 'bg-error-50 text-error-600'
  if (s === 'pending') return 'bg-warning-50 text-warning-600'
  return 'bg-gray-100 text-gray-600'
}

const totalBalance = computed(() => rows.value.reduce((sum, row) => sum + (row.balance || 0), 0))
const totalDrivers = computed(() => rows.value.length)
const verifiedDrivers = computed(() => rows.value.filter((r) => r.status === 'verified').length)
const busyDrivers = computed(() => rows.value.filter((r) => r.status === 'busy').length)
const verifiedRate = computed(() => (totalDrivers.value ? Math.round((verifiedDrivers.value / totalDrivers.value) * 100) : 0))
const busyRate = computed(() => (totalDrivers.value ? Math.round((busyDrivers.value / totalDrivers.value) * 100) : 0))
const avgBalancePerDriver = computed(() => {
  if (!totalDrivers.value) return '0.0'
  return `${(totalBalance.value / totalDrivers.value).toFixed(1)} ${rows.value[0]?.currency || 'MAD'}`
})
const avgRating = computed(() => {
  if (!totalDrivers.value) return '—'
  const sum = rows.value.reduce((s, r) => s + (r.rating || 0), 0)
  return (sum / totalDrivers.value).toFixed(1)
})
const avgRatingValue = computed(() => {
  if (!totalDrivers.value) return 0
  const sum = rows.value.reduce((s, r) => s + (r.rating || 0), 0)
  const avg = sum / totalDrivers.value
  return Math.round((avg / 5) * 100)
})
const formatMoney = (value: number) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
  return `${formatted} Dhs`
}

const filteredRows = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    if (statusFilter.value && row.status !== statusFilter.value) return false
    if (!needle) return true

    const haystack = [row.fullName, row.email, row.phone, row.vehicle].join(' ').toLowerCase()
    return haystack.includes(needle)
  })
})

const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    if (sortBy.value === 'balance-desc') return (b.balance || 0) - (a.balance || 0)
    if (sortBy.value === 'rating-desc') return (b.rating || 0) - (a.rating || 0)
    if (sortBy.value === 'name-asc') return a.fullName.localeCompare(b.fullName)

    const aSeconds = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.seconds ?? 0) * 1000
    const bSeconds = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.seconds ?? 0) * 1000
    return bSeconds - aSeconds
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / perPage.value)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedRows.value.slice(start, start + perPage.value)
})

onMounted(async () => {
  try {
    rows.value = await getDriversTable()
  } finally {
    loading.value = false
  }
})
</script>
