<template>
  <admin-layout>
    <page-breadcrumb page-title="Liste de partenaires" />

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article class="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Prestataires</p>
              <p class="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{{ totalProviders }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-blue-600/80 dark:text-blue-300/80">Base totale active</p>
          <div class="h-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60">
            <div class="h-full rounded-full bg-blue-500" style="width: 100%" />
          </div>
        </article>

        <article class="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Approuves</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{{ approvedProvidersCount }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-emerald-600/80 dark:text-emerald-300/80">Taux: {{ approvedProvidersRate }}%</p>
          <div class="h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60">
            <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${approvedProvidersRate}%` }" />
          </div>
        </article>

        <article class="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">En attente de validation</p>
              <p class="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-200">{{ pendingProvidersCount }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-amber-600/80 dark:text-amber-300/80">Taux: {{ pendingProvidersRate }}%</p>
          <div class="h-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
            <div class="h-full rounded-full bg-amber-500" :style="{ width: `${pendingProvidersRate}%` }" />
          </div>
        </article>

        <article class="rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Reservations</p>
              <p class="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-200">{{ formatCompactNumber(totalReservations) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-violet-600/80 dark:text-violet-300/80">Moyenne / prestataire: {{ reservationsPerProvider }}</p>
          <div class="h-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60">
            <div class="h-full rounded-full bg-violet-500" :style="{ width: `${approvedProvidersRate}%` }" />
          </div>
        </article>

        <article class="rounded-2xl border border-cyan-200/70 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Revenue confirme</p>
              <p class="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-200">{{ formatRevenue(totalRevenue) }}</p>
            </div>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </span>
          </div>
          <p class="mb-1 text-xs text-cyan-600/80 dark:text-cyan-300/80">Part approuvee: {{ approvedRevenueRate }}%</p>
          <div class="h-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60">
            <div class="h-full rounded-full bg-cyan-500" :style="{ width: `${approvedRevenueRate}%` }" />
          </div>
        </article>
      </div>

      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="relative w-full md:max-w-sm">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un prestataire..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="statusFilter"
            class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">Tous statuts</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ formatStatusLabel(status) }}
            </option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Prestataire</th>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Catégories</th>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Réservations</th>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Revenue</th>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th class="border-b border-gray-100 px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Last Login</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && paginatedProviders.length === 0">
              <td colspan="6" class="px-3 py-10 text-center text-sm text-gray-500">Aucun prestataire trouvé.</td>
            </tr>
            <tr v-for="provider in paginatedProviders" :key="provider.id" class="border-b border-gray-100">
              <td class="px-3 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    <img v-if="provider.logo || provider.avatar" :src="provider.logo || provider.avatar" alt="avatar" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-600">{{ initials(provider) }}</div>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ agencyName(provider) }}</p>
                    <p class="text-xs text-gray-500">{{ fullName(provider) }}</p>
                    <p class="text-xs text-gray-500">{{ provider.email || '—' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="service in provider.selectedServices || []"
                    :key="service"
                    class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {{ service }}
                  </span>
                  <span v-if="!(provider.selectedServices || []).length" class="text-sm text-gray-500">—</span>
                </div>
              </td>
              <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ provider.metrics.reservations }}</td>
              <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ provider.metrics.revenue }} {{ provider.currency || 'MAD' }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(providerStatus(provider))">
                  {{ formatStatusLabel(providerStatus(provider)) }}
                </span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(provider.lastLogin) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-sm text-gray-500">{{ filteredProviders.length }} résultat(s)</p>
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="currentPage -= 1"
          >
            Précédent
          </button>
          <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
          <button
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage += 1"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, onMounted, ref, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { db } from '~/config/firebase'
import type { Agence } from '~/types'

defineOptions({
  name: 'PartnersOpportunities',
})

type ProviderItem = Agence & {
  id: string
  metrics: {
    reservations: number
    revenue: number
  }
}

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const providers = ref<ProviderItem[]>([])

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

const agencyName = (agence: Partial<Agence>) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

const fullName = (agence: Partial<Agence>) => {
  const value = `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim()
  return value || '—'
}

const initials = (agence: Partial<Agence>) => {
  return agencyName(agence)
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?'
}

const formatDate = (value?: { seconds?: number } | null) => {
  if (!value?.seconds) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value.seconds * 1000))
}

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()

