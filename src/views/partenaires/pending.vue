<template>
  <admin-layout>
    <page-breadcrumb page-title="Prestataire en attente" />

    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Total candidatures</p>
          <p class="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-200">{{ stats.total }}</p>
        </article>

        <article class="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">En attente</p>
          <p class="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-200">{{ stats.pending }}</p>
        </article>

        <article class="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Approuvees</p>
          <p class="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{{ stats.approved }}</p>
        </article>

        <article class="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
          <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Rejetees</p>
          <p class="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-200">{{ stats.rejected }}</p>
        </article>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div v-if="isLoading" class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
          Chargement des candidatures...
        </div>
        <div v-else-if="loadError" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-200">
          {{ loadError }}
        </div>

        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom, entreprise, email..."
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
          <select
            v-model="statusFilter"
            class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">Tous statuts</option>
            <option value="pending">pending</option>
            <option value="nouveau">nouveau</option>
            <option value="new">new (legacy)</option>
            <option value="reviewed">reviewed</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
          <div class="text-sm text-gray-500 dark:text-gray-400 md:justify-self-end md:self-center">
            {{ filteredCandidatures.length }} candidature(s)
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead class="bg-gray-50/70 dark:bg-gray-900/60">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Candidat</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Entreprise</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Services</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Ville / Zones</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="item in filteredCandidatures" :key="item.id">
                <td class="px-4 py-3 text-gray-700 dark:text-gray-200">
                  <p class="font-semibold">{{ fullName(item) }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.email || '-' }} - {{ item.telephone || '-' }}</p>
                </td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ item.entreprise || '-' }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ displayServices(item.services) }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ item.ville || '-' }} / {{ displayZones(item.zones) }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ formatDate(item.createdAt) }}</td>
                <td class="px-4 py-3">
                  <router-link
                    v-if="item.id"
                    :to="{ name: 'partenaires.pending.detail', params: { id: item.id } }"
                    class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Detail
                  </router-link>
                </td>
              </tr>
              <tr v-if="!filteredCandidatures.length">
                <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune candidature trouvee.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getCandidaturesPrestataires } from '~/services/candidatures'
import type { PrestataireCandidature } from '~/types'

defineOptions({ name: 'PendingProvidersPage' })

const candidatures = ref<PrestataireCandidature[]>([])
const searchQuery = ref('')
const statusFilter = ref('pending')
const isLoading = ref(false)
const loadError = ref('')

const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase()
const isNewOrPendingStatus = (status?: string) => {
  const normalized = normalizeStatus(status)
  return normalized === 'pending' || normalized === 'new' || normalized === 'nouveau'
}

const isPendingStatus = (status?: string) => {
  const normalized = normalizeStatus(status)
  return (
    normalized === ''
    || isNewOrPendingStatus(status)
  )
}

const toDate = (value: PrestataireCandidature['createdAt']) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value: PrestataireCandidature['createdAt']) => {
  const date = toDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const asStringArray = (value: unknown): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    return trimmed
      .split(/[;,|]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((entry) => String(entry).trim())
      .filter(Boolean)
  }

  return []
}

const displayServices = (services?: string[]) => {
  const values = asStringArray(services)
  return values.length ? values.join(', ') : '-'
}

const displayZones = (zones?: string[]) => {
  const values = asStringArray(zones)
  return values.length ? values.join(', ') : '-'
}

const fullName = (item: PrestataireCandidature) => {
  const first = item.prenom?.trim() || ''
  const last = item.nom?.trim() || ''
  const joined = `${first} ${last}`.trim()
  return joined || '-'
}

const filteredCandidatures = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const status = normalizeStatus(statusFilter.value)

  return candidatures.value.filter((item) => {
    const itemStatus = normalizeStatus(item.status)
    const haystack = [
      item.prenom,
      item.nom,
      item.email,
      item.telephone,
      item.entreprise,
      item.ville,
      item.source,
      ...asStringArray(item.services),
      ...asStringArray(item.zones),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesQuery = !query || haystack.includes(query)
    const matchesStatus = !status
      || ((status === 'pending' || status === 'nouveau')
        ? isNewOrPendingStatus(item.status)
        : itemStatus === status)

    return matchesQuery && matchesStatus
  })
})

const stats = computed(() => {
  const total = candidatures.value.length
  const pending = candidatures.value.filter((item) => isPendingStatus(item.status)).length
  const approved = candidatures.value.filter((item) => normalizeStatus(item.status) === 'approved').length
  const rejected = candidatures.value.filter((item) => normalizeStatus(item.status) === 'rejected').length

  return { total, pending, approved, rejected }
})

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    candidatures.value = await getCandidaturesPrestataires()

    if (!candidatures.value.length) {
      loadError.value = 'Aucune donnee retournee par Firestore pour candidatures_prestataires.'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur de lecture Firestore.'
    loadError.value = `Impossible de charger candidatures_prestataires: ${message}`
  } finally {
    isLoading.value = false
  }
})
</script>
