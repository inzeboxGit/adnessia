<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher une transaction..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      />

      <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Statut</option>
        <option v-for="status in availableStatuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
      </select>

      <select v-model="filterMethod" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Methode</option>
        <option v-for="method in availableMethods" :key="method" :value="method">{{ method }}</option>
      </select>

      <select v-model.number="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }} / page</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="min-w-full divide-y divide-gray-100">
        <thead>
          <tr class="bg-gray-50">
            <th class="th">ID</th>
            <th class="th">Client</th>
            <th class="th">Transaction</th>
            <th class="th">Methode</th>
            <th class="th">Statut</th>
            <th class="th">Date</th>
            <th class="th">Montant</th>
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
          <tr v-else-if="paginatedItems.length === 0">
            <td colspan="8" class="px-3 py-10 text-center text-sm text-gray-500">Aucune transaction trouvee.</td>
          </tr>

          <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50/80">
            <td class="px-3 py-3">
              <div class="flex items-center gap-2">
                <div>
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.id }}</p>
                  <span v-if="item.reservationType" class="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{{ item.reservationType }}</span>
                </div>
                <button class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600" @click="copyText(item.id)">Copier</button>
              </div>
            </td>
            <td class="px-3 py-3 text-sm text-gray-700">{{ item.clientName }}</td>
            <td class="px-3 py-3">
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.reference }}</p>
              <p class="text-xs text-gray-500">{{ item.description }}</p>
            </td>
            <td class="px-3 py-3">
              <p class="text-sm text-gray-700">{{ item.method }}</p>
              <p class="text-xs text-gray-500">{{ item.category }}</p>
            </td>
            <td class="px-3 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClassName(item.displayStatus)">{{ statusLabel(item.displayStatus) }}</span>
              <p v-if="item.reservationFinishedAt" class="mt-1 text-xs text-gray-500">Fini le: {{ item.reservationFinishedAt }}</p>
            </td>
            <td class="px-3 py-3 text-sm text-gray-600">{{ item.createdAtDate }} <span class="text-xs">{{ item.createdAtTime }}</span></td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ item.amountFormatted }}</td>
            <td class="px-3 py-3">
              <div class="flex items-center gap-2">
                <router-link :to="{ path: '/finance/invoice-details', query: { txId: item.id, reference: item.reference, base: String(item.amount), fees: '0', feeRate: '0', net: String(item.amount), currency: item.currency, status: item.status, provider: item.clientName, city: '' } }" class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">Voir</router-link>
                <button class="rounded-lg border border-error-200 px-2 py-1 text-xs text-error-600 hover:bg-error-50" @click="handleDeleteItem(item)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ filteredTransactions.length }} transactions</p>
      <div class="flex items-center gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage -= 1">Precedent</button>
        <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage += 1">Suivant</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getCustomers } from '~/services/customers'
import { getPaiementListData } from '~/services/paiements'
import { getReservationsByIds } from '~/services/reservations'
import type { Reservation } from '~/models/reservations'
import type { Customer, PaiementStatut } from '~/types'
import type { TransactionRowType } from './data'

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')
const filterMethod = ref('')
const perPageOptions = [5, 8, 10, 20, 50]
const currentPage = ref(1)
const perPage = ref(8)
const transactions = ref<TransactionRowType[]>([])
const customerNameMap = ref(new Map<string, string>())
const reservationTypeMap = ref(new Map<string, Reservation['type']>())
const reservationStatusMap = ref(new Map<string, Reservation['status']>())
const reservationFinishedAtMap = ref(new Map<string, string>())

const availableStatuses = computed(() => [...new Set(transactions.value.map((item) => item.status))])
const availableMethods = computed(() => [...new Set(transactions.value.map((item) => item.method).filter(Boolean))].sort())

const filteredTransactions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return transactions.value.filter((item) => {
    const matchSearch = !query
      || item.id.toLowerCase().includes(query)
      || item.reference.toLowerCase().includes(query)
      || item.description.toLowerCase().includes(query)
      || item.clientName.toLowerCase().includes(query)
      || item.method.toLowerCase().includes(query)
      || item.category.toLowerCase().includes(query)

    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    const matchMethod = !filterMethod.value || item.method === filterMethod.value

    return matchSearch && matchStatus && matchMethod
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / perPage.value)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTransactions.value.slice(start, start + perPage.value)
})

watch([searchQuery, filterStatus, filterMethod, perPage], () => {
  currentPage.value = 1
})

