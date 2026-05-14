<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un partenaire..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      />
      <button class="rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" :disabled="runningReconcile" @click="runReconciliation">
        {{ runningReconcile ? 'Rapprochement...' : 'Rapprochement auto' }}
      </button>
      <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Statut</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="anomalies.length" class="mb-4 rounded-xl border border-error-200 bg-error-50 p-3">
      <p class="mb-2 text-sm font-semibold text-error-700">Alertes anomalies ({{ anomalies.length }})</p>
      <div class="space-y-1">
        <p v-for="(anomaly, idx) in anomalies.slice(0, 8)" :key="`${anomaly.transactionId}-${idx}`" class="text-xs text-gray-700">
          <span class="mr-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase" :class="anomaly.severity === 'critical' ? 'bg-error-200 text-error-700' : 'bg-warning-100 text-warning-700'">{{ anomaly.severity }}</span>
          <span class="text-gray-500">{{ anomaly.transactionId }}</span>
          {{ anomaly.message }}
        </p>
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="min-w-full divide-y divide-gray-100">
        <thead>
          <tr class="bg-gray-50">
            <th class="th">Partenaire</th>
            <th class="th">Reservations</th>
            <th class="th">Montant base</th>
            <th class="th">Frais</th>
            <th class="th">Net paye</th>
            <th class="th">Statut</th>
            <th class="th">Reference</th>
            <th class="th">Date</th>
            <th class="th">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50/80">
            <td class="px-3 py-3">
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.providerName || '—' }}</p>
              <p class="text-xs text-gray-500">{{ item.providerCity || '—' }}</p>
              <p class="text-xs text-gray-500">{{ item.providerKey }}</p>
            </td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ item.reservations }}</td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(item.baseAmount, item.currency) }}</td>
            <td class="px-3 py-3 text-sm text-gray-700">
              <p>{{ formatCurrency(item.feeAmount, item.currency) }}</p>
              <p class="text-xs text-gray-500">{{ item.feeRate }}%</p>
            </td>
            <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(item.netAmountPaid, item.currency) }}</td>
            <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(item.status)">{{ item.status }}</span></td>
            <td class="px-3 py-3 text-sm text-gray-700">{{ item.reference || '—' }}</td>
            <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(item.createdAt) }}</td>
            <td class="px-3 py-3">
              <button v-if="item.status === 'pending'" class="rounded-lg bg-success-500 px-2 py-1 text-xs font-medium text-white" @click="openConfirmModal(item)">Confirmer paiement</button>
              <button v-else-if="item.status === 'paid'" class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" @click="goToInvoiceDetails(item)">Voir facture</button>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
          </tr>

          <tr v-if="!filteredItems.length">
            <td colspan="9" class="px-3 py-10 text-center text-sm text-gray-500">Aucune transaction trouvee.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showConfirmModal" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="closeConfirmModal">
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Confirmer le paiement</h3>

        <div class="mt-3 space-y-3">
          <div>
            <p class="text-xs text-gray-500">Partenaire</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ selectedTransaction?.providerName || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Numero de transaction</p>
            <input v-model="transactionRef" type="text" placeholder="Ex: VIRT-2026-000245" class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="closeConfirmModal">Annuler</button>
          <button class="rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="!canConfirm || confirming" @click="confirmPayment">
            {{ confirming ? 'Validation...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  confirmPartnerPayoutTransaction,
  detectPartnerPayoutAnomalies,
  getPartnerPayoutTransactions,
  runPartnerPayoutAutoReconciliation,
  type PartnerPayoutAnomaly,
  type PartnerPayoutTransaction,
  type PartnerPayoutTransactionStatus,
} from '~/services/paiements'

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')
const items = ref<PartnerPayoutTransaction[]>([])
const showConfirmModal = ref(false)
const selectedTransaction = ref<PartnerPayoutTransaction | null>(null)
const transactionRef = ref('')
const confirming = ref(false)
const anomalies = ref<PartnerPayoutAnomaly[]>([])
const runningReconcile = ref(false)
const router = useRouter()

const loadTransactions = async () => {
  try {
    items.value = await getPartnerPayoutTransactions()
    anomalies.value = detectPartnerPayoutAnomalies(items.value)
    error.value = null
  } catch {
    error.value = 'Impossible de charger les transactions partenaires.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTransactions()
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchSearch = !query
      || item.providerName.toLowerCase().includes(query)
      || item.providerCity.toLowerCase().includes(query)
      || item.providerKey.toLowerCase().includes(query)
      || item.id.toLowerCase().includes(query)

    const matchStatus = !filterStatus.value || item.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const statusClass = (status: PartnerPayoutTransactionStatus) => {
  if (status === 'paid') return 'bg-success-50 text-success-600'
  if (status === 'failed') return 'bg-error-50 text-error-600'
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600'
  return 'bg-warning-50 text-warning-600'
}

const openConfirmModal = (item: PartnerPayoutTransaction) => {
  selectedTransaction.value = item
  transactionRef.value = ''
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  selectedTransaction.value = null
  transactionRef.value = ''
}

const canConfirm = computed(() => {
  return !!selectedTransaction.value && transactionRef.value.trim().length > 0
})

const confirmPayment = async () => {
  if (!selectedTransaction.value || !transactionRef.value.trim()) return

  try {
    confirming.value = true
    await confirmPartnerPayoutTransaction(selectedTransaction.value.id, transactionRef.value)
    closeConfirmModal()
    loading.value = true
    await loadTransactions()
  } catch {
    error.value = 'Impossible de confirmer le paiement.'
  } finally {
    confirming.value = false
  }
}

const runReconciliation = async () => {
  try {
    runningReconcile.value = true
    await runPartnerPayoutAutoReconciliation()
    loading.value = true
    await loadTransactions()
  } catch {
    error.value = 'Impossible de lancer le rapprochement automatique.'
  } finally {
    runningReconcile.value = false
  }
}

const goToInvoiceDetails = async (item: PartnerPayoutTransaction) => {
  await router.push({
    path: '/finance/invoice-details',
    query: {
      txId: item.id,
      provider: item.providerName,
      city: item.providerCity,
      reference: item.reference || '',
      base: String(item.baseAmount),
      fees: String(item.feeAmount),
      feeRate: String(item.feeRate),
      net: String(item.netAmountPaid),
      currency: item.currency,
      status: item.status,
    },
  })
}

const formatCurrency = (amount: number, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return '—'
  const date = value instanceof Date ? value : value.seconds ? new Date(value.seconds * 1000) : null
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>
