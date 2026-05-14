<template>
  <admin-layout>
    <page-breadcrumb page-title="Suivi des litiges" />
    <p class="mb-4 text-sm text-gray-500">Gestion des incidents, litiges et decisions administratives.</p>

    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-error-100 bg-error-50 text-error-600">
            <alert-triangle class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ incidentStats.total }}</span>
        </div>
        <p class="text-xs text-gray-500">Signalements recu</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ incidentStats.total }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-error-500" :style="{ width: `${incidentStats.totalPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-warning-100 bg-warning-50 text-warning-600">
            <search-check class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700">{{ incidentStats.pendingPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">En cours de traitement</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ incidentStats.pending }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-warning-500" :style="{ width: `${incidentStats.pendingPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-success-100 bg-success-50 text-success-600">
            <check-circle-2 class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{{ incidentStats.resolvedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Resolu</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ incidentStats.resolved }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-success-500" :style="{ width: `${incidentStats.resolvedPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <ban class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{{ incidentStats.rejectedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Rejete</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ incidentStats.rejected }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-gray-500" :style="{ width: `${incidentStats.rejectedPct}%` }" />
        </div>
      </article>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher un litige..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Statut</option>
          <option value="open">open</option>
          <option value="in_review">in_review</option>
          <option value="resolved">resolved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="min-w-full divide-y divide-gray-100">
          <thead>
            <tr class="bg-gray-50">
              <th class="th">ID</th>
              <th class="th">Reservation / annonce</th>
              <th class="th">Client</th>
              <th class="th">Provider</th>
              <th class="th">Statut</th>
              <th class="th">Decision</th>
              <th class="th">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loading">
              <td colspan="7" class="px-3 py-10 text-center text-sm text-gray-500">Chargement...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="7" class="px-3 py-10 text-center text-sm text-error-600">{{ error }}</td>
            </tr>
            <tr v-else-if="displayItems.length === 0">
              <td colspan="7" class="px-3 py-10 text-center text-sm text-gray-500">Aucun litige trouve.</td>
            </tr>

            <tr v-for="item in displayItems" :key="item.id" class="hover:bg-gray-50/80">
              <td class="px-3 py-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-700">{{ item.rowNumber }}</span>
                  <button class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50" @click="copyIncidentId(item.id)">Copier</button>
                </div>
              </td>

              <td class="px-3 py-3">
                <div class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.reservationTitle || item.listingTitle || '—' }}</div>
                <div class="text-xs text-gray-500">{{ item.reservationId || item.listingId || '—' }}</div>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700">{{ item.clientName }}</td>
              <td class="px-3 py-3 text-sm text-gray-700">{{ item.providerName }}</td>
              <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(item.status)">{{ item.status }}</span></td>
              <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="decisionBadgeClass(item.disputeStatus)">{{ item.disputeStatus }}</span></td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-2">
                  <button class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" @click="selectedIncident = item">Voir</button>
                  <router-link
                    v-if="item.status !== 'resolved'"
                    :to="{ path: '/quality/provider-reports/reply', query: { id: item.id } }"
                    class="rounded-lg bg-brand-500 px-2 py-1 text-xs font-medium text-white"
                  >
                    Repondre
                  </router-link>
                  <button
                    class="rounded-lg bg-success-500 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="updatingIncidentId === item.id || item.status === 'resolved'"
                    @click="setQuickStatus(item, 'resolved')"
                  >
                    Resolu
                  </button>
                  <button
                    v-if="item.status !== 'resolved'"
                    class="rounded-lg bg-error-500 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="updatingIncidentId === item.id || item.status === 'rejected'"
                    @click="setQuickStatus(item, 'rejected')"
                  >
                    Rejeter
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedIncident" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="selectedIncident = null">
      <div class="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="mb-4 flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Detail litige</h3>
          <button class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600" @click="selectedIncident = null">Fermer</button>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-xl border border-gray-100 p-4">
            <h4 class="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Infos reservation</h4>
            <div class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p><span class="text-gray-500">Reservation / annonce:</span> {{ selectedIncident.reservationTitle || selectedIncident.listingTitle || '—' }}</p>
              <p><span class="text-gray-500">Ref:</span> {{ selectedIncident.reservationId || selectedIncident.listingId || '—' }}</p>
              <p><span class="text-gray-500">Client:</span> {{ selectedIncident.clientName }}</p>
              <p><span class="text-gray-500">Provider:</span> {{ selectedIncident.providerName }}</p>
              <p><span class="text-gray-500">Categorie:</span> {{ selectedIncident.reservation?.type || '—' }}</p>
              <p><span class="text-gray-500">Statut reservation:</span> {{ selectedIncident.reservation?.status || '—' }}</p>
              <p><span class="text-gray-500">Ville:</span> {{ selectedIncident.reservation?.ville || '—' }}</p>
              <p><span class="text-gray-500">Montant:</span> {{ formatCurrency(selectedIncident.reservation?.montantTotal, selectedIncident.reservation?.devise) }}</p>
            </div>
          </section>

          <section class="rounded-xl border border-gray-100 p-4">
            <h4 class="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Timeline</h4>
            <div class="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p><span class="text-gray-500">createdAt:</span> {{ formatDate(selectedIncident.createdAt) }}</p>
              <p><span class="text-gray-500">inReviewAt:</span> {{ formatDate(selectedIncident.inReviewAt) }}</p>
              <p><span class="text-gray-500">resolvedAt:</span> {{ formatDate(selectedIncident.resolvedAt) }}</p>
              <p><span class="text-gray-500">rejectedAt:</span> {{ formatDate(selectedIncident.rejectedAt) }}</p>
              <p><span class="text-gray-500">Statut:</span> <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(selectedIncident.status)">{{ selectedIncident.status }}</span></p>
              <p><span class="text-gray-500">Decision:</span> <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="decisionBadgeClass(selectedIncident.disputeStatus)">{{ selectedIncident.disputeStatus }}</span></p>
            </div>
          </section>

          <section class="rounded-xl border border-gray-100 p-4 xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Messages</h4>
            <p class="mb-1 text-xs text-gray-500">{{ selectedIncident.reason }}</p>
            <p class="mb-2 text-sm text-gray-700 dark:text-gray-200">{{ selectedIncident.description || '—' }}</p>
            <a v-if="selectedIncident.proofUrl" :href="selectedIncident.proofUrl" target="_blank" rel="noreferrer" class="text-sm font-medium text-brand-600 hover:underline">
              Voir la preuve jointe
            </a>
          </section>

          <section class="rounded-xl border border-gray-100 p-4 xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Actions admin</h4>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs text-gray-500">Statut</label>
                <select
                  class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  :value="selectedIncident.status"
                  :disabled="updatingIncidentId === selectedIncident.id"
                  @change="handleStatusChange(selectedIncident, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="open">open</option>
                  <option value="in_review">in_review</option>
                  <option value="resolved">resolved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Decision</label>
                <select
                  class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  :value="selectedIncident.disputeStatus"
                  :disabled="updatingIncidentId === selectedIncident.id"
                  @change="handleDisputeStatusChange(selectedIncident, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="none">none</option>
                  <option value="approved">approved</option>
                  <option value="partial">partial</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertTriangle, Ban, CheckCircle2, SearchCheck } from 'lucide-vue-next'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import {
  getIncidents,
  type IncidentListItem,
  updateIncidentDisputeStatus,
  updateIncidentStatus,
} from '~/services/incidents'
import type { IncidentDisputeStatus, IncidentStatus } from '~/types'

defineOptions({ name: 'ProviderReportsPage' })

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')
const items = ref<IncidentListItem[]>([])
const selectedIncident = ref<IncidentListItem | null>(null)
const updatingIncidentId = ref<string | null>(null)

onMounted(async () => {
  try {
    items.value = await getIncidents()
  } catch {
    error.value = 'Impossible de charger les litiges.'
  } finally {
    loading.value = false
  }
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchQuery = !query
      || item.id.toLowerCase().includes(query)
      || item.reservationTitle.toLowerCase().includes(query)
      || item.clientName.toLowerCase().includes(query)
      || item.providerName.toLowerCase().includes(query)
      || item.reason.toLowerCase().includes(query)

    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchQuery && matchStatus
  })
})

const displayItems = computed(() => {
  return filteredItems.value.map((item, index) => ({
    ...item,
    rowNumber: index + 1,
  }))
})

const toPercent = (value: number, total: number) => {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

const incidentStats = computed(() => {
  const total = items.value.length
  const openCount = items.value.filter((item) => item.status === 'open').length
  const inReviewCount = items.value.filter((item) => item.status === 'in_review').length
  const resolved = items.value.filter((item) => item.status === 'resolved').length
  const rejected = items.value.filter((item) => item.status === 'rejected').length
  const pending = openCount + inReviewCount

  return {
    total,
    pending,
    resolved,
    rejected,
    totalPct: total > 0 ? 100 : 0,
    pendingPct: toPercent(pending, total),
    resolvedPct: toPercent(resolved, total),
    rejectedPct: toPercent(rejected, total),
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

const formatCurrency = (amount?: number, currency = 'MAD') => {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const statusBadgeClass = (status: string) => {
  if (status === 'open') return 'bg-error-50 text-error-600'
  if (status === 'in_review') return 'bg-warning-50 text-warning-600'
  if (status === 'resolved') return 'bg-success-50 text-success-600'
  if (status === 'rejected') return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-600'
}

const decisionBadgeClass = (status: string) => {
  if (status === 'approved') return 'bg-success-50 text-success-600'
  if (status === 'partial') return 'bg-warning-50 text-warning-600'
  if (status === 'rejected') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const copyIncidentId = async (id: string) => {
  try {
    await navigator.clipboard.writeText(id)
  } catch {
    window.alert("Impossible de copier l'ID.")
  }
}

const patchLocalIncident = (
  id: string,
  payload: Partial<Pick<IncidentListItem, 'status' | 'disputeStatus' | 'inReviewAt' | 'resolvedAt' | 'rejectedAt'>>,
) => {
  items.value = items.value.map((item) => item.id === id ? { ...item, ...payload } : item)
  if (selectedIncident.value?.id === id) {
    selectedIncident.value = items.value.find((item) => item.id === id) || null
  }
}

const handleStatusChange = async (item: IncidentListItem, value: string) => {
  const status = String(value || '') as IncidentStatus
  if (!status || status === item.status) return

  updatingIncidentId.value = item.id
  try {
    await updateIncidentStatus(item.id, status)
    const now = new Date()
    patchLocalIncident(item.id, {
      status,
      inReviewAt: status === 'in_review' ? now : item.inReviewAt,
      resolvedAt: status === 'resolved' ? now : item.resolvedAt,
      rejectedAt: status === 'rejected' ? now : item.rejectedAt,
    })
  } catch {
    window.alert('Impossible de mettre a jour le statut du litige.')
  } finally {
    updatingIncidentId.value = null
  }
}

const setQuickStatus = async (item: IncidentListItem, status: IncidentStatus) => {
  if (status === item.status) return

  updatingIncidentId.value = item.id
  try {
    await updateIncidentStatus(item.id, status)
    const now = new Date()
    patchLocalIncident(item.id, {
      status,
      inReviewAt: status === 'in_review' ? now : item.inReviewAt,
      resolvedAt: status === 'resolved' ? now : item.resolvedAt,
      rejectedAt: status === 'rejected' ? now : item.rejectedAt,
    })
  } catch {
    window.alert('Impossible de mettre a jour le statut du litige.')
  } finally {
    updatingIncidentId.value = null
  }
}

const handleDisputeStatusChange = async (item: IncidentListItem, value: string) => {
  const disputeStatus = String(value || '') as IncidentDisputeStatus
  if (!disputeStatus || disputeStatus === item.disputeStatus) return

  updatingIncidentId.value = item.id
  try {
    await updateIncidentDisputeStatus(item.id, disputeStatus)
    patchLocalIncident(item.id, { disputeStatus })
  } catch {
    window.alert('Impossible de mettre a jour la decision du litige.')
  } finally {
    updatingIncidentId.value = null
  }
}
</script>
