<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Rechercher une reservation..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      />

      <select v-model="filterCategory" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Categorie</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>

      <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Statut</option>
        <option value="confirmee">Confirme</option>
        <option value="pending">En attente</option>
        <option value="annulee">Annule</option>
        <option value="refunded">Annule</option>
      </select>

      <select v-model="filterCity" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Ville</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
      </select>

      <input
        v-model="filterDate"
        type="date"
        class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      />

      <select v-model="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option :value="5">5 / page</option>
        <option :value="8">8 / page</option>
        <option :value="10">10 / page</option>
        <option :value="15">15 / page</option>
        <option :value="20">20 / page</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="min-w-full divide-y divide-gray-100">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Titre</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Categorie</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Prestataire</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Client</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Ville</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Montant</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Statut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-if="loading">
            <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="8" class="px-3 py-10 text-center text-sm text-error-600">{{ error }}</td>
          </tr>
          <tr v-else-if="paginatedReservations.length === 0">
            <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Aucune reservation trouvee.</td>
          </tr>
          <tr v-for="item in paginatedReservations" :key="item.id" class="hover:bg-gray-50/80">
            <td class="px-3 py-3">
              <div class="min-w-[220px]">
                <p class="text-sm font-semibold text-gray-800">{{ item.title }}</p>
                <p class="text-xs text-gray-500">{{ item.raw.reference || item.id }}</p>
              </div>
            </td>
            <td class="px-3 py-3"><span class="rounded-full border px-2 py-0.5 text-xs" :class="categoryBadgeClass(item.category)">{{ item.category }}</span></td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ item.providerName }}</td>
            <td class="px-3 py-3 text-sm text-gray-700">{{ item.clientName }}</td>
            <td class="px-3 py-3 text-sm text-gray-500">{{ item.city || '—' }}</td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(item.amount, item.currency) }}</td>
            <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(item.date) }}</td>
            <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(item.status)">{{ statusLabel(item.status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ filteredReservations.length }} resultat(s)</p>
      <div class="flex items-center gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage <= 1" @click="currentPage -= 1">Precedent</button>
        <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage >= totalPages" @click="currentPage += 1">Suivant</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CentralizedReservationItem } from '~/services/reservations'
import { toDate } from '@/services/reservations-dashboard'

const props = defineProps<{
  reservations: CentralizedReservationItem[]
  loading: boolean
  error: string | null
}>()

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterCity = ref('')
const filterDate = ref('')
const perPage = ref(8)
const currentPage = ref(1)

watch([searchQuery, filterCategory, filterStatus, filterCity, filterDate, perPage], () => {
  currentPage.value = 1
})

const categories = computed(() => [...new Set(props.reservations.map((item) => item.category).filter(Boolean))].sort())
const cities = computed(() => [...new Set(props.reservations.map((item) => item.city).filter((city) => city && city !== '—'))].sort())

const toInputDate = (value?: Date | { seconds?: number } | null) => {
  const date = toDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const filteredReservations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return props.reservations.filter((item) => {
    const matchSearch = !query
      || item.title.toLowerCase().includes(query)
      || item.providerName.toLowerCase().includes(query)
      || item.clientName.toLowerCase().includes(query)
      || item.city.toLowerCase().includes(query)
      || item.category.toLowerCase().includes(query)

    const matchCategory = !filterCategory.value || item.category === filterCategory.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    const matchCity = !filterCity.value || item.city === filterCity.value
    const matchDate = !filterDate.value || toInputDate(item.date) === filterDate.value

    return matchSearch && matchCategory && matchStatus && matchCity && matchDate
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredReservations.value.length / perPage.value)))

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredReservations.value.slice(start, start + perPage.value)
})

const formatDate = (value?: Date | { seconds?: number } | null) => {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatCurrency = (amount?: number, currency = 'MAD') => {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const statusLabel = (status: string) => {
  if (status === 'confirmee') return 'Confirme'
  if (status === 'pending') return 'En attente'
  if (status === 'annulee' || status === 'refunded') return 'Annule'
  return status
}

const statusBadgeClass = (status: string) => {
  if (status === 'confirmee') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'annulee' || status === 'refunded') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const categoryBadgeClass = (category: string) => {
  const value = category.toLowerCase()
  if (value.includes('hebergement')) return 'bg-blue-light-50 text-blue-light-600 border-blue-light-100'
  if (value.includes('activit')) return 'bg-warning-50 text-warning-600 border-warning-100'
  if (value.includes('location')) return 'bg-success-50 text-success-600 border-success-100'
  if (value.includes('vtc')) return 'bg-brand-50 text-brand-600 border-brand-100'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}
</script>
