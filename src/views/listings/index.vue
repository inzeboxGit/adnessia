<template>
  <admin-layout>
    <div class="min-w-0 overflow-x-hidden">
      <page-breadcrumb page-title="Liste des annonces" />
      <p class="mb-4 text-sm text-gray-500">Vue centralisee des annonces partenaires par categorie.</p>

      <div class="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher une annonce..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterCategory" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Categories</option>
          <option value="ACTIVITE">Activite</option>
          <option value="HEBERGEMENT">Hebergement</option>
          <option value="LOCATION_VOITURE">Location de voiture</option>
          <option value="VTC">VTC</option>
        </select>

        <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Statut</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="draft">draft</option>
          <option value="rejected">rejected</option>
          <option value="trashed">trashed</option>
        </select>

        <input
          v-model="filterDateFrom"
          type="date"
          class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <input
          v-model="filterDateTo"
          type="date"
          class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select
          v-if="filterCategory === 'HEBERGEMENT'"
          v-model="filterHebergementCity"
          class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="">Ville (hebergement)</option>
          <option v-for="city in hebergementCityOptions" :key="city" :value="city">{{ city }}</option>
        </select>

        <select
          v-if="filterCategory === 'HEBERGEMENT'"
          v-model="filterHebergementType"
          class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="">Type hebergement</option>
          <option value="riad">Riad</option>
          <option value="hotel">Hotel</option>
          <option value="hôtel">Hôtel</option>
          <option value="appartement">Appartement</option>
        </select>

        <label class="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
          <input v-model="filterSignaledOnly" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
          Signalées
        </label>
      </div>

      <div class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="w-full max-w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table class="w-max min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Annonce</p>
                </th>
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Partenaire</p>
                </th>
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ville</p>
                </th>
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Moderation</p>
                </th>
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Creee le</p>
                </th>
                <th class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading" class="border-t border-gray-100 dark:border-gray-800">
                <td colspan="6" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Chargement...</td>
              </tr>
              <tr v-else-if="error" class="border-t border-gray-100 dark:border-gray-800">
                <td colspan="6" class="px-5 py-10 text-center text-theme-sm text-error-600 sm:px-6">{{ error }}</td>
              </tr>
              <tr v-else-if="filteredItems.length === 0" class="border-t border-gray-100 dark:border-gray-800">
                <td colspan="6" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Aucune annonce trouvee.</td>
              </tr>
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="border-t border-gray-100 dark:border-gray-800"
                :class="item.signaled ? 'bg-error-50/50 dark:bg-error-500/10' : ''"
              >
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex min-w-[260px] items-center gap-3">
                    <div v-if="item.image" class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <img :src="item.image" :alt="item.title" class="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ item.title }}</span>
                      <span class="mt-1 flex items-center gap-1.5 text-theme-xs">
                        <span
                          class="inline-flex w-fit rounded-full border px-2 py-0.5 font-medium"
                          :style="categoryBadgeStyle(item.category)"
                        >
                          {{ categoryLabel(item.category) }}
                        </span>
                        <span
                          v-if="listingTypeLabel(item)"
                          class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-medium text-gray-600 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300"
                        >
                          {{ listingTypeLabel(item) }}
                        </span>
                        <span v-if="item.signaled" class="font-semibold text-error-600 dark:text-error-400">Signalee</span>
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="block font-medium text-gray-700 text-theme-sm dark:text-white/90">{{ item.providerName }}</span>
                  <router-link
                    v-if="item.providerId"
                    :to="{ name: 'partenaires.detail', params: { id: item.providerId } }"
                    class="block text-theme-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Voir le partenaire
                  </router-link>
                  <span v-else class="block text-gray-500 text-theme-xs dark:text-gray-400">—</span>
                </td> 
                <td class="px-5 py-4 text-theme-sm sm:px-6">
                  <span v-if="!isCityMissing(item.city)" class="text-gray-500 dark:text-gray-400">{{ item.city }}</span>
                  <span v-else class="font-semibold text-error-600 dark:text-error-400">✖</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full px-2 py-0.5 text-theme-xs font-medium" :class="moderationBadgeClass(item.moderation.status || '')">
                    {{ moderationLabel(item.moderation.status || '') }}
                  </span>
                </td>
                <td class="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-400 sm:px-6">{{ formatDate(item.createdAt) }}</td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-2 whitespace-nowrap">
                    <div class="group relative inline-flex">
                      <router-link
                        class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        :to="{ name: 'listings.detail', params: { category: item.category, id: item.id } }"
                        aria-label="Voir le detail"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M2 12C3.9 7.9 7.5 5 12 5C16.5 5 20.1 7.9 22 12C20.1 16.1 16.5 19 12 19C7.5 19 3.9 16.1 2 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                        </svg>
                      </router-link>
                      <span class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-0 group-hover:opacity-100 group-focus-within:opacity-100">Voir le detail</span>
                    </div>

                    <div class="group relative inline-flex">
                      <button class="rounded-lg bg-success-500 px-2 py-1 text-theme-xs font-medium text-white disabled:opacity-50" :disabled="updatingListingId === item.id || item.moderation.status === 'approved'" @click="handleApprove(item)">Approuver</button>
                      <span class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-0 group-hover:opacity-100 group-focus-within:opacity-100">Valider cette annonce</span>
                    </div>

                    <div class="group relative inline-flex">
                      <button
                        class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-error-500 text-white disabled:opacity-50"
                        :disabled="updatingListingId === item.id"
                        @click="openRejectModal(item)"
                        aria-label="Rejeter"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/>
                          <path d="M8.5 15.5L15.5 8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                      </button>
                      <span class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-0 group-hover:opacity-100 group-focus-within:opacity-100">Rejeter avec motif</span>
                    </div>

                    <div class="group relative inline-flex">
                      <button
                        class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 text-white disabled:opacity-50 dark:bg-gray-600"
                        :disabled="updatingListingId === item.id"
                        @click="onDeleteClick(item)"
                        aria-label="Supprimer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M3 6H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                          <path d="M8 6V4.5C8 3.7 8.7 3 9.5 3H14.5C15.3 3 16 3.7 16 4.5V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                          <path d="M6.5 6L7.3 18.2C7.4 19.3 8.3 20.1 9.4 20.1H14.6C15.7 20.1 16.6 19.3 16.7 18.2L17.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                          <path d="M10 10V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                          <path d="M14 10V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                      </button>
                      <span class="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity duration-0 group-hover:opacity-100 group-focus-within:opacity-100">Supprimer definitivement</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>

    <div v-if="selectedListing" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="closeRejectModal">
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Motif de rejet</h3>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ selectedListing.title }}</div>
        <textarea v-model="rejectReason" rows="5" class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" placeholder="Ajouter le motif du rejet..." />
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="closeRejectModal">Annuler</button>
          <button class="rounded-lg bg-error-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="rejecting || !rejectReason.trim()" @click="handleRejectConfirm">{{ rejecting ? 'Enregistrement...' : 'Valider le rejet' }}</button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PartnerListingCategory, PartnerListingListItem } from '~/models/listings'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { approvePartnerListing, deletePartnerListing, getPartnerListings, rejectPartnerListing } from '~/services/listings'

