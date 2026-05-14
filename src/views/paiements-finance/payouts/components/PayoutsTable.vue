<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un prestataire..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      />

      <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Statut</option>
        <option value="En attente">En attente</option>
        <option value="Prêt">Pret</option>
      </select>

      <select v-model.number="perPage" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }} / page</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="min-w-full divide-y divide-gray-100">
        <thead>
          <tr class="bg-gray-50">
            <th class="th">Provider</th>
            <th class="th">Periodes</th>
            <th class="th">Reservations</th>
            <th class="th">Montant</th>
            <th class="th">Statut</th>
            <th class="th">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <template v-if="paginatedGroups.length > 0">
            <template v-for="group in paginatedGroups" :key="group.providerKey">
              <tr class="hover:bg-gray-50/80">
                <td class="px-3 py-3">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ group.providerName }}</p>
                  <p class="text-xs text-gray-500">{{ group.providerCity }}</p>
                  <p class="text-xs text-gray-500">{{ group.providerKey }}</p>
                  <button type="button" class="mt-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50" @click="toggleGroup(group.providerKey)">
                    {{ isExpanded(group.providerKey) ? '−' : '+' }} Voir les paiements groupes
                  </button>
                </td>
                <td class="px-3 py-3 text-sm text-gray-700">{{ group.periods.length }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ group.reservations }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(group.amount, group.currency) }}</td>
                <td class="px-3 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="group.status === 'Prêt' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'">
                    {{ group.status }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <button class="rounded-lg bg-brand-500 px-2 py-1 text-xs font-medium text-white disabled:opacity-50" :disabled="group.status !== 'Prêt'" @click="openPayModal(group)">
                    Payer
                  </button>
                </td>
              </tr>

              <tr v-if="isExpanded(group.providerKey)">
                <td colspan="6" class="px-3 py-3">
                  <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p class="mb-2 text-xs font-semibold uppercase text-gray-500">Paiements groupes</p>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th class="px-2 py-1 text-left text-xs text-gray-500">Periode</th>
                            <th class="px-2 py-1 text-left text-xs text-gray-500">Reservations</th>
                            <th class="px-2 py-1 text-left text-xs text-gray-500">Montant</th>
                            <th class="px-2 py-1 text-left text-xs text-gray-500">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in group.periods" :key="item.id">
                            <td class="px-2 py-1 text-sm text-gray-700">{{ item.periodLabel }}</td>
                            <td class="px-2 py-1 text-sm font-semibold text-gray-700">{{ item.reservations }}</td>
                            <td class="px-2 py-1 text-sm font-semibold text-gray-700">{{ formatCurrency(item.amount, item.currency) }}</td>
                            <td class="px-2 py-1">
                              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="item.status === 'Prêt' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'">
                                {{ item.status }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
          <tr v-else>
            <td colspan="6" class="px-3 py-10 text-center text-sm text-gray-500">Aucun virement groupe trouve.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ filteredGroups.length }} groupes</p>
      <div class="flex items-center gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage -= 1">Precedent</button>
        <span class="text-sm text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage += 1">Suivant</button>
      </div>
    </div>

    <div v-if="showPayModal" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="closePayModal">
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Payer le prestataire</h3>

        <div class="mt-3 space-y-3">
          <div>
            <p class="text-xs text-gray-500">Prestataire</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ selectedGroup?.providerName || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Montant a payer</p>
            <input v-model.number="payAmount" type="number" min="0" step="1" placeholder="Saisir le montant" class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
            <p class="mt-1 text-xs text-gray-500">Montant de base: {{ formatCurrency(selectedGroup?.amount ?? 0, selectedGroup?.currency || 'MAD') }}</p>
            <p class="text-xs text-gray-500">Frais Nessia ({{ selectedGroup?.feesRate ?? 0 }}%): -{{ formatCurrency(calculateFees(selectedGroup?.amount ?? 0, selectedGroup?.feesRate ?? 0), selectedGroup?.currency || 'MAD') }}</p>
            <p class="text-xs font-semibold text-gray-700">Net a payer: {{ formatCurrency(calculateNet(selectedGroup?.amount ?? 0, selectedGroup?.feesRate ?? 0), selectedGroup?.currency || 'MAD') }}</p>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="closePayModal">Annuler</button>
          <button class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="!canSubmitPayment || submittingPayment" @click="confirmPayment">
            {{ submittingPayment ? 'Traitement...' : 'Confirmer le paiement' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  createPartnerPayoutTransaction,
  getProviderPayouts,
  type ProviderPayoutItem,
  type ProviderPayoutStatus,
} from '~/services/paiements'

type ProviderPayoutGroup = {
  providerKey: string
  providerName: string
  providerCity: string
  periods: ProviderPayoutItem[]
  reservations: number
  amount: number
  grossAmount: number
  feesAmount: number
  feesRate: number
  currency: string
  status: ProviderPayoutStatus
}

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')
const perPage = ref(8)
const currentPage = ref(1)
const items = ref<ProviderPayoutItem[]>([])
const expandedGroups = ref<Record<string, boolean>>({})
const showPayModal = ref(false)
const selectedGroup = ref<ProviderPayoutGroup | null>(null)
const payAmount = ref<number | null>(null)
const submittingPayment = ref(false)

const perPageOptions = [5, 8, 10, 20, 50]

const loadPayouts = async () => {
  try {
    items.value = await getProviderPayouts()
    error.value = null
  } catch {
    error.value = 'Impossible de charger les payouts.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPayouts()
})

watch([searchQuery, filterStatus, perPage], () => {
  currentPage.value = 1
})

const groupedItems = computed<ProviderPayoutGroup[]>(() => {
  const groups = new Map<string, ProviderPayoutGroup>()

  for (const item of items.value) {
    const existing = groups.get(item.providerKey) ?? {
      providerKey: item.providerKey,
      providerName: item.providerName,
      providerCity: item.providerCity,
      periods: [],
      reservations: 0,
      amount: 0,
      grossAmount: 0,
      feesAmount: 0,
      feesRate: item.feesRate,
      currency: item.currency,
      status: 'Prêt' as ProviderPayoutStatus,
    }

    existing.periods.push(item)
    existing.reservations += item.reservations
    existing.amount += item.amount
    existing.grossAmount += item.grossAmount
    existing.feesAmount += item.feesAmount
    if (existing.status !== 'En attente' && item.status === 'En attente') {
      existing.status = 'En attente'
    }

    groups.set(item.providerKey, existing)
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    periods: [...group.periods].sort((a, b) => b.periodKey.localeCompare(a.periodKey)),
  }))
})

