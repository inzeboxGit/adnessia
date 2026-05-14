<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Sponsoring" />
    <p class="mb-4 text-sm text-gray-500">Suivi des paiements de sponsoring et des campagnes sponsorisees.</p>

    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
            <wallet class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{{ sponsoringStats.revenuePct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Revenu sponsoring</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ formatCurrency(stats.totalAmount, 'MAD') }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-brand-500" :style="{ width: `${sponsoringStats.revenuePct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-info-100 bg-info-50 text-info-600">
            <inbox class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ stats.totalCampaigns }}</span>
        </div>
        <p class="text-xs text-gray-500">Campagnes</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalCampaigns }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-info-500" :style="{ width: `${sponsoringStats.totalPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-success-100 bg-success-50 text-success-600">
            <check-circle-2 class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{{ sponsoringStats.activePct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Actives</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.activeCampaigns }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-success-500" :style="{ width: `${sponsoringStats.activePct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-warning-100 bg-warning-50 text-warning-600">
            <ban class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700">{{ sponsoringStats.pausedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">En pause</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.pausedCampaigns }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-warning-500" :style="{ width: `${sponsoringStats.pausedPct}%` }" />
        </div>
      </article>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher un sponsoring..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterCategory" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Categorie</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>

        <input
          v-model="filterDate"
          type="date"
          class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Statut</option>
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>

        <select v-model.number="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option v-for="value in perPageOptions" :key="value" :value="value">{{ value }} / page</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Publication</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Categorie</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Agence</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Paiement</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Montant</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">Statut</p></th>
                <th class="px-5 py-3 text-center sm:px-6"><p class="font-medium text-[11px] text-gray-500 dark:text-gray-400">+</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Chargement...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-error-600 sm:px-6">{{ error }}</td>
              </tr>
              <tr v-else-if="paginatedItems.length === 0">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Aucun sponsoring trouve.</td>
              </tr>
              <template v-for="item in paginatedItems" :key="item.id">
                <tr class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4 sm:px-6">
                  <div style="min-width: 220px;">
                    <div class="font-semibold text-gray-800 dark:text-white">{{ item.publication.title }}</div>
                    <div class="text-xs text-gray-500">{{ item.publication.categoryLabel }} • {{ item.publication.city }}</div>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-theme-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300">{{ item.publication.categoryLabel }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div>
                    <div class="font-semibold text-gray-700 dark:text-white/90">{{ item.agencyDisplayName }}</div>
                    <div class="text-xs text-gray-500">{{ item.agencyDisplayCity }}</div>
                    <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ item.agency.id }}</span>
                      <button type="button" class="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]" @click="copyText(item.agency.id)">Copier</button>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div>
                    <div class="font-semibold text-gray-700 dark:text-white/90">{{ item.payment.reference }}</div>
                    <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ item.payment.id }}</span>
                      <button type="button" class="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]" @click="copyText(item.payment.id)">Copier</button>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-theme-sm sm:px-6">
                  <span class="font-semibold text-gray-700 dark:text-white/90">{{ formatCurrency(item.pricing.amount, item.pricing.currency) }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full px-2 py-0.5 text-theme-xs font-medium" :class="statusClassName(item.status)">{{ item.status }}</span>
                </td>
                <td class="px-5 py-4 text-center sm:px-6">
                  <button
                    type="button"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    @click="toggleExpand(item.id)"
                  >
                    {{ isExpanded(item.id) ? '−' : '+' }}
                  </button>
                </td>
              </tr>
              <tr v-if="isExpanded(item.id)" class="bg-gray-50/70 dark:bg-white/[0.02]">
                <td colspan="7" class="px-5 py-4 sm:px-6">
                  <div class="grid grid-cols-1 gap-3 text-xs text-gray-700 dark:text-gray-200 md:grid-cols-2 xl:grid-cols-4">
                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30">
                      <p class="text-[11px] text-gray-500">Duree</p>
                      <p class="mt-1 font-semibold">{{ item.durationDays }} jours</p>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30">
                      <p class="text-[11px] text-gray-500">Performance</p>
                      <p class="mt-1">Vues: <span class="font-semibold">{{ item.performance.views }}</span></p>
                      <p>Clics: <span class="font-semibold">{{ item.performance.clicks }}</span></p>
                      <p>Reservations: <span class="font-semibold">{{ item.performance.reservations }}</span></p>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30">
                      <p class="text-[11px] text-gray-500">Date de debut</p>
                      <p class="mt-1 font-semibold">{{ formatDate(item.startAt?.seconds) }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30">
                      <p class="text-[11px] text-gray-500">Date de fin</p>
                      <p class="mt-1 font-semibold">{{ formatDate(item.endAt?.seconds) }}</p>
                    </div>
                  </div>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <p>{{ totalRows }} campagne(s)</p>
        <div class="flex items-center gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700" :disabled="currentPage === 1" @click="currentPage -= 1">Precedent</button>
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700" :disabled="currentPage === totalPages" @click="currentPage += 1">Suivant</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Ban, CheckCircle2, Inbox, Wallet } from 'lucide-vue-next'
import type { Agence, SponsorCampaign } from '~/types'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getAgences } from '~/services/agences'
import { getSponsorCampaigns, getSponsoringStats } from '~/services/paiements'

type SponsoringRow = SponsorCampaign & {
  agencyDisplayName: string
  agencyDisplayCity: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterCategory = ref('')
const filterDate = ref('')
const filterStatus = ref('')
const perPage = ref(8)
const perPageOptions = [5, 8, 10, 20, 50]
const currentPage = ref(1)
const expandedRows = ref<Record<string, boolean>>({})

const stats = ref({
  totalAmount: 0,
  totalCampaigns: 0,
  activeCampaigns: 0,
  pausedCampaigns: 0,
})

const items = ref<SponsoringRow[]>([])

onMounted(async () => {
  try {
    const [campaigns, agences, sponsoringStats] = await Promise.all([
      getSponsorCampaigns(),
      getAgences(),
      getSponsoringStats(),
    ])

    stats.value = sponsoringStats

    const agenceMap = buildAgenceMap(agences)
    items.value = campaigns.map((campaign) => {
      const agence = agenceMap.get(campaign.agency.id)
      return {
        ...campaign,
        agencyDisplayName:
          agence?.nom
          || agence?.name
          || `${agence?.firstName ?? ''} ${agence?.lastName ?? ''}`.trim()
          || campaign.agency.id,
        agencyDisplayCity: agence?.ville || agence?.city || '—',
      }
    })
  } catch {
    error.value = 'Impossible de charger les sponsorings.'
  } finally {
    loading.value = false
  }
})

watch([searchQuery, filterCategory, filterDate, filterStatus, perPage], () => {
  currentPage.value = 1
  expandedRows.value = {}
})

const categories = computed(() => {
  return [...new Set(items.value.map((item) => item.publication.categoryLabel).filter(Boolean))].sort()
})

const sponsoringStats = computed(() => {
  const total = Math.max(0, Number(stats.value.totalCampaigns || 0))
  const active = Math.max(0, Number(stats.value.activeCampaigns || 0))
  const paused = Math.max(0, Number(stats.value.pausedCampaigns || 0))
  const toPct = (value: number) => {
    if (!total) return 0
    return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
  }

  const averageBudget = total ? Number(stats.value.totalAmount || 0) / total : 0
  const revenuePct = averageBudget > 0
    ? Math.max(10, Math.min(100, Math.round((averageBudget / 1500) * 100)))
    : 0

  return {
    totalPct: total > 0 ? 100 : 0,
    activePct: toPct(active),
    pausedPct: toPct(paused),
    revenuePct,
  }
})

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

const filteredItems = computed(() => {
  const query = normalize(searchQuery.value)

  return items.value.filter((item) => {
    const matchSearch = !query
      || normalize(String(item.payment.reference || '')).includes(query)
      || normalize(String(item.agency.id || '')).includes(query)
      || normalize(String(item.agencyDisplayName || '')).includes(query)
      || normalize(String(item.agencyDisplayCity || '')).includes(query)
      || normalize(String(item.publication.title || '')).includes(query)
      || normalize(String(item.publication.city || '')).includes(query)
      || normalize(String(item.publication.categoryLabel || '')).includes(query)

    const matchCategory = !filterCategory.value || item.publication.categoryLabel === filterCategory.value
    const matchDate = !filterDate.value || toInputDate(item.startAt?.seconds) === filterDate.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value

    return matchSearch && matchCategory && matchDate && matchStatus
  })
})

const totalRows = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / perPage.value)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredItems.value.slice(start, start + perPage.value)
})

const toInputDate = (seconds?: number) => {
  if (!seconds) return ''
  const date = new Date(seconds * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildAgenceMap = (agences: Agence[]) => {
  const map = new Map<string, Agence>()

  for (const agence of agences) {
    if (agence.id) map.set(agence.id, agence)
    if (agence.agenceRef) map.set(agence.agenceRef, agence)
    if (agence.uid) map.set(agence.uid, agence)
  }

  return map
}

const rowKey = (id?: string) => id || ''

const isExpanded = (id?: string) => {
  const key = rowKey(id)
  return key ? Boolean(expandedRows.value[key]) : false
}

const toggleExpand = (id?: string) => {
  const key = rowKey(id)
  if (!key) return
  expandedRows.value[key] = !expandedRows.value[key]
}

const copyText = async (value?: string) => {
  if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    window.alert('Impossible de copier.')
  }
}

const formatCurrency = (amount: number, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0))
}

const formatDate = (seconds?: number) => {
  if (!seconds) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(seconds * 1000))
}

const statusClassName = (status?: string) => {
  if (status === 'active') return 'bg-success-50 text-success-600'
  if (status === 'paused') return 'bg-warning-50 text-warning-600'
  if (status === 'completed') return 'bg-info-50 text-info-600'
  if (status === 'cancelled') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}
</script>
