<template>
  <admin-layout>
    <page-breadcrumb page-title="Liste de partenaires" />
        <!-- <div>Gerer les partenaires de votre plateforme, visualiser leurs performances et acceder a leurs details</div> -->

    <div class="space-y-6">
      <div v-if="currentView !== 'moderation'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article class="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Partenaires</p>
              <p class="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{{ totalPartners }}</p>
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
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Actifs</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{{ activePartners }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-emerald-600/80 dark:text-emerald-300/80">Taux: {{ activeRate }}%</p>
          <div class="h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60"><div class="h-full rounded-full bg-emerald-500" :style="{ width: `${activeRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">En attente de validation</p>
              <p class="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-200">{{ pendingPartners }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-amber-600/80 dark:text-amber-300/80">Taux: {{ pendingRate }}%</p>
          <div class="h-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60"><div class="h-full rounded-full bg-amber-500" :style="{ width: `${pendingRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-cyan-200/70 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Revenue Genere</p>
              <p class="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-200">{{ formatMoney(totalRevenue) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-cyan-600/80 dark:text-cyan-300/80">Moyenne: {{ avgRevenuePerPartner }}</p>
          <div class="h-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60"><div class="h-full rounded-full bg-cyan-500" :style="{ width: `${activeRate}%` }" /></div>
        </article>

        <article class="rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Comissions Nessia</p>
              <p class="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-200">{{ formatMoney(totalCommissions) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-violet-600/80 dark:text-violet-300/80">Part du revenu: {{ commissionRateOfRevenue }}%</p>
          <div class="h-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60"><div class="h-full rounded-full bg-violet-500" :style="{ width: `${commissionRateOfRevenue}%` }" /></div>
        </article>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un partenaire..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
          <select v-model="statusFilter" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="">Tous statuts</option>
            <option value="approved">approved</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
            <option value="suspended">suspended</option>
          </select>
          <select v-model="categoryFilter" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="">Toutes categories</option>
            <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
          </select>
          <select v-model="cityFilter" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="">Toutes villes</option>
            <option v-for="city in cityOptions" :key="city" :value="city">{{ city }}</option>
          </select>
          <select v-model="sortBy" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <option value="inscrit-desc">Inscription recente</option>
            <option value="revenue-desc">Revenue decroissant</option>
            <option value="revenue-asc">Revenue croissant</option>
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
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Partenaire</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Categorie</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Ville</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Listings</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reservations</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Revenue Generes</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Comissions Nessia</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Note Moyenne</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Inscrit le</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="loading">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
              </tr>
              <tr v-else-if="paginatedRows.length === 0">
                <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Aucun partenaire trouvé.</td>
              </tr>
              <tr v-for="row in paginatedRows" :key="row.id" class="hover:bg-gray-50/80">
                <td class="px-3 py-3">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                      <img v-if="row.logo || row.avatar" :src="row.logo || row.avatar" alt="avatar" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-600">{{ initials(row.partenaire) }}</div>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ row.partenaire }}</p>
                      <p class="text-xs text-gray-500">{{ row.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ row.categorie }}</td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ row.ville }}</td>
                <td class="px-3 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">{{ row.status }}</span>
                </td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ row.listings }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ row.reservations }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ row.revenueGeneres }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ row.commissionsNessia }}</td>
                <td class="px-3 py-3 text-sm text-gray-700">{{ row.noteMoyenne > 0 ? `${row.noteMoyenne}/5` : '—' }}</td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(row.inscritLe) }}</td>
                <td class="px-3 py-3">
                  <router-link
                    :to="{ name: 'partenaires.detail', params: { id: row.id } }"
                    class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                    aria-label="Voir detail"
                  >
                    <EyeIcon />
                  </router-link>
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
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getPartenairesTable, type PartenaireRow } from '@/services/partenaires'
import { EyeIcon } from '@/icons'

defineOptions({ name: 'PartenairesPage' })

const route = useRoute()
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const cityFilter = ref('')
const sortBy = ref('inscrit-desc')
const currentPage = ref(1)
const perPage = ref(10)
const rows = ref<PartenaireRow[]>([])

const currentView = computed(() => {
  return route.query.view === 'moderation' ? 'moderation' : 'active'
})

watch([searchQuery, statusFilter, categoryFilter, cityFilter, sortBy, perPage, currentView], () => {
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
  if (typeof value.seconds === 'number') {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value.seconds * 1000))
  }
  return '—'
}

const statusClass = (status?: string) => {
  if (status === 'approved') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'suspended' || status === 'rejected') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const totalRevenue = computed(() => rows.value.reduce((sum, row) => sum + row.revenueGeneres, 0))
const totalCommissions = computed(() => rows.value.reduce((sum, row) => sum + row.commissionsNessia, 0))
const activePartners = computed(() => rows.value.filter((row) => row.status === 'approved').length)
const pendingPartners = computed(() => rows.value.filter((row) => row.status === 'pending').length)
const totalPartners = computed(() => rows.value.length)

const toPercent = (value: number, total: number) => {
  if (!total) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

const activeRate = computed(() => toPercent(activePartners.value, totalPartners.value))
const pendingRate = computed(() => toPercent(pendingPartners.value, totalPartners.value))
const commissionRateOfRevenue = computed(() => toPercent(totalCommissions.value, totalRevenue.value))

const avgRevenuePerPartner = computed(() => {
  if (!totalPartners.value) return '0.0 Dhs'
  return `${(totalRevenue.value / totalPartners.value).toFixed(1)} Dhs`
})

const formatMoney = (value: number) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
  return `${formatted} Dhs`
}

const categoryOptions = computed(() => {
  const set = new Set<string>()
  for (const row of rows.value) {
    for (const part of row.categorie.split(',').map((entry) => entry.trim()).filter(Boolean)) {
      if (part !== '—') set.add(part)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
})

const cityOptions = computed(() => {
  const set = new Set(rows.value.map((row) => row.ville).filter((city) => city && city !== '—'))
  return [...set].sort((a, b) => a.localeCompare(b))
})

const filteredRows = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const matchesView = currentView.value === 'moderation'
      ? row.status !== 'approved'
      : row.status === 'approved'

    if (!matchesView) return false
    if (statusFilter.value && row.status !== statusFilter.value) return false
    if (categoryFilter.value && !row.categorie.toLowerCase().includes(categoryFilter.value.toLowerCase())) return false
    if (cityFilter.value && row.ville !== cityFilter.value) return false
    if (!needle) return true

    const haystack = [row.partenaire, row.email, row.categorie, row.ville].join(' ').toLowerCase()
    return haystack.includes(needle)
  })
})

const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    if (sortBy.value === 'revenue-desc') return b.revenueGeneres - a.revenueGeneres
    if (sortBy.value === 'revenue-asc') return a.revenueGeneres - b.revenueGeneres
    if (sortBy.value === 'rating-desc') return b.noteMoyenne - a.noteMoyenne
    if (sortBy.value === 'name-asc') return a.partenaire.localeCompare(b.partenaire)

    const aSeconds = a.inscritLe instanceof Date ? a.inscritLe.getTime() : (a.inscritLe?.seconds ?? 0) * 1000
    const bSeconds = b.inscritLe instanceof Date ? b.inscritLe.getTime() : (b.inscritLe?.seconds ?? 0) * 1000
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
    rows.value = await getPartenairesTable()
  } finally {
    loading.value = false
  }
})
</script>
