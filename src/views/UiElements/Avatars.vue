<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Tickets support (SAV)" />
    <p class="mb-4 text-sm text-gray-500">Suivi des tickets support clients et prestataires avec reponse admin.</p>

    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-success-100 bg-success-50 text-success-600">
            <check-circle-2 class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{{ ticketStats.resolvedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Ticket resolu</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ ticketStats.resolved }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-success-500" :style="{ width: `${ticketStats.resolvedPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
            <inbox class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ ticketStats.received }}</span>
        </div>
        <p class="text-xs text-gray-500">Ticket recu</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ ticketStats.received }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-brand-500" :style="{ width: `${ticketStats.receivedPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-info-100 bg-info-50 text-info-600">
            <message-circle-reply class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-info-50 px-2 py-0.5 text-xs font-semibold text-info-700">{{ ticketStats.processedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Traitee</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ ticketStats.processed }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-info-500" :style="{ width: `${ticketStats.processedPct}%` }" />
        </div>
      </article>

      <article class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <archive class="h-4 w-4" />
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{{ ticketStats.closedPct }}%</span>
        </div>
        <p class="text-xs text-gray-500">Fermee</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ ticketStats.closed }}</p>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-gray-500" :style="{ width: `${ticketStats.closedPct}%` }" />
        </div>
      </article>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher ticket, sujet, utilisateur..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <select v-model="filterStatus" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Statut</option>
          <option value="open">open</option>
          <option value="pending_user">pending_user</option>
          <option value="answered">answered</option>
          <option value="closed">closed</option>
        </select>

        <select v-model="filterPriority" class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <option value="">Priorite</option>
          <option value="low">low</option>
          <option value="normal">normal</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>

        <label class="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
          <input v-model="filterUnreadByAdmin" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
          Non lus admin
        </label>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ticket</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Role / User</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Sujet</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Statut</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Priorite</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Dernier msg</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Chargement...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-error-600 sm:px-6">{{ error }}</td>
              </tr>
              <tr v-else-if="filteredTickets.length === 0">
                <td colspan="7" class="px-5 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400 sm:px-6">Aucun ticket support.</td>
              </tr>
              <tr v-for="ticket in filteredTickets" :key="ticket.id" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4 sm:px-6">
                  <div>
                    <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ ticket.ticketNumber }}</span>
                    <span class="block text-gray-500 text-theme-xs dark:text-gray-400">{{ formatDate(ticket.createdAt) }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="block text-gray-700 text-theme-sm dark:text-white/90">{{ ticket.role }}</span>
                  <span class="block text-gray-500 text-theme-xs dark:text-gray-400">{{ ticket.userId || ticket.providerId || '—' }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div style="min-width: 220px;">
                    <span class="block font-medium text-gray-700 text-theme-sm dark:text-white/90">{{ ticket.subject }}</span>
                    <span class="block text-gray-500 text-theme-xs dark:text-gray-400">{{ ticket.category }}</span>
                    <span v-if="ticket.reservationId" class="block text-gray-500 text-theme-xs dark:text-gray-400">Resa: {{ ticket.reservationId }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full px-2 py-0.5 text-theme-xs font-medium" :class="statusBadgeClass(ticket.status)">{{ ticket.status }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full px-2 py-0.5 text-theme-xs font-medium" :class="priorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="block text-gray-700 text-theme-sm dark:text-white/90">{{ ticket.lastMessageBy || '—' }}</span>
                  <span class="block text-gray-500 text-theme-xs dark:text-gray-400">{{ formatDate(ticket.lastMessageAt) }}</span>
                  <span v-if="ticket.unreadByAdmin" class="inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-theme-xs font-medium text-warning-600">Non lu admin</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <button
                    class="rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white disabled:opacity-50"
                    :disabled="sendingTicketId === ticket.id"
                    @click="openReplyModal(ticket)"
                  >
                    Repondre
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="selectedTicket" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="closeReplyModal">
      <div class="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Reponse ticket</h3>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ selectedTicket.ticketNumber }} - {{ selectedTicket.subject }}</div>

        <textarea
          v-model="replyMessage"
          rows="6"
          class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          placeholder="Saisir votre reponse..."
        />

        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="closeReplyModal">Annuler</button>
          <button class="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="sendingTicketId === selectedTicket.id || !replyMessage.trim()" @click="handleSendReply">
            {{ sendingTicketId === selectedTicket.id ? 'Envoi...' : 'Envoyer la reponse' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Archive, CheckCircle2, Inbox, MessageCircleReply } from 'lucide-vue-next'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getSupportTickets, replySupportTicket, type SupportTicketItem } from '~/services/supportTickets'

defineOptions({ name: 'SupportTicketsPage' })

const loading = ref(true)
const error = ref<string | null>(null)
const sendingTicketId = ref<string | null>(null)

const tickets = ref<SupportTicketItem[]>([])
const selectedTicket = ref<SupportTicketItem | null>(null)
const replyMessage = ref('')

const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const filterUnreadByAdmin = ref(false)

onMounted(async () => {
  try {
    tickets.value = await getSupportTickets()
  } catch {
    error.value = 'Impossible de charger les tickets support.'
  } finally {
    loading.value = false
  }
})

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

const filteredTickets = computed(() => {
  const query = normalize(searchQuery.value)

  return tickets.value.filter((ticket) => {
    const matchQuery = !query
      || normalize(ticket.ticketNumber).includes(query)
      || normalize(ticket.subject).includes(query)
      || normalize(ticket.category).includes(query)
      || normalize(ticket.userId || '').includes(query)
      || normalize(ticket.providerId || '').includes(query)

    const matchStatus = !filterStatus.value || ticket.status === filterStatus.value
    const matchPriority = !filterPriority.value || ticket.priority === filterPriority.value
    const matchUnread = !filterUnreadByAdmin.value || ticket.unreadByAdmin

    return matchQuery && matchStatus && matchPriority && matchUnread
  })
})

const ticketStats = computed(() => {
  const statuses = tickets.value.map((ticket) => String(ticket.status || '').toLowerCase())
  const closed = statuses.filter((status) => status === 'closed').length
  const processed = statuses.filter((status) => status === 'answered').length
  const total = tickets.value.length

  const toPct = (value: number) => {
    if (!total) return 0
    return Math.round((value / total) * 100)
  }

  return {
    received: total,
    resolved: statuses.filter((status) => status === 'answered' || status === 'closed').length,
    processed,
    closed,
    receivedPct: total > 0 ? 100 : 0,
    resolvedPct: toPct(statuses.filter((status) => status === 'answered' || status === 'closed').length),
    processedPct: toPct(processed),
    closedPct: toPct(closed),
  }
})

const toDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value.seconds) return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value?: { seconds?: number } | Date | null) => {
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

const statusBadgeClass = (status: string) => {
  if (status === 'open') return 'bg-warning-50 text-warning-600'
  if (status === 'pending_user') return 'bg-info-50 text-info-600'
  if (status === 'answered') return 'bg-success-50 text-success-600'
  if (status === 'closed') return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-600'
}

const priorityBadgeClass = (priority: string) => {
  if (priority === 'low') return 'bg-gray-100 text-gray-600'
  if (priority === 'normal') return 'bg-info-50 text-info-600'
  if (priority === 'high') return 'bg-warning-50 text-warning-600'
  if (priority === 'urgent') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const openReplyModal = (ticket: SupportTicketItem) => {
  selectedTicket.value = ticket
  replyMessage.value = ''
}

const closeReplyModal = () => {
  selectedTicket.value = null
  replyMessage.value = ''
}

const handleSendReply = async () => {
  if (!selectedTicket.value || !replyMessage.value.trim()) return

  sendingTicketId.value = selectedTicket.value.id
  try {
    await replySupportTicket(selectedTicket.value.id, replyMessage.value.trim())

    tickets.value = tickets.value.map((ticket) => {
      if (ticket.id !== selectedTicket.value?.id) return ticket
      return {
        ...ticket,
        status: 'answered',
        lastMessageBy: 'admin',
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        unreadByAdmin: false,
        unreadByUser: true,
      }
    })

    closeReplyModal()
  } catch {
    window.alert('Impossible d\'envoyer la reponse.')
  } finally {
    sendingTicketId.value = null
  }
}
</script>
