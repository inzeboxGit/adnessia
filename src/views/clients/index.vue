<template>
  <admin-layout>
    <page-breadcrumb page-title="Liste des clients" />

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          v-model="search"
          type="search"
          placeholder="Nom, email, telephone ou ville..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterVille" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Toutes les villes</option>
          <option v-for="ville in villes" :key="ville" :value="ville">{{ ville }}</option>
        </select>

        <select v-model="filterStatut" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendu</option>
        </select>

        <select v-model="filterNote" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Toutes les notes</option>
          <option value="4">4 et +</option>
          <option value="3">3 et +</option>
          <option value="2">2 et +</option>
          <option value="1">1 et +</option>
        </select>

        <button class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" :title="paymentSortTitle" @click="togglePaymentSort">
          {{ paymentSortLabel }}
        </button>

        <button
          class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          :disabled="!search && !filterVille && !filterStatut && !filterNote && !filterPaymentSort"
          @click="resetFilters"
        >
          Reinit.
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="min-w-full divide-y divide-gray-100">
          <thead>
            <tr class="bg-gray-50">
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Client</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Telephone</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Email</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400th">Reservations</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Depenses</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Note</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cree le</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Langue</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ville</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Statut</th>
              <th class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loading">
              <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="11" class="px-3 py-10 text-center text-sm text-error-600">{{ error }}</td>
            </tr>
            <tr v-else-if="paginated.length === 0">
              <td colspan="11" class="px-3 py-10 text-center text-sm text-gray-500">Aucun client trouve.</td>
            </tr>

            <tr v-for="customer in paginated" :key="customer.id" class="hover:bg-gray-50/80">
              <td class="px-3 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                    {{ initials(customer) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ displayName(customer) }}</p>
                    <p class="text-xs text-gray-500">{{ customer.city || '—' }}</p>
                  </div>
                </div>
              </td>

              <td class="px-3 py-3 text-sm text-gray-700">{{ customer.phone || '—' }}</td>
              <td class="px-3 py-3 text-sm text-gray-500">{{ customer.email || '—' }}</td>
              <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ reservationCount(customer) }}</td>
              <td class="px-3 py-3 text-sm text-gray-700">{{ spendingLabel(customer) }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600">
                  {{ ratingLabel(customer) }}
                </span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-600">{{ createdAtLabel(customer) }}</td>
              <td class="px-3 py-3"><span class="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-700">{{ customer.language || '—' }}</span></td>
              <td class="px-3 py-3 text-sm text-gray-600">{{ customer.city || '—' }}</td>
              <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(customer)">{{ statusLabel(customer) }}</span></td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-2">
                  <router-link v-if="customer.id" :to="{ name: 'clients.detail', params: { id: customer.id } }" class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                    Voir
                  </router-link>
                  <button
                    v-if="customer.id"
                    class="rounded-lg px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :class="isBlocked(customer) ? 'bg-success-500' : 'bg-error-500'"
                    :disabled="updatingCustomerIds.includes(customer.id)"
                    @click="toggleCustomerBlock(customer)"
                  >
                    {{ isBlocked(customer) ? 'Reactiver' : 'Bloquer' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && !error && totalPages > 1" class="mt-4 flex items-center justify-between">
        <p class="text-sm text-gray-500">Page {{ page }} / {{ totalPages }}</p>
        <div class="flex items-center gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="page === 1" @click="page -= 1">Precedent</button>
          <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="page === totalPages" @click="page += 1">Suivant</button>
        </div>
      </div>

      <p v-if="!loading && !error && customers.length === 0" class="mt-4 text-sm text-amber-700">
        Diagnostic: la page a bien charge, mais la collection Firestore <code>customers</code> a renvoye 0 document.
      </p>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getCustomerMetrics, getCustomers, updateCustomerAccountStatus, type CustomerMetrics } from '~/services/customers'
import type { Customer } from '~/types'

defineOptions({ name: 'ClientsPage' })

const PAGE_SIZE = 20

const customers = ref<Customer[]>([])
const customerMetrics = ref<Record<string, CustomerMetrics>>({})
const loading = ref(true)
const error = ref<string | null>(null)
const updatingCustomerIds = ref<string[]>([])

const search = ref('')
const filterVille = ref('')
const filterStatut = ref('')
const filterNote = ref('')
const filterPaymentSort = ref('')
const page = ref(1)

onMounted(async () => {
  try {
    customers.value = await getCustomers()
    console.info('[clients] customers loaded:', customers.value.length)
    try {
      customerMetrics.value = await getCustomerMetrics(customers.value)
    } catch {
      customerMetrics.value = {}
    }
  } catch {
    error.value = 'Impossible de charger les clients.'
  } finally {
    loading.value = false
  }
})

watch([search, filterVille, filterStatut, filterNote, filterPaymentSort], () => {
  page.value = 1
})

const resetFilters = () => {
  search.value = ''
  filterVille.value = ''
  filterStatut.value = ''
  filterNote.value = ''
  filterPaymentSort.value = ''
}

const togglePaymentSort = () => {
  filterPaymentSort.value = filterPaymentSort.value === 'desc' ? 'asc' : 'desc'
}

const paymentSortLabel = computed(() => {
  if (filterPaymentSort.value === 'desc') return 'Paiements ↓'
  if (filterPaymentSort.value === 'asc') return 'Paiements ↑'
  return 'Paiements ↕'
})

const paymentSortTitle = computed(() => {
  if (filterPaymentSort.value === 'desc') return 'Tri paiements decroissant'
  if (filterPaymentSort.value === 'asc') return 'Tri paiements croissant'
  return 'Trier les paiements'
})

const villes = computed(() => {
  const set = new Set(customers.value.map((customer) => customer.city).filter(Boolean))
  return [...set].sort()
})

const resolveStatus = (customer: Customer): 'active' | 'pending' | 'suspended' => {
  if (typeof customer.accountStatus === 'boolean') {
    return customer.accountStatus ? 'active' : 'suspended'
  }

  if (customer.accountStatus === 'active' || customer.accountStatus === 'pending' || customer.accountStatus === 'suspended') {
    return customer.accountStatus
  }
  return customer.isVerified ? 'active' : 'pending'
}

const statusLabel = (customer: Customer) => {
  const status = resolveStatus(customer)
  if (status === 'active') return 'Actif'
  if (status === 'pending') return 'En attente'
  return 'Suspendu'
}

const statusBadgeClass = (customer: Customer) => {
  const status = resolveStatus(customer)
  if (status === 'active') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  return 'bg-error-50 text-error-600'
}

const isBlocked = (customer: Customer) => resolveStatus(customer) === 'suspended'

const toggleCustomerBlock = async (customer: Customer) => {
  if (!customer.id) return

  const nextStatus = isBlocked(customer)
  updatingCustomerIds.value = [...updatingCustomerIds.value, customer.id]

  try {
    await updateCustomerAccountStatus(customer.id, nextStatus)
    customer.accountStatus = nextStatus
  } finally {
    updatingCustomerIds.value = updatingCustomerIds.value.filter((id) => id !== customer.id)
  }
}

const customerMetric = (customer: Customer): CustomerMetrics => {
  return customerMetrics.value[customer.uid] ?? { reservations: 0, spending: 0 }
}

const reservationCount = (customer: Customer) => customerMetric(customer).reservations
const spendingValue = (customer: Customer) => customerMetric(customer).spending

const spendingLabel = (customer: Customer) => {
  const amount = spendingValue(customer)
  if (!amount) return '—'

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: customer.currency || 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const ratingValue = (customer: Customer) => {
  const stats = customer.stats
  if (!stats) return 0
  const totalReviews = stats.totalReviews ?? 0
  if (totalReviews > 0) {
    return Number(((stats.ratingSum ?? 0) / totalReviews).toFixed(1))
  }
  return Number(stats.rating ?? 0)
}

const ratingLabel = (customer: Customer) => {
  const value = ratingValue(customer)
  return value > 0 ? `${value}/5` : '—'
}

const createdAtLabel = (customer: Customer) => {
  const createdAt = customer.createdAt
  if (!createdAt?.seconds) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(createdAt.seconds * 1000))
}

const initials = (customer: Customer) => {
  const firstName = customer.firstName || customer.name?.split(' ')[0] || '?'
  const lastName = customer.lastName || customer.name?.split(' ')[1] || ''
  return (firstName[0] + (lastName[0] || '')).toUpperCase()
}

const displayName = (customer: Customer) => {
  if (customer.name) return customer.name
  return `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—'
}

const filtered = computed(() => {
  const needle = search.value.toLowerCase().trim()

  return customers.value
    .filter((customer) => {
      const matchSearch = !needle
        || (customer.name || '').toLowerCase().includes(needle)
        || (customer.firstName || '').toLowerCase().includes(needle)
        || (customer.lastName || '').toLowerCase().includes(needle)
        || (customer.email || '').toLowerCase().includes(needle)
        || (customer.phone || '').toLowerCase().includes(needle)
        || (customer.city || '').toLowerCase().includes(needle)

      const matchVille = !filterVille.value || customer.city === filterVille.value
      const matchStatut = !filterStatut.value || resolveStatus(customer) === filterStatut.value
      const minNote = Number(filterNote.value || 0)
      const matchNote = !minNote || ratingValue(customer) >= minNote

      return matchSearch && matchVille && matchStatut && matchNote
    })
    .sort((a, b) => {
      if (filterPaymentSort.value === 'desc') return spendingValue(b) - spendingValue(a)
      if (filterPaymentSort.value === 'asc') return spendingValue(a) - spendingValue(b)
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const paginated = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})
</script>