const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return groupedItems.value.filter((group) => {
    const matchSearch = !query
      || group.providerName.toLowerCase().includes(query)
      || group.providerCity.toLowerCase().includes(query)
      || group.providerKey.toLowerCase().includes(query)
      || group.periods.some((item) => item.periodLabel.toLowerCase().includes(query))

    const matchStatus = !filterStatus.value || group.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGroups.value.length / perPage.value)))

const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredGroups.value.slice(start, start + perPage.value)
})

const toggleGroup = (providerKey: string) => {
  expandedGroups.value[providerKey] = !expandedGroups.value[providerKey]
}

const isExpanded = (providerKey: string) => expandedGroups.value[providerKey] === true

const round2 = (value: number) => Math.round(value * 100) / 100

const calculateFees = (baseAmount: number, rate: number) => round2(baseAmount * (rate / 100))

const calculateNet = (baseAmount: number, rate: number) => round2(baseAmount - calculateFees(baseAmount, rate))

const openPayModal = (group: ProviderPayoutGroup) => {
  selectedGroup.value = group
  payAmount.value = calculateNet(group.amount, group.feesRate)
  showPayModal.value = true
}

const closePayModal = () => {
  showPayModal.value = false
  selectedGroup.value = null
  payAmount.value = null
}

const canSubmitPayment = computed(() => {
  return selectedGroup.value !== null && typeof payAmount.value === 'number' && payAmount.value > 0
})

const confirmPayment = async () => {
  if (!canSubmitPayment.value) return
  if (!selectedGroup.value || typeof payAmount.value !== 'number') return

  try {
    submittingPayment.value = true
    const baseAmount = selectedGroup.value.amount
    const feeRate = selectedGroup.value.feesRate
    const feeAmount = calculateFees(baseAmount, feeRate)

    await createPartnerPayoutTransaction({
      providerKey: selectedGroup.value.providerKey,
      providerName: selectedGroup.value.providerName,
      providerCity: selectedGroup.value.providerCity,
      payoutItemIds: selectedGroup.value.periods.map((item) => item.id),
      reservations: selectedGroup.value.reservations,
      baseAmount,
      feeRate,
      feeAmount,
      netAmountPaid: payAmount.value,
      currency: selectedGroup.value.currency,
      notes: `Paiement cree depuis payouts (${selectedGroup.value.periods.length} periode(s))`,
    })

    closePayModal()
    loading.value = true
    await loadPayouts()
  } finally {
    submittingPayment.value = false
  }
}

const formatCurrency = (amount: number, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
