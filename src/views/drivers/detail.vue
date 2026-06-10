<template>
  <admin-layout>
    <page-breadcrumb :page-title="driver ? driver.fullName : 'Détails chauffeur'" />

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <router-link :to="{ path: '/drivers' }" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        <span aria-hidden>←</span>
        Retour a la liste
      </router-link>

      <div class="flex items-center gap-2">
        <button v-if="driver" type="button" class="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white" @click="openModeration = true">Modération</button>
        <button v-if="driver" :disabled="verifying" type="button" class="rounded-lg px-3 py-2 text-xs font-semibold text-white" :class="driver.isVerified ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'" @click="handleVerify">
          {{ driver.isVerified ? 'Désactiver le chauffeur' : 'Valider le chauffeur' }}
        </button>
        <button v-if="driver" type="button" class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="scrollToHistories">Voir historique</button>
      </div>
    </div>

    <div v-if="moderationError" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
      {{ moderationError }}
    </div>
    <div v-if="moderationSuccess" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
      {{ moderationSuccess }}
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-14 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div v-else-if="!driver" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">Chauffeur introuvable.</div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article class="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-8">
          <h3 class="mb-4 text-lg font-semibold">Informations chauffeur</h3>
          <div class="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Nom complet</p>
              <p class="font-semibold">{{ driver.fullName }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p>{{ driver.email || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Téléphone</p>
              <p>{{ driver.phone || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Inscrit le</p>
              <p>{{ formatDate(driver.createdAt) }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Status</p>
              <p>{{ driver.status || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Status modération</p>
              <p>{{ driver.moderation?.status || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Note</p>
              <p>{{ driver.rating }} / 5</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Nombre trajets</p>
              <p>{{ driver.totalTrips }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Solde</p>
              <p>{{ formatMoney(driver.balance) }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-4">
          <h3 class="mb-4 text-lg font-semibold">Profil</h3>
          <div class="mb-4 flex items-center gap-3">
            <div class="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
              <img v-if="driver.profileImage" :src="driver.profileImage" alt="avatar" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center text-lg font-semibold text-brand-600">{{ initials(driver.fullName) }}</div>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ driver.fullName }}</h3>
              <p class="text-sm text-gray-500">{{ driver.email }}</p>
            </div>
          </div>

          <div class="space-y-3 text-sm text-gray-700">
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Véhicule</p>
              <router-link
                v-if="driver.vehicleId"
                :to="{ name: 'listings.detail', params: { category: 'VTC', id: driver.vehicleId } }"
                class="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                {{ driver.vehicle }}
              </router-link>
              <p v-else class="font-semibold">{{ driver.vehicle }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Téléphone</p>
              <p>{{ driver.phone || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Dernière modération</p>
              <p>{{ moderationInfo }}</p>
            </div>
          </div>
        </article>

        <article id="histories" class="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Historique des modérations</h3>
            <span class="text-xs text-gray-500">Dernières actions enregistrées</span>
          </div>

          <div v-if="histories.length === 0" class="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-sm text-gray-500">
            Aucun historique disponible.
          </div>

          <ul v-else class="space-y-3">
            <li v-for="h in histories" :key="h.id" class="rounded-lg border border-gray-100 px-3 py-2">
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <p class="font-semibold">{{ h.status || h.actionType }}</p>
                  <p class="text-xs text-gray-500">{{ h.reason || '—' }}</p>
                </div>
                <div class="text-xs text-gray-500 text-right">
                  <p>{{ formatDate(h.createdAt || h.reviewedAt) }}</p>
                  <p>{{ h.reviewerName || h.reviewedBy || '—' }}</p>
                </div>
              </div>
            </li>
          </ul>
        </article>
      </div>
      
        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Documents chauffeur</h3>
            <span class="text-xs text-gray-500">Validation globale via le bouton « Modération »</span>
          </div>

          <div v-if="documentError" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
            {{ documentError }}
          </div>
          <div v-if="documentSuccess" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
            {{ documentSuccess }}
          </div>

          <div v-if="documentsList.length === 0" class="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-sm text-gray-500 dark:border-gray-700">
            Aucun document disponible.
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in documentsList" :key="item.key" class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.label }}</p>
                  <p class="text-xs text-gray-500">{{ item.name || item.path || 'Document' }}</p>
                  <p class="text-xs text-gray-500">Type: {{ item.type || '—' }} | Taille: {{ item.size || '—' }}</p>
                </div>
                <span :class="documentStatusClass(item.validationStatus)">{{ documentStatusLabel(item.validationStatus) }}</span>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <img
                  v-if="item.url && isImage(item.url)"
                  :src="item.url"
                  alt="thumbnail"
                  @click="openImage(item.url)"
                  class="h-16 w-28 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
                />

                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Voir document
                </a>

                <p class="text-xs text-gray-500">Validation : {{ documentStatusLabel(item.validationStatus) }}</p>
              </div>

              <p v-if="item.validationReason" class="mt-2 text-xs text-gray-500">Motif actuel: {{ item.validationReason }}</p>
            </div>
          </div>
        </article>
    </div>

    <DriverModerationModal v-if="openModeration" :driverId="driver?.id || ''" @close="openModeration = false" @done="onModerationDone" />
    <div v-if="enlargedImage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click="closeImage">
      <div class="relative max-h-[90vh] max-w-[90vw]">
        <img :src="enlargedImage" @click.stop class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg" />
        <button @click="closeImage" class="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-sm text-white">Fermer</button>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { ref, onMounted, computed } from 'vue'
import { auth, authReady, db } from '~/config/firebase'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DriverModerationModal from '@/components/drivers/DriverModerationModal.vue'
import { getDriverById, getDriverHistories, verifyDriver } from '@/services/drivers'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = String(route.params.id || '')

const driver = ref(null as any)
const loading = ref(true)
const openModeration = ref(false)

const initials = (name: string) => (name || '?').split(' ').slice(0,2).map(n=>n[0]||'').join('').toUpperCase()

const formatDate = (value?: Date | { seconds?: number } | null) => {
  if (!value) return '—'
  if (value instanceof Date) return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(value)
  if (typeof value?.seconds === 'number') return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value.seconds * 1000))
  return '—'
}

const formatMoney = (v:number) => `${v?.toFixed?.(1) ?? '0.0'} Dhs`

const moderationInfo = ref('—')
const documentReasons = ref<Record<string, string>>({})
const documentSaving = ref<Record<string, boolean>>({})
const documentError = ref<string | null>(null)
const documentSuccess = ref<string | null>(null)
const moderationSuccess = ref<string | null>(null)
const moderationError = ref<string | null>(null)
const verifySuccess = ref<string | null>(null)
const verifyError = ref<string | null>(null)
const verifying = ref(false)

type DocumentReviewStatus = 'approved' | 'rejected' | 'pending'

type DriverDocumentWithReview = {
  id?: string
  name?: string
  path?: string
  size?: number
  type?: string
  url?: string
  validationStatus?: DocumentReviewStatus
  validationReason?: string
}

const documentsList = computed(() => {
  // Ensure the three main documents are always shown in order: idCard, license, insurance
  const docObj = (driver.value?.documents || {}) as Record<string, any>

  const topLevelMap: Record<string, string | undefined> = {
    idCard: driver.value?.idCard,
    license: driver.value?.license,
    insurance: driver.value?.insurance,
    profileImage: driver.value?.profileImage,
  }

  const orderedKeys: string[] = ['idCard', 'license', 'insurance']

  const makeItem = (key: string) => {
    const raw = docObj ? docObj[key] : undefined
    const url = typeof raw === 'string' ? raw : raw?.url || topLevelMap[key as keyof typeof topLevelMap]
    const name = typeof raw === 'string' ? (raw ? String(raw).split('/').pop() : undefined) : raw?.name || (url ? String(url).split('/').pop() : undefined)
    const type = typeof raw === 'object' ? raw?.type : undefined
    const size = typeof raw === 'object' ? raw?.size : undefined
    const label = key === 'idCard' ? 'Carte d\'identite' : key === 'license' ? 'Permis' : key === 'insurance' ? 'Assurance' : key
    return {
      key,
      label,
      url,
      path: url,
      name,
      type,
      size,
      validationStatus: typeof raw === 'object' ? raw?.validationStatus : undefined,
      validationReason: typeof raw === 'object' ? raw?.validationReason : undefined,
    }
  }

  // ordered main docs
  const ordered = orderedKeys.map(k => makeItem(k))

  // find other keys present in documents map or top-level (excluding orderedKeys)
  const otherKeysSet = new Set<string>(Object.keys(docObj || []))
  Object.keys(topLevelMap).forEach(k => { if (topLevelMap[k as keyof typeof topLevelMap]) otherKeysSet.add(k) })
  const otherKeys = Array.from(otherKeysSet).filter(k => !orderedKeys.includes(k))
  const others = otherKeys.map(k => makeItem(k))

  return [...ordered, ...others]
})

const documentStatusLabel = (status?: string) => {
  const value = String(status || 'pending').toLowerCase()
  if (value === 'approved') return 'Valide'
  if (value === 'rejected') return 'Rejete'
  return 'En attente'
}

const documentStatusClass = (status?: string) => {
  const value = String(status || 'pending').toLowerCase()
  if (value === 'approved') return 'inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-600'
  if (value === 'rejected') return 'inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs text-error-600'
  return 'inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-xs text-warning-600'
}

const isDocumentSaving = (key: string) => Boolean(documentSaving.value[key])

const getLoggedAdminUid = async () => {
  const user = auth.currentUser || await authReady
  return user?.uid || ''
}

const applyDocumentDecision = async (docKey: string, status: 'approved' | 'rejected') => {
  if (!driver.value?.id) return

  const reason = String(documentReasons.value[docKey] || '').trim()
  if (status === 'rejected' && !reason) {
    documentError.value = 'Veuillez saisir un motif pour rejeter le document.'
    documentSuccess.value = null
    return
  }

  documentSaving.value[docKey] = true
  documentError.value = null
  documentSuccess.value = null

  try {
    const moderationEntry = {
      actionType: 'document_review',
      documentKey: docKey,
      status,
      reason,
      createdAt: new Date(),
    }

    const moderationNotification = {
      category: 'document',
      documentKey: docKey,
      status,
      reason,
      message: status === 'approved' ? `Document ${docKey} valide.` : `Document ${docKey} rejete.`,
      createdAt: new Date(),
      read: false,
    }

    // read current documents map value to decide how to update
    const currentRaw = (driver.value.documents || {})[docKey]
    const updates: Record<string, any> = {}
    if (typeof currentRaw === 'string' || !currentRaw) {
      // replace string value with object containing url and validation
      updates[`documents.${docKey}`] = {
        url: typeof currentRaw === 'string' ? currentRaw : '',
        validationStatus: status,
        validationReason: status === 'rejected' ? reason : '',
        validatedAt: new Date(),
      }
    } else {
      updates[`documents.${docKey}.validationStatus`] = status
      updates[`documents.${docKey}.validationReason`] = status === 'rejected' ? reason : ''
      updates[`documents.${docKey}.validatedAt`] = new Date()
    }

    updates['moderation.documentDecisions'] = arrayUnion(moderationEntry)
    updates['moderation.notifications'] = arrayUnion(moderationNotification)

    await updateDoc(doc(db, 'drivers', driver.value.id), updates)

    // update local copy
    const updatedDocuments = {
      ...(driver.value.documents || {}),
      [docKey]: typeof currentRaw === 'string' || !currentRaw
        ? {
            url: typeof currentRaw === 'string' ? currentRaw : '',
            validationStatus: status,
            validationReason: status === 'rejected' ? reason : '',
          }
        : {
            ...currentRaw,
            validationStatus: status,
            validationReason: status === 'rejected' ? reason : '',
          },
    }

    driver.value = {
      ...driver.value,
      documents: updatedDocuments,
    }

    documentSuccess.value = status === 'approved' ? 'Document valide avec succes.' : 'Document rejete avec succes.'
  } catch (e) {
    console.error(e)
    documentError.value = 'Impossible de mettre a jour le statut du document.'
  } finally {
    documentSaving.value[docKey] = false
  }
}

// image lightbox
const enlargedImage = ref<string | null>(null)
const openImage = (url: string) => { enlargedImage.value = url }
const closeImage = () => { enlargedImage.value = null }
const isImage = (url?: string) => {
  if (!url) return false
  return /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(String(url))
}

const histories = ref<any[]>([])

const loadHistories = async () => {
  if (!id) return
  try {
    histories.value = await getDriverHistories(id)
  } catch (e) {
    console.error('Failed to load histories', e)
    histories.value = []
  }
}

const scrollToHistories = () => {
  const el = document.getElementById('histories')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleVerify = async () => {
  if (!driver.value?.id) return
  verifyError.value = null
  verifySuccess.value = null
  verifying.value = true
  try {
    await verifyDriver(driver.value.id)
    verifySuccess.value = 'Chauffeur validé.'
    // refresh
    loading.value = true
    const d = await getDriverById(id)
    driver.value = d
    moderationInfo.value = (d && (d as any).moderation)?.status ? `${(d as any).moderation.status} (${(d as any).moderation.reason || '—'})` : '—'
    await loadHistories()
    setTimeout(()=>{ verifySuccess.value = null }, 4000)
  } catch (e) {
    console.error(e)
    verifyError.value = 'Impossible de valider le chauffeur.'
    setTimeout(()=>{ verifyError.value = null }, 4000)
  } finally {
    verifying.value = false
    loading.value = false
  }
}

onMounted(async ()=>{
  try{
    const d = await getDriverById(id)
    driver.value = d
    // read moderation info if present
    moderationInfo.value = (d && (d as any).moderation)?.status ? `${(d as any).moderation.status} (${(d as any).moderation.reason || '—'})` : '—'
    await loadHistories()
    if (route.hash === '#histories') setTimeout(()=>scrollToHistories(), 200)
  }finally{ loading.value = false }
})

const onModerationDone = ({ decision, error }:{decision:string,error?:any})=>{
  openModeration.value = false
  if (error) {
    moderationError.value = 'Impossible de terminer la modération.'
    setTimeout(()=>{ moderationError.value = null }, 4000)
    return
  }

  // show success message
  moderationSuccess.value = decision === 'approved' ? 'Modération approuvée.' : 'Modération rejetée.'
  setTimeout(()=>{ moderationSuccess.value = null }, 4000)

  // refresh driver
  loading.value = true
  getDriverById(id).then(d=>{ driver.value = d; moderationInfo.value = (d && (d as any).moderation)?.status ? `${(d as any).moderation.status} (${(d as any).moderation.reason || '—'})` : '—'; loading.value=false }).finally(()=>{ loadHistories() })
}
</script>
