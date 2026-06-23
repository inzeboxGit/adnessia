<template>
  <AdminLayout>
    <div class="min-w-0 overflow-x-hidden">
      <PageBreadcrumb page-title="Notifications Push" />
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Historique des notifications envoyees et formulaire d'envoi OneSignal vers les clients via leur `playerId`.
      </p>

      <div class="grid grid-cols-1 gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle campagne push</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ pushCustomers.length }} clients avec playerId disponible.</p>
            </div>
            <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {{ form.targetMode === 'all' ? 'Tous les clients' : `${selectedRecipients.length} selectionnes` }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Titre</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Titre de la notification"
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Message</label>
                <textarea
                  v-model="form.message"
                  rows="5"
                  placeholder="Votre message..."
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
              </div>

              <div>
                <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Cible</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    class="rounded-xl px-3 py-2 text-sm font-medium"
                    :class="form.targetMode === 'all' ? 'bg-brand-600 text-white' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'"
                    @click="form.targetMode = 'all'"
                  >
                    Tous les clients
                  </button>
                  <button
                    class="rounded-xl px-3 py-2 text-sm font-medium"
                    :class="form.targetMode === 'selected' ? 'bg-brand-600 text-white' : 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'"
                    @click="form.targetMode = 'selected'"
                  >
                    Selection manuelle
                  </button>
                </div>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-900/60">
                <p class="font-medium text-gray-800 dark:text-gray-100">Resume</p>
                <p class="mt-2 text-gray-600 dark:text-gray-300">Envoyeur: {{ adminIdentity || '—' }}</p>
                <p class="mt-1 text-gray-600 dark:text-gray-300">Destinataires: {{ recipientSummary }}</p>
              </div>

              <div v-if="sendError" class="rounded-2xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-900/60 dark:bg-error-500/10 dark:text-error-300">
                {{ sendError }}
              </div>

              <div v-if="sendSuccess" class="rounded-2xl border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-900/60 dark:bg-success-500/10 dark:text-success-300">
                {{ sendSuccess }}
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="sending || !canSend"
                  @click="handleSend"
                >
                  {{ sending ? 'Envoi en cours...' : 'Envoyer la notification' }}
                </button>
                <button
                  class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  @click="resetForm"
                >
                  Reinitialiser
                </button>
              </div>
            </div>

            <div class="min-w-0">
              <div class="mb-3 flex items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Clients ciblables</h3>
                <button
                  v-if="form.targetMode === 'selected'"
                  class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                  :disabled="filteredCustomers.length === 0"
                  @click="toggleVisibleSelection"
                >
                  {{ allVisibleSelected ? 'Tout deselectionner' : 'Selectionner la liste' }}
                </button>
              </div>

              <input
                v-model="customerSearch"
                type="search"
                placeholder="Rechercher un client..."
                class="mb-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />

              <div class="max-h-[560px] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                <div v-if="customersLoading" class="p-4 text-sm text-gray-500 dark:text-gray-400">Chargement des clients...</div>
                <div v-else-if="customersError" class="p-4 text-sm text-error-600">{{ customersError }}</div>
                <div v-else-if="filteredCustomers.length === 0" class="p-4 text-sm text-gray-500 dark:text-gray-400">Aucun client trouve.</div>

                <label
                  v-for="customer in filteredCustomers"
                  :key="customer.id"
                  class="flex cursor-pointer items-start gap-3 border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-800"
                  :class="form.targetMode !== 'selected' ? 'opacity-60' : ''"
                >
                  <input
                    :checked="selectedCustomerIds.has(customer.id)"
                    :disabled="form.targetMode !== 'selected'"
                    type="checkbox"
                    class="mt-1 h-4 w-4 rounded border-gray-300"
                    @change="toggleCustomer(customer.id)"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-3">
                      <p class="truncate text-sm font-medium text-gray-800 dark:text-white/90">{{ customer.name }}</p>
                      <span class="rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-300">playerId</span>
                    </div>
                    <p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{{ customer.email || customer.phone || customer.uid || '—' }}</p>
                    <p class="mt-1 truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">{{ customer.playerId }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Historique</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ sentNotifications.length }} notifications en base.</p>
            </div>
          </div>

          <div class="space-y-3">
            <div v-if="historyLoading" class="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">Chargement de l'historique...</div>
            <div v-else-if="historyError" class="rounded-2xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-900/60 dark:bg-error-500/10 dark:text-error-300">{{ historyError }}</div>
            <div v-else-if="sentNotifications.length === 0" class="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">Aucune notification envoyee.</div>

            <article
              v-for="notification in sentNotifications"
              :key="notification.id"
              class="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">{{ notification.title }}</h3>
                  <p class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{{ notification.message }}</p>
                </div>
                <button
                  class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  @click="selectedNotification = notification"
                >
                  Visualiser
                </button>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <p>Envoye par</p>
                  <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{{ notification.sentBy }}</p>
                </div>
                <div>
                  <p>Envoye a</p>
                  <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{{ notification.sentTo }}</p>
                </div>
                <div class="col-span-2">
                  <p>Date</p>
                  <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{{ formatDate(notification.sentDate) }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <div
      v-if="selectedNotification"
      class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4"
      @click.self="selectedNotification = null"
    >
      <div class="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedNotification.title }}</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ formatDate(selectedNotification.sentDate) }}</p>
          </div>
          <button
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
            @click="selectedNotification = null"
          >
            Fermer
          </button>
        </div>

        <div class="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {{ selectedNotification.message }}
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
            <p class="text-xs text-gray-500 dark:text-gray-400">Envoye par</p>
            <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ selectedNotification.sentBy }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
            <p class="text-xs text-gray-500 dark:text-gray-400">Envoye a</p>
            <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ selectedNotification.sentTo }}</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import type {
  NotificationDateValue,
  NotificationTargetMode,
  PushCustomerItem,
  SentNotificationItem,
} from '~/models/notifications'
import {
  getLoggedAdminIdentity,
  getPushCustomers,
  getSentNotifications,
  sendPushNotification,
} from '~/services/notifications'