defineOptions({ name: 'ListingsPage' })

const loading = ref(true)
const error = ref<string | null>(null)
const items = ref<PartnerListingListItem[]>([])
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterHebergementCity = ref('')
const filterHebergementType = ref('')
const filterSignaledOnly = ref(false)
const updatingListingId = ref<string | null>(null)
const rejecting = ref(false)
const selectedListing = ref<PartnerListingListItem | null>(null)
const rejectReason = ref('')

onMounted(async () => {
  try {
    items.value = await getPartnerListings()
  } catch {
    error.value = 'Impossible de charger les annonces partenaires.'
  } finally {
    loading.value = false
  }
})

const hebergementCityOptions = computed(() => {
  const cities = items.value
    .filter((item) => item.category === 'HEBERGEMENT')
    .map((item) => item.city)
    .filter((city) => !isCityMissing(city))

  return Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, 'fr'))
})

const normalizeText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const isCityMissing = (value: string) => {
  const normalized = normalizeText(value)
  return !normalized || normalized === '-' || normalized === '—'
}

const getListingDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (value.seconds) return new Date(value.seconds * 1000)
  return null
}

const getListingType = (item: PartnerListingListItem) => {
  const value = item.category === 'HEBERGEMENT'
    ? item.raw.typeHebergement || item.raw.tyHebergement || item.raw.type
    : item.raw.type

  return typeof value === 'string' ? normalizeText(value) : ''
}

const filteredItems = computed(() => {
  const query = normalizeText(searchQuery.value)
  const dateFrom = filterDateFrom.value ? new Date(`${filterDateFrom.value}T00:00:00`) : null
  const dateTo = filterDateTo.value ? new Date(`${filterDateTo.value}T23:59:59`) : null
  const hebergementType = normalizeText(filterHebergementType.value)

  return items.value.filter((item) => {
    const matchQuery = !query
      || normalizeText(item.title).includes(query)
      || normalizeText(item.providerName).includes(query)
      || normalizeText(item.city).includes(query)
      || item.id.toLowerCase().includes(query)

    const matchCategory = !filterCategory.value || item.category === filterCategory.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    const matchSignaled = !filterSignaledOnly.value || item.signaled
    const itemDate = getListingDate(item.createdAt)
    const matchDateFrom = !dateFrom || (itemDate !== null && itemDate >= dateFrom)
    const matchDateTo = !dateTo || (itemDate !== null && itemDate <= dateTo)
    const matchHebergementCity = filterCategory.value !== 'HEBERGEMENT'
      || !filterHebergementCity.value
      || item.city === filterHebergementCity.value
    const matchHebergementType = filterCategory.value !== 'HEBERGEMENT'
      || !hebergementType
      || getListingType(item).includes(hebergementType)

    return matchQuery
      && matchCategory
      && matchStatus
      && matchSignaled
      && matchDateFrom
      && matchDateTo
      && matchHebergementCity
      && matchHebergementType
  })
})

const formatDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return '—'
  const date = value instanceof Date ? value : value.seconds ? new Date(value.seconds * 1000) : null
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const categoryLabel = (category: PartnerListingCategory) => {
  if (category === 'ACTIVITE') return 'Activite'
  if (category === 'HEBERGEMENT') return 'Hebergement'
  if (category === 'LOCATION_VOITURE') return 'Location'
  return 'VTC'
}

const categoryBadgeStyle = (category: PartnerListingCategory) => {
  const colorMap: Record<PartnerListingCategory, string> = {
    HEBERGEMENT: '#34BBF7',
    LOCATION_VOITURE: '#56C42B',
    VTC: '#AB73FD',
    ACTIVITE: '#FF700C',
  }

  const color = colorMap[category]
  return {
    color,
    borderColor: color,
    backgroundColor: `${color}1A`,
  }
}

const listingTypeLabel = (item: PartnerListingListItem) => {
  const value = getListingType(item)
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : ''
}

const statusBadgeClass = (status: string) => {
  if (status === 'active') return 'bg-success-50 text-success-600'
  if (status === 'inactive') return 'bg-warning-50 text-warning-600'
  if (status === 'draft') return 'bg-gray-100 text-gray-600'
  if (status === 'rejected') return 'bg-error-50 text-error-600'
  if (status === 'trashed') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  return 'bg-gray-100 text-gray-600'
}

const moderationLabel = (status: string) => {
  if (status === 'approved') return 'Approuve'
  if (status === 'rejected') return 'Rejete'
  if (status === 'trashed') return 'Supprime'
  if (status === 'pending') return 'En attente'
  return status || 'En attente'
}

const moderationBadgeClass = (status: string) => {
  if (status === 'approved') return 'bg-success-50 text-success-600'
  if (status === 'rejected') return 'bg-error-50 text-error-600'
  if (status === 'trashed') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  return 'bg-gray-100 text-gray-600'
}

const patchLocalListing = (id: string, payload: Partial<PartnerListingListItem>) => {
  items.value = items.value.map((item) => item.id === id ? { ...item, ...payload } : item)
}

const handleApprove = async (item: PartnerListingListItem) => {
  updatingListingId.value = item.id
  try {
    await approvePartnerListing(item.category, item.id)
    patchLocalListing(item.id, {
      approved: true,
      status: 'active',
      rejectedReason: '',
      moderation: {
        ...item.moderation,
        approved: true,
        status: 'approved',
        reason: '',
        reviewedAt: new Date(),
      },
    })
  } catch {
    window.alert('Impossible d\'approuver cette annonce.')
  } finally {
    updatingListingId.value = null
  }
}

const openRejectModal = (item: PartnerListingListItem) => {
  selectedListing.value = item
  rejectReason.value = item.rejectedReason || ''
}

const closeRejectModal = () => {
  selectedListing.value = null
  rejectReason.value = ''
  rejecting.value = false
}

const handleRejectConfirm = async () => {
  if (!selectedListing.value || !rejectReason.value.trim()) return

  rejecting.value = true
  updatingListingId.value = selectedListing.value.id
  try {
    await rejectPartnerListing(selectedListing.value.category, selectedListing.value.id, rejectReason.value.trim())
    patchLocalListing(selectedListing.value.id, {
      approved: false,
      status: 'rejected',
      rejectedReason: rejectReason.value.trim(),
      moderation: {
        ...selectedListing.value.moderation,
        approved: false,
        status: 'rejected',
        reason: rejectReason.value.trim(),
        reviewedAt: new Date(),
      },
    })
    closeRejectModal()
  } catch {
    window.alert('Impossible d\'enregistrer le rejet.')
  } finally {
    updatingListingId.value = null
    rejecting.value = false
  }
}

async function onDeleteClick(item: PartnerListingListItem) {
  if (!window.confirm(`Confirmer la suppression de l'annonce "${item.title}" ?`)) return

  updatingListingId.value = item.id
  try {
    await deletePartnerListing(item.category, item.id)
    items.value = items.value.filter((listing) => listing.id !== item.id)
  } catch {
    window.alert('Impossible de supprimer definitivement cette annonce.')
  } finally {
    updatingListingId.value = null
  }
}
</script>
