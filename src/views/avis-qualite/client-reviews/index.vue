<template>
  <admin-layout>
    <page-breadcrumb page-title="Liste des avis clients" />
    <p class="mb-4 text-sm text-gray-500">Suivi centralise des avis deposes par les clients.</p>

    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-info-100 bg-info-50 text-info-600">
            <message-square class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ reviewStats.total }}</span>
        </div>
        <p class="text-xs text-gray-500">Total avis</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewStats.total }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-info-500" :style="{ width: `${reviewStats.totalPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-success-100 bg-success-50 text-success-600">
            <check-circle-2 class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{{ reviewStats.approvedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Approuves</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewStats.approved }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-success-500" :style="{ width: `${reviewStats.approvedPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-warning-100 bg-warning-50 text-warning-600">
            <clock-3 class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700">{{ reviewStats.pendingPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">En attente</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewStats.pending }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-warning-500" :style="{ width: `${reviewStats.pendingPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
            <star class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{{ reviewStats.averageRating.toFixed(1) }}/5</span>
        </div>
        <p class="text-xs text-gray-500">Note moyenne</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ reviewStats.averageRating.toFixed(1) }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-brand-500" :style="{ width: `${reviewStats.ratingPct}%` }" />
        </div>
      </article>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un avis..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none md:max-w-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model.number="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }} / page</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="min-w-full divide-y divide-gray-100">
          <thead>
            <tr class="bg-gray-50">
              <th class="th">Client</th>
              <th class="th">Categorie</th>
              <th class="th">Note</th>
              <th class="th">Avis</th>
              <th class="th">Titre</th>
              <th class="th">Statut</th>
              <th class="th">Date</th>
              <th class="th">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loading">
              <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="8" class="px-3 py-10 text-center text-sm text-error-600">{{ error }}</td>
            </tr>
            <tr v-else-if="pagedItems.length === 0">
              <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Aucun avis client trouve.</td>
            </tr>

            <tr v-for="item in pagedItems" :key="item.id" class="hover:bg-gray-50/80">
              <td class="px-3 py-3">
                <div class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.userName || '—' }}</div>
                <div class="text-xs text-gray-500">{{ item.userId || item.customerId || '—' }}</div>
              </td>
              <td class="px-3 py-3"><span class="rounded-full bg-blue-light-50 px-2 py-0.5 text-xs text-blue-light-600">{{ item.category }}</span></td>
              <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ item.rating }}/5</td>
              <td class="px-3 py-3 text-sm text-gray-700">{{ item.comment || '—' }}</td>
              <td class="px-3 py-3 text-sm text-gray-700">{{ item.sourceTitle }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="item.approved ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'">
                  {{ item.approved ? 'Approuve' : 'En attente' }}
                </span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(item.createdAt) }}</td>
              <td class="px-3 py-3">
                <router-link :to="{ path: '/quality/review-moderation', query: { review: item.id } }" class="rounded-lg border border-error-200 px-2 py-1 text-xs text-error-600 hover:bg-error-50">
                  Moderer
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-sm text-gray-500">{{ filteredItems.length }} avis</p>
        <div class="flex items-center gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage -= 1">Precedent</button>
          <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage += 1">Suivant</button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CheckCircle2, Clock3, MessageSquare, Star } from 'lucide-vue-next'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getAllCustomerReviews, type CustomerReviewListItem } from '~/services/reviews'

defineOptions({ name: 'ClientReviewsPage' })

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const perPage = ref(8)
const currentPage = ref(1)
const items = ref<CustomerReviewListItem[]>([])

const perPageOptions = [5, 8, 10, 20, 50]

onMounted(async () => {
  try {
    items.value = await getAllCustomerReviews()
  } catch {
    error.value = 'Impossible de charger les avis clients.'
  } finally {
    loading.value = false
  }
})

watch([searchQuery, perPage], () => {
  currentPage.value = 1
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return items.value.filter((item) => {
    return !query
      || String(item.category || '').toLowerCase().includes(query)
      || String(item.userName || '').toLowerCase().includes(query)
      || String(item.userId || '').toLowerCase().includes(query)
      || String(item.customerId || '').toLowerCase().includes(query)
      || String(item.comment || '').toLowerCase().includes(query)
      || String(item.sourceTitle || '').toLowerCase().includes(query)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage.value)))

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredItems.value.slice(start, start + perPage.value)
})

const reviewStats = computed(() => {
  const total = items.value.length
  const approved = items.value.filter((item) => Boolean(item.approved)).length
  const pending = Math.max(0, total - approved)
  const ratingSum = items.value.reduce((sum, item) => sum + Number(item.rating || 0), 0)
  const averageRating = total ? ratingSum / total : 0

  const toPct = (value: number) => {
    if (!total) return 0
    return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
  }

  return {
    total,
    approved,
    pending,
    averageRating,
    totalPct: total > 0 ? 100 : 0,
    approvedPct: toPct(approved),
    pendingPct: toPct(pending),
    ratingPct: Math.max(0, Math.min(100, Math.round((averageRating / 5) * 100))),
  }
})

const formatDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return '—'
  const date = value instanceof Date ? value : value.seconds ? new Date(value.seconds * 1000) : null
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
