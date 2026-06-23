<template>
  <div class="min-w-0 overflow-x-hidden">
    <div class="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input v-model="searchQuery" type="search" placeholder="Rechercher une video, hashtag ou document..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />

      <select v-model="filterCategory"
        class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Categorie</option>
        <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
      </select>

      <select v-model="filterPublicationStatus"
        class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Publication</option>
        <option value="published">published</option>
        <option value="draft">draft</option>
        <option value="scheduled">scheduled</option>
        <option value="archived">archived</option>
      </select>

      <select v-model="filterModerationStatus"
        class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <option value="">Moderation</option>
        <option value="approved">approved</option>
        <option value="pending">pending</option>
        <option value="rejected">rejected</option>
        <option value="trashed">trashed</option>
      </select>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total reels</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ items.length }}</p>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-sm text-gray-500 dark:text-gray-400">Publies</p>
        <p class="mt-2 text-2xl font-semibold text-success-600">{{ publishedCount }}</p>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="text-sm text-gray-500 dark:text-gray-400">Trashes</p>
        <p class="mt-2 text-2xl font-semibold text-error-600">{{ trashedCount }}</p>
      </div>
    </div>

    <div v-if="loading"
      class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
      Chargement des reels...
    </div>

    <div v-else-if="error"
      class="rounded-2xl border border-error-200 bg-error-50 p-8 text-center text-sm text-error-700 dark:border-error-900/60 dark:bg-error-500/10 dark:text-error-300">
      {{ error }}
    </div>

    <div v-else-if="filteredItems.length === 0"
      class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
      Aucune video trouvee.
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      <article v-for="item in filteredItems" :key="item.id"
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="relative bg-gray-950">
          <video :src="item.videoUrl" :poster="item.thumbnailUrl || undefined" controls preload="metadata"
            class="aspect-[9/16] w-full bg-black object-cover" />
          <div class="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
              {{ formatCategory(item.categorie) }}
            </span>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="publicationBadgeClass(item.publicationStatus)">
              {{ item.publicationStatus }}
            </span>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="moderationBadgeClass(item.moderation.status)">
              {{ item.moderation.status }}
            </span>
          </div>
        </div>

        <div class="space-y-3 p-4">
          <div>
            <h3 class="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">{{ item.title }}</h3>
            <div class="mt-2">
              <button
                class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                @click="toggleExpanded(item.id)"
              >
                {{ expandedIds.has(item.id) ? 'Fermer' : 'Voir Plus' }}
              </button>
            </div>
          </div>

          <div v-if="expandedIds.has(item.id)" class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ item.description || '—' }}</p>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                <p class="text-gray-500 dark:text-gray-400">Agence</p>
                <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ item.agencyName }}</p>
              </div>
              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                <p class="text-gray-500 dark:text-gray-400">Document</p>
                <p class="mt-1 truncate font-medium text-gray-900 dark:text-white">{{ item.documentId }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2" v-if="item.hashtags.length">
              <span v-for="hashtag in item.hashtags" :key="`${item.id}-${hashtag}`"
                class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                {{ hashtag }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <p>Cree le</p>
                <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.createdAt) }}</p>
              </div>
              <div>
                <p>Publie le</p>
                <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.publishedAt) }}</p>
              </div>
            </div>

            <div v-if="item.moderation.reason"
              class="rounded-2xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-900/60 dark:bg-error-500/10 dark:text-error-300">
              {{ item.moderation.reason }}
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-sm">
            <a
              :href="item.videoUrl"
              target="_blank"
              rel="noreferrer"
              class="rounded-xl border border-gray-200 px-3 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              Voir
            </a>
            <button
              class="rounded-xl bg-success-600 px-3 py-2 font-medium text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="approvingId === item.id || item.moderation.status === 'approved'"
              @click="openModerationModal(item, 'approve')"
            >
              {{ item.moderation.status === 'approved' ? 'Approuvee' : 'Approuver' }}
            </button>
            <button
              class="rounded-xl bg-error-600 px-3 py-2 font-medium text-white transition hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="approvingId === item.id || item.moderation.status === 'rejected'"
              @click="openModerationModal(item, 'reject')"
            >
              {{ item.moderation.status === 'rejected' ? 'Rejetee' : 'Rejeter' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="selectedItem"
      class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4"
      @click.self="closeModerationModal"
    >
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          {{ moderationAction === 'approve' ? 'Approuver la video' : 'Rejeter la video' }}
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ selectedItem.title }}</p>

        <textarea
          v-model="approveReason"
          rows="4"
          :placeholder="moderationAction === 'approve' ? 'Raison optionnelle...' : 'Raison du rejet...'"
          class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
            @click="closeModerationModal"
          >
            Annuler
          </button>
          <button
            class="rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            :class="moderationAction === 'approve' ? 'bg-success-600' : 'bg-error-600'"
            :disabled="approving || (moderationAction === 'reject' && !approveReason.trim())"
            @click="handleModerationConfirm"
          >
            {{ approving ? 'Enregistrement...' : moderationAction === 'approve' ? 'Approuver' : 'Rejeter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { SocialContentDateValue, SocialContentItem } from '~/models/social'
import {
  approveSocialContent,
  getSocialContents,
  rejectSocialContent,
} from '~/services/content.service'

defineOptions({ name: 'SocialContents' })

const loading = ref(true)
const error = ref<string | null>(null)
const items = ref<SocialContentItem[]>([])
const searchQuery = ref('')
const filterCategory = ref('')
const filterPublicationStatus = ref('')
const filterModerationStatus = ref('')
const selectedItem = ref<SocialContentItem | null>(null)
const approveReason = ref('')
const approving = ref(false)
const approvingId = ref<string | null>(null)
const moderationAction = ref<'approve' | 'reject'>('approve')
const expandedIds = ref<Set<string>>(new Set())

const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

const toDate = (value: SocialContentDateValue) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value: SocialContentDateValue) => {
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

const formatCategory = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Sans categorie'

const publicationBadgeClass = (status: string) => {
  if (status === 'published') return 'bg-success-100 text-success-700'
  if (status === 'draft') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  if (status === 'scheduled') return 'bg-warning-100 text-warning-700'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const moderationBadgeClass = (status: string) => {
  if (status === 'approved') return 'bg-success-100 text-success-700'
  if (status === 'pending') return 'bg-warning-100 text-warning-700'
  if (status === 'rejected' || status === 'trashed') return 'bg-error-100 text-error-700'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const categoryOptions = computed(() =>
  Array.from(new Set(items.value.map((item) => item.categorie).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr')),
)

const publishedCount = computed(() => items.value.filter((item) => item.publicationStatus === 'published').length)
const trashedCount = computed(() => items.value.filter((item) => item.moderation.status === 'trashed' || item.status === 'trashed').length)

const filteredItems = computed(() => {
  const query = normalizeText(searchQuery.value)

  return items.value.filter((item) => {
    const matchQuery = !query
      || normalizeText(item.title).includes(query)
      || normalizeText(item.description).includes(query)
      || normalizeText(item.documentId).includes(query)
      || normalizeText(item.documentTitle).includes(query)
      || normalizeText(item.agencyName).includes(query)
      || item.hashtags.some((tag) => normalizeText(tag).includes(query))

    const matchCategory = !filterCategory.value || item.categorie === filterCategory.value
    const matchPublicationStatus = !filterPublicationStatus.value || item.publicationStatus === filterPublicationStatus.value
    const matchModerationStatus = !filterModerationStatus.value || item.moderation.status === filterModerationStatus.value

    return matchQuery && matchCategory && matchPublicationStatus && matchModerationStatus
  })
})

const patchLocalItem = (id: string, payload: Partial<SocialContentItem>) => {
  items.value = items.value.map((item) => (item.id === id ? { ...item, ...payload } : item))
}

const toggleExpanded = (id: string) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

const openModerationModal = (item: SocialContentItem, action: 'approve' | 'reject') => {
  selectedItem.value = item
  moderationAction.value = action
  approveReason.value = item.moderation.reason || ''
}

const closeModerationModal = () => {
  selectedItem.value = null
  approveReason.value = ''
  approving.value = false
}

const handleModerationConfirm = async () => {
  if (!selectedItem.value) return

  approving.value = true
  approvingId.value = selectedItem.value.id

  try {
    const reason = approveReason.value.trim()
    const isApprove = moderationAction.value === 'approve'

    if (isApprove) {
      await approveSocialContent(selectedItem.value.id, reason)
    } else {
      await rejectSocialContent(selectedItem.value.id, reason)
    }

    patchLocalItem(selectedItem.value.id, {
      moderation: {
        ...selectedItem.value.moderation,
        approved: isApprove,
        status: isApprove ? 'approved' : 'rejected',
        reason,
        reviewedAt: new Date(),
      },
    })

    closeModerationModal()
  } catch {
    window.alert(
      moderationAction.value === 'approve'
        ? "Impossible d'approuver cette video."
        : "Impossible de rejeter cette video.",
    )
  } finally {
    approving.value = false
    approvingId.value = null
  }
}

onMounted(async () => {
  try {
    items.value = await getSocialContents()
  } catch {
    error.value = 'Impossible de charger les videos depuis la collection social_content.'
  } finally {
    loading.value = false
  }
})
</script>
