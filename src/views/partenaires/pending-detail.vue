<template>
  <admin-layout>
    <page-breadcrumb :page-title="candidature ? fullName(candidature) : 'Detail candidature prestataire'" />

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-200">
      {{ error }}
    </div>

    <div v-else-if="candidature" class="space-y-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <!-- <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Statut</p>
          <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ displayStatus(candidature.status) }}</p>
        </div> -->
        <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Date</p>
          <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ formatDate(candidature.createdAt) }}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Consentement</p>
          <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ yesNo(candidature.consentement) }}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Autres plateformes</p>
          <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ yesNo(candidature.autresPlateformes) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div class="space-y-4 xl:col-span-8">
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Informations generales</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p class="text-xs text-gray-500">Nom</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ fullName(candidature) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Entreprise</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.entreprise || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Email</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.email || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Telephone</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.telephone || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Ville</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.ville || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Source</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.source || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Anciennete</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.anciennete || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Capacite</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ candidature.capacite ?? '-' }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Offre</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p class="text-xs text-gray-500">Services</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ displayServices(candidature.services) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Zones</p>
                <p class="text-sm text-gray-700 dark:text-gray-200">{{ displayZones(candidature.zones) }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Motivation</h3>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ candidature.motivation || '-' }}</p>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Description</h3>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ candidature.description || '-' }}</p>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Details plateformes</h3>
            <p class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ candidature.plateformesDetails || '-' }}</p>
          </div>
        </div>

        <div class="space-y-4 xl:col-span-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="text-xs uppercase tracking-wide text-gray-500">Actions</p>
            <div class="mt-4">
              <router-link
                :to="{ name: 'partenaires.pending' }"
                class="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Retour a la liste
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Candidature introuvable.
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getCandidaturePrestataire } from '~/services/candidatures'
import type { PrestataireCandidature } from '~/types'

defineOptions({ name: 'PendingProviderDetailPage' })

const route = useRoute()
const candidature = ref<PrestataireCandidature | null>(null)
const loading = ref(true)
const error = ref('')

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
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[;,|]/).map((entry) => entry.trim()).filter(Boolean)
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map((entry) => String(entry).trim()).filter(Boolean)
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

const yesNo = (value?: boolean) => {
  if (value === true) return 'Oui'
  if (value === false) return 'Non'
  return '-'
}

const fullName = (item: PrestataireCandidature) => {
  const first = item.prenom?.trim() || ''
  const last = item.nom?.trim() || ''
  return `${first} ${last}`.trim() || '-'
}

const displayStatus = (status?: string) => {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'new' || normalized === 'nouveau') return 'nouveau'
  if (normalized === 'pending') return 'pending'
  return normalized || '-'
}

onMounted(async () => {
  try {
    const candidatureId = String(route.params.id || '')
    if (!candidatureId) {
      error.value = 'Identifiant de candidature manquant.'
      return
    }

    candidature.value = await getCandidaturePrestataire(candidatureId)
  } catch (cause) {
    console.error('[pending-candidature-detail] load failed', cause)
    error.value = 'Impossible de charger le detail de la candidature.'
  } finally {
    loading.value = false
  }
})
</script>
