<template>
  <admin-layout>
    <page-breadcrumb page-title="Repondre au litige" />
    <p class="mb-4 text-sm text-gray-500">Historique du litige, probleme signale et reponse administrative.</p>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700">
      {{ error }}
    </div>

    <div v-else-if="incident" class="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div class="space-y-4 xl:col-span-8">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-error-50 text-sm font-semibold text-error-600">CL</div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ incident.clientName }}</h3>
              <p class="text-xs text-gray-500">Signalement client</p>
            </div>
          </div>

          <div class="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600">{{ incident.reason }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(incident.createdAt) }}</span>
            </div>
            <p class="mb-2 text-sm text-gray-700 dark:text-gray-200">{{ incident.description || '—' }}</p>
            <a v-if="incident.proofUrl" :href="incident.proofUrl" target="_blank" rel="noreferrer" class="text-sm font-medium text-brand-600 hover:underline">
              Voir la preuve jointe
            </a>
          </div>

          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">AD</div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Reponse admin</h3>
              <p class="text-xs text-gray-500">
                {{ incident.adminResponseUpdatedAt ? `Derniere mise a jour ${formatDate(incident.adminResponseUpdatedAt)}` : 'Aucune reponse envoyee' }}
              </p>
            </div>
          </div>

          <textarea
            v-model="adminResponse"
            rows="6"
            placeholder="Saisir la reponse administrative..."
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />

          <div class="mt-3 flex justify-end">
            <button class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="saving" @click="handleSaveResponse">
              {{ saving ? 'Enregistrement...' : 'Enregistrer la reponse' }}
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Historique</h3>
          <div class="space-y-3">
            <div class="rounded-xl border border-gray-100 p-3">
              <div class="mb-1 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-gray-800 dark:text-white">Litige cree</p>
                <p class="text-xs text-gray-500">{{ formatDate(incident.createdAt) }}</p>
              </div>
              <p class="text-xs text-gray-500">Statut initial: {{ incident.status }}</p>
            </div>

            <div v-if="incident.inReviewAt" class="rounded-xl border border-warning-100 bg-warning-50 p-3">
              <div class="mb-1 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-warning-700">Pris en charge</p>
                <p class="text-xs text-gray-500">{{ formatDate(incident.inReviewAt) }}</p>
              </div>
              <p class="text-sm text-gray-700">Le litige est passe en in_review.</p>
            </div>

            <div v-if="incident.adminResponse" class="rounded-xl border border-brand-100 bg-brand-50 p-3">
              <div class="mb-1 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-brand-700">Reponse admin</p>
                <p class="text-xs text-gray-500">{{ formatDate(incident.adminResponseUpdatedAt) }}</p>
              </div>
              <p class="text-sm text-gray-700">{{ incident.adminResponse }}</p>
            </div>

            <div v-if="incident.resolvedAt" class="rounded-xl border border-success-100 bg-success-50 p-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-success-700">Resolu</p>
                <p class="text-xs text-gray-500">{{ formatDate(incident.resolvedAt) }}</p>
              </div>
            </div>

            <div v-if="incident.rejectedAt" class="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-gray-700">Rejete</p>
                <p class="text-xs text-gray-500">{{ formatDate(incident.rejectedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Resume</h3>
          <div class="space-y-3 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <p class="text-xs text-gray-500">Reservation / annonce</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ incident.reservationTitle || incident.listingTitle || '—' }}</p>
              <p class="text-xs text-gray-500">{{ incident.reservationId || incident.listingId || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Provider</p>
              <p>{{ incident.providerName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Client</p>
              <p>{{ incident.clientName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Statut</p>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(incident.status)">{{ incident.status }}</span>
            </div>
            <div>
              <p class="text-xs text-gray-500">Decision</p>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="decisionBadgeClass(incident.disputeStatus)">{{ incident.disputeStatus }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import {
  getIncidentById,
  type IncidentListItem,
  updateIncidentAdminResponse,
} from '~/services/incidents'

defineOptions({ name: 'ProviderReportReplyPage' })

const route = useRoute()
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const incident = ref<IncidentListItem | null>(null)
const adminResponse = ref('')

onMounted(async () => {
  const id = String(route.query.id || '')
  if (!id) {
    error.value = 'Aucun litige selectionne.'
    loading.value = false
    return
  }

  try {
    incident.value = await getIncidentById(id)
    if (!incident.value) {
      error.value = 'Litige introuvable.'
      return
    }
    adminResponse.value = incident.value.adminResponse || ''
  } catch {
    error.value = 'Impossible de charger le litige.'
  } finally {
    loading.value = false
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

const handleSaveResponse = async () => {
  if (!incident.value) return

  saving.value = true
  try {
    const now = new Date()
    await updateIncidentAdminResponse(incident.value.id, adminResponse.value.trim(), now)
    incident.value = {
      ...incident.value,
      adminResponse: adminResponse.value.trim(),
      adminResponseUpdatedAt: now,
      status: 'in_review',
      inReviewAt: now,
    }
  } catch {
    window.alert("Impossible d'enregistrer la reponse.")
  } finally {
    saving.value = false
  }
}
</script>