onMounted(async () => {
  try {
    const [response, customers] = await Promise.all([
      getPaiementListData(),
      getCustomers(),
    ])

    const reservations = await getReservationsByIds(response.items.map((item) => item.reservationId))
    reservationTypeMap.value = buildReservationTypeMap(reservations)
    reservationStatusMap.value = buildReservationStatusMap(reservations)
    reservationFinishedAtMap.value = buildReservationFinishedAtMap(reservations)
    customerNameMap.value = buildCustomerNameMap(customers)
    transactions.value = response.items.map((item, index) => toTransactionRow(item, index))
  } catch {
    error.value = 'Impossible de charger les transactions.'
  } finally {
    loading.value = false
  }
})

const formatCurrency = (amount: number, currency = 'MAD') =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (seconds?: number) => {
  if (!seconds) return { date: '—', time: '' }
  const value = new Date(seconds * 1000)
  return {
    date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(value),
    time: new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(value),
  }
}

const customerDisplayName = (customer?: Customer) => {
  if (!customer) return ''
  if (customer.name) return customer.name
  return `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
}

const buildCustomerNameMap = (customers: Customer[]) => {
  const map = new Map<string, string>()

  for (const customer of customers) {
    const name = customerDisplayName(customer)
    if (!name) continue
    if (customer.id) map.set(customer.id, name)
    if (customer.uid) map.set(customer.uid, name)
  }

  return map
}

const buildReservationTypeMap = (reservations: Map<string, Reservation>) => {
  const map = new Map<string, Reservation['type']>()

  for (const [id, reservation] of reservations.entries()) {
    map.set(id, reservation.type)
  }

  return map
}

const buildReservationStatusMap = (reservations: Map<string, Reservation>) => {
  const map = new Map<string, Reservation['status']>()

  for (const [id, reservation] of reservations.entries()) {
    map.set(id, reservation.status)
  }

  return map
}

const buildReservationFinishedAtMap = (reservations: Map<string, Reservation>) => {
  const map = new Map<string, string>()

  for (const [id, reservation] of reservations.entries()) {
    const value = formatShortDate(reservation.dateFin)
    if (value) map.set(id, value)
  }

  return map
}

const copyText = async (value: string) => {
  if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(value)
  } catch {
    window.alert('Impossible de copier le texte.')
  }
}

const formatShortDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return ''
  const date = value instanceof Date
    ? value
    : typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number'
      ? new Date(value.seconds * 1000)
      : null

  if (!date) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const toTransactionRow = (item: {
  id?: string
  clientId: string
  dateCreation: { seconds?: number }
  description: string
  devise: string
  metadata: { nomClient?: string; typeCategorie?: string }
  methodePaiement: string
  montant: number
  reference: string
  reservationId: string
  statut: string
}, index: number): TransactionRowType => {
  const createdAt = formatDate(item.dateCreation?.seconds)
  const clientName = customerNameMap.value.get(item.clientId) || item.metadata?.nomClient || item.clientId || 'Client'
  const reference = item.reference || item.id || `PAY-${index + 1}`
  const reservationStatus = reservationStatusMap.value.get(item.reservationId)
  const displayStatus = reservationStatus && reservationStatus !== 'confirmee' ? 'pending' : item.statut
  return {
    id: item.id || reference,
    clientName,
    clientImage: '/images/users/user-1.jpg',
    reservationType: reservationTypeMap.value.get(item.reservationId) || '—',
    displayStatus,
    reservationFinishedAt: reservationFinishedAtMap.value.get(item.reservationId) || '',
    reference,
    description: item.description || 'Paiement client',
    category: item.metadata?.typeCategorie || '—',
    method: item.methodePaiement || '—',
    status: item.statut,
    amount: Number(item.montant || 0),
    amountFormatted: formatCurrency(Number(item.montant || 0), item.devise || 'MAD'),
    currency: item.devise || 'MAD',
    createdAtDate: createdAt.date,
    createdAtTime: createdAt.time,
    createdAtValue: item.dateCreation?.seconds || 0,
  }
}

const statusLabel = (status: string) => {
  if (status === 'confirmed') return 'Confirme'
  if (status === 'pending') return 'En attente'
  if (status === 'paid') return 'Paye'
  if (status === 'failed') return 'Echec'
  if (status === 'cancelled') return 'Annule'
  if (status === 'refunded') return 'Rembourse'
  if (status === 'partially_refunded') return 'Partiellement rembourse'
  if (status === 'expired') return 'Expire'
  return status || '—'
}

const statusClassName = (status: string) => {
  if (status === 'confirmed' || status === 'paid') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'failed' || status === 'cancelled' || status === 'refunded' || status === 'partially_refunded') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const handleDeleteItem = (item: TransactionRowType) => {
  const confirmed = window.confirm(`Supprimer la transaction ${item.id} ?`)
  if (!confirmed) return
  transactions.value = transactions.value.filter((transaction) => transaction.id !== item.id)
}
</script>
