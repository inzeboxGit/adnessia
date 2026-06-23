import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { auth, authReady, db } from '~/config/firebase'
import type {
  NotificationDateValue,
  PushCustomerItem,
  SendPushNotificationInput,
  SendPushNotificationResult,
  SentNotificationItem,
} from '~/models/notifications'

const SENT_COLLECTION = 'sentNotifs'
const CUSTOMERS_COLLECTION = 'customers'
const ONESIGNAL_ENDPOINT = 'https://api.onesignal.com/notifications?c=push'
const ONESIGNAL_MAX_RECIPIENTS = 20_000

const toStringValue = (value: unknown) => (typeof value === 'string' ? value : '')

const toDateValue = (value: unknown): NotificationDateValue => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'seconds' in value) return value as NotificationDateValue
  return null
}

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const resolveCustomerName = (raw: Record<string, unknown>) => {
  return [
    toStringValue(raw.name),
    toStringValue(raw.firstName),
    toStringValue(raw.lastName),
  ].filter(Boolean).join(' ').trim() || toStringValue(raw.email) || 'Client'
}

const resolvePlayerId = (raw: Record<string, unknown>) => {
  if (typeof raw.playerId === 'string' && raw.playerId.trim()) return raw.playerId.trim()
  if (typeof raw.onesignalSubscriptionId === 'string' && raw.onesignalSubscriptionId.trim()) {
    return raw.onesignalSubscriptionId.trim()
  }
  if (Array.isArray(raw.playerIds)) {
    const first = raw.playerIds.find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    return first?.trim() || ''
  }
  return ''
}

const getOneSignalConfig = () => {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim()
  const apiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY?.trim()

  if (!appId || !apiKey) {
    throw new Error('Configuration OneSignal manquante: VITE_ONESIGNAL_APP_ID et VITE_ONESIGNAL_REST_API_KEY.')
  }

  return { appId, apiKey }
}

export async function getSentNotifications(): Promise<SentNotificationItem[]> {
  const snap = await getDocs(query(collection(db, SENT_COLLECTION), orderBy('sentDate', 'desc')))

  return snap.docs.map((docSnap) => {
    const raw = docSnap.data() as Record<string, unknown>

    return {
      id: docSnap.id,
      title: toStringValue(raw.title) || '—',
      message: toStringValue(raw.message) || '',
      sentBy: toStringValue(raw.sentBy) || '—',
      sentTo: toStringValue(raw.sentTo) || '—',
      sentDate: toDateValue(raw.sentDate),
    } satisfies SentNotificationItem
  })
}

export async function getPushCustomers(): Promise<PushCustomerItem[]> {
  const snap = await getDocs(collection(db, CUSTOMERS_COLLECTION))

  return snap.docs
    .map((docSnap) => {
      const raw = docSnap.data() as Record<string, unknown>

      return {
        id: docSnap.id,
        uid: toStringValue(raw.uid),
        name: resolveCustomerName(raw),
        email: toStringValue(raw.email),
        phone: toStringValue(raw.phone),
        playerId: resolvePlayerId(raw),
      } satisfies PushCustomerItem
    })
    .filter((customer) => Boolean(customer.playerId))
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'))
}

export async function getLoggedAdminIdentity(): Promise<string> {
  const user = auth.currentUser || await authReady
  return user?.email || user?.uid || 'admin'
}

export async function sendPushNotification(input: SendPushNotificationInput): Promise<SendPushNotificationResult> {
  const title = input.title.trim()
  const message = input.message.trim()

  if (!title || !message) {
    throw new Error('Le titre et le message sont obligatoires.')
  }

  const uniquePlayerIds = [...new Set(input.recipients.map((recipient) => recipient.playerId).filter(Boolean))]
  if (uniquePlayerIds.length === 0) {
    throw new Error('Aucun playerId valide selectionne.')
  }

  const { appId, apiKey } = getOneSignalConfig()
  const playerIdBatches = chunk(uniquePlayerIds, ONESIGNAL_MAX_RECIPIENTS)
  const notificationIds: string[] = []

  for (const batch of playerIdBatches) {
    const response = await fetch(ONESIGNAL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        target_channel: 'push',
        include_subscription_ids: batch,
        headings: { en: title },
        contents: { en: message },
        name: title,
      }),
    })

    const payload = await response.json().catch(() => null) as
      | { id?: string; errors?: Record<string, unknown> }
      | null

    if (!response.ok) {
      const detail = typeof payload?.errors === 'object' ? JSON.stringify(payload.errors) : response.statusText
      throw new Error(`Echec OneSignal (${response.status}): ${detail}`)
    }

    if (payload?.id) {
      notificationIds.push(payload.id)
    }
  }

  const sentTo = input.targetMode === 'all'
    ? 'All users'
    : input.recipients.length === 1
      ? input.recipients[0]!.name
      : `${input.recipients.length} users`

  await addDoc(collection(db, SENT_COLLECTION), {
    title,
    message,
    sentBy: input.sentBy,
    sentTo,
    sentDate: new Date(),
  })

  return {
    notificationIds,
    sentCount: uniquePlayerIds.length,
  }
}