defineOptions({ name: 'NotificationsPage' })

const sentNotifications = ref<SentNotificationItem[]>([])
const pushCustomers = ref<PushCustomerItem[]>([])
const selectedNotification = ref<SentNotificationItem | null>(null)

const historyLoading = ref(true)
const customersLoading = ref(true)
const historyError = ref<string | null>(null)
const customersError = ref<string | null>(null)
const sending = ref(false)
const sendError = ref<string | null>(null)
const sendSuccess = ref<string | null>(null)
const customerSearch = ref('')
const adminIdentity = ref('')
const selectedCustomerIds = ref<Set<string>>(new Set())

const form = ref<{
  title: string
  message: string
  targetMode: NotificationTargetMode
}>({
  title: '',
  message: '',
  targetMode: 'all',
})

const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

const toDate = (value: NotificationDateValue) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value: NotificationDateValue) => {
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

const filteredCustomers = computed(() => {
  const query = normalizeText(customerSearch.value)
  if (!query) return pushCustomers.value

  return pushCustomers.value.filter((customer) =>
    normalizeText(customer.name).includes(query)
    || normalizeText(customer.email).includes(query)
    || normalizeText(customer.phone).includes(query)
    || normalizeText(customer.playerId).includes(query),
  )
})

const selectedRecipients = computed(() =>
  pushCustomers.value.filter((customer) => selectedCustomerIds.value.has(customer.id)),
)

const allVisibleSelected = computed(() =>
  filteredCustomers.value.length > 0
  && filteredCustomers.value.every((customer) => selectedCustomerIds.value.has(customer.id)),
)

const recipientSummary = computed(() => {
  if (form.value.targetMode === 'all') return `${pushCustomers.value.length} clients`
  return `${selectedRecipients.value.length} clients`
})

const canSend = computed(() => {
  if (!form.value.title.trim() || !form.value.message.trim()) return false
  if (form.value.targetMode === 'all') return pushCustomers.value.length > 0
  return selectedRecipients.value.length > 0
})

const toggleCustomer = (customerId: string) => {
  const next = new Set(selectedCustomerIds.value)
  if (next.has(customerId)) next.delete(customerId)
  else next.add(customerId)
  selectedCustomerIds.value = next
}

const toggleVisibleSelection = () => {
  const next = new Set(selectedCustomerIds.value)

  if (allVisibleSelected.value) {
    for (const customer of filteredCustomers.value) next.delete(customer.id)
  } else {
    for (const customer of filteredCustomers.value) next.add(customer.id)
  }

  selectedCustomerIds.value = next
}

const resetForm = () => {
  form.value.title = ''
  form.value.message = ''
  form.value.targetMode = 'all'
  selectedCustomerIds.value = new Set()
  sendError.value = null
  sendSuccess.value = null
}

const refreshHistory = async () => {
  historyLoading.value = true
  historyError.value = null
  try {
    sentNotifications.value = await getSentNotifications()
  } catch {
    historyError.value = "Impossible de charger l'historique des notifications."
  } finally {
    historyLoading.value = false
  }
}

const handleSend = async () => {
  if (!canSend.value) return

  sendError.value = null
  sendSuccess.value = null
  sending.value = true

  try {
    const recipients = form.value.targetMode === 'all' ? pushCustomers.value : selectedRecipients.value
    const result = await sendPushNotification({
      title: form.value.title,
      message: form.value.message,
      targetMode: form.value.targetMode,
      sentBy: adminIdentity.value || 'admin',
      recipients,
    })

    await refreshHistory()
    resetForm()
    sendSuccess.value = `Notification envoyee a ${result.sentCount} client(s).`
  } catch (error) {
    sendError.value = error instanceof Error ? error.message : "Impossible d'envoyer la notification."
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  adminIdentity.value = await getLoggedAdminIdentity()

  await Promise.all([
    refreshHistory(),
    (async () => {
      customersLoading.value = true
      customersError.value = null
      try {
        pushCustomers.value = await getPushCustomers()
      } catch {
        customersError.value = 'Impossible de charger les clients avec playerId.'
      } finally {
        customersLoading.value = false
      }
    })(),
  ])
})
</script>