const providerStatus = (provider: Partial<Agence> & { status?: string, applicationStatus?: string }) => {
  return normalizeStatus(provider.applicationStatus || provider.status)
}

const formatStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status)
  if (!normalized) return '—'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusClass = (status?: string) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'approved' || normalized === 'passed') return 'bg-success-50 text-success-600'
  if (normalized === 'pending') return 'bg-warning-50 text-warning-600'
  if (normalized === 'suspended' || normalized === 'rejected') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const statusOptions = computed(() => {
  const unique = new Set<string>()
  for (const provider of providers.value) {
    const status = providerStatus(provider)
    if (status) unique.add(status)
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b))
})

const filteredProviders = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase()

  return providers.value.filter((provider) => {
    if (statusFilter.value && providerStatus(provider) !== statusFilter.value) return false

    if (!needle) return true

    const haystack = [
      agencyName(provider),
      provider.email,
      provider.city,
      provider.ville,
      ...(provider.selectedServices || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProviders.value.length / perPage.value))
})

const totalProviders = computed(() => providers.value.length)

const approvedProvidersCount = computed(() => {
  return providers.value.filter((provider) => {
    const status = providerStatus(provider)
    return status === 'approved' || status === 'passed'
  }).length
})

const pendingProvidersCount = computed(() => {
  return providers.value.filter((provider) => providerStatus(provider) === 'pending').length
})

const totalReservations = computed(() => {
  return providers.value.reduce((sum, provider) => sum + Number(provider.metrics.reservations || 0), 0)
})

const totalRevenue = computed(() => {
  return providers.value.reduce((sum, provider) => sum + Number(provider.metrics.revenue || 0), 0)
})

const approvedRevenue = computed(() => {
  return providers.value
    .filter((provider) => {
      const status = providerStatus(provider)
      return status === 'approved' || status === 'passed'
    })
    .reduce((sum, provider) => sum + Number(provider.metrics.revenue || 0), 0)
})

const toPercent = (value: number, total: number) => {
  if (!total) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

const approvedProvidersRate = computed(() => toPercent(approvedProvidersCount.value, totalProviders.value))
const pendingProvidersRate = computed(() => toPercent(pendingProvidersCount.value, totalProviders.value))
const approvedRevenueRate = computed(() => toPercent(approvedRevenue.value, totalRevenue.value))

const reservationsPerProvider = computed(() => {
  if (!totalProviders.value) return '0.0'
  return (totalReservations.value / totalProviders.value).toFixed(1)
})

const formatCompactNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value)
}

const formatRevenue = (value: number) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
  return `${formatted} Dhs`
}

const paginatedProviders = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredProviders.value.slice(start, start + perPage.value)
})

onMounted(async () => {
  try {
    const [agencesSnap, reservationsSnap, paiementsSnap] = await Promise.all([
      getDocs(collection(db, 'agences')),
      getDocs(collection(db, 'reservations')),
      getDocs(collection(db, 'paiements')),
    ])

    const reservationsByProvider = new Map<string, number>()
    for (const reservationDoc of reservationsSnap.docs) {
      const data = reservationDoc.data() as Record<string, unknown>
      const providerKey = String(data.agenceRef || data.agenceId || '')
      if (!providerKey) continue
      reservationsByProvider.set(providerKey, (reservationsByProvider.get(providerKey) || 0) + 1)
    }

    const revenueByProvider = new Map<string, number>()
    for (const paiementDoc of paiementsSnap.docs) {
      const data = paiementDoc.data() as Record<string, unknown>
      const providerKey = String(data.agenceRef || '')
      const amount = Number(data.montant || 0)
      if (!providerKey) continue
      if (String(data.statut || '') !== 'confirmed') continue
      revenueByProvider.set(providerKey, (revenueByProvider.get(providerKey) || 0) + amount)
    }

    providers.value = agencesSnap.docs.map((doc) => {
      const data = doc.data() as Agence
      const keys = [doc.id, data.uid, data.agenceRef].filter(Boolean) as string[]
      const reservations = keys.reduce((sum, key) => sum + (reservationsByProvider.get(key) || 0), 0)
      const revenue = keys.reduce((sum, key) => sum + (revenueByProvider.get(key) || 0), 0)

      return {
        id: doc.id,
        ...data,
        metrics: {
          reservations,
          revenue,
        },
      }
    })
  } finally {
    loading.value = false
  }
})
</script>
