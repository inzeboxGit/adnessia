<template>
  <admin-layout>
    <page-breadcrumb page-title="Moderation des avis" />
    <p class="mb-4 text-sm text-gray-500">Gestion des avis et suppression si necessaire.</p>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un avis a moderer..."
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
              <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Aucun avis a moderer.</td>
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
                  {{ item.approved ? 'Approuve' : 'Non approuve' }}
                </span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(item.createdAt) }}</td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="item.approved"
                    class="rounded-lg bg-warning-500 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="updatingPath === item.path || deletingPath === item.path"
                    @click="handleApprovalToggle(item)"
                  >
                    {{ updatingPath === item.path ? '...' : 'Retirer' }}
                  </button>

                  <button
                    class="rounded-lg bg-error-500 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="deletingPath === item.path || updatingPath === item.path"
                    @click="handleDelete(item)"
                  >
                    {{ deletingPath === item.path ? '...' : 'Supprimer' }}
                  </button>
                </div>
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
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import {
  deleteCustomerReview,
  getAllCustomerReviews,
  type CustomerReviewListItem,
  updateCustomerReviewApproval,
} from '~/services/reviews'

defineOptions({ name: 'ReviewModerationPage' })

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const perPage = ref(8)
const currentPage = ref(1)
const items = ref<CustomerReviewListItem[]>([])
const deletingPath = ref<string | null>(null)
const updatingPath = ref<string | null>(null)

const perPageOptions = [5, 8, 10, 20, 50]

const loadReviews = async () => {
  loading.value = true
  error.value = null

  try {
    items.value = await getAllCustomerReviews()

    const preselectedReviewId = String(route.query.review || '')
    if (preselectedReviewId) {
      searchQuery.value = preselectedReviewId
    }
  } catch {
    error.value = 'Impossible de charger les avis a moderer.'
  } finally {
    loading.value = false
  }
}

onMounted(loadReviews)

watch([searchQuery, perPage], () => {
  currentPage.value = 1
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return items.value.filter((item) => {
    return !query
      || String(item.id).toLowerCase().includes(query)
      || String(item.userName || '').toLowerCase().includes(query)
      || String(item.category || '').toLowerCase().includes(query)
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

const handleDelete = async (item: CustomerReviewListItem) => {
  const confirmed = window.confirm(`Supprimer l'avis de ${item.userName || 'ce client'} ?`)
  if (!confirmed) return

  deletingPath.value = item.path
  try {
    await deleteCustomerReview(item.path)
    items.value = items.value.filter((entry) => entry.path !== item.path)
  } catch {
    window.alert('Impossible de supprimer cet avis.')
  } finally {
    deletingPath.value = null
  }
}

const handleApprovalToggle = async (item: CustomerReviewListItem) => {
  updatingPath.value = item.path
  try {
    await updateCustomerReviewApproval(item.path, !item.approved)
    items.value = items.value.map((entry) => (
      entry.path === item.path
        ? { ...entry, approved: !entry.approved }
        : entry
    ))
  } catch {
    window.alert('Impossible de mettre a jour le statut de cet avis.')
  } finally {
    updatingPath.value = null
  }
}
</script>
