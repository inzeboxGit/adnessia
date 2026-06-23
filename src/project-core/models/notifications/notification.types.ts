import type { Timestamp } from 'firebase/firestore'

export type NotificationDateValue =
  | Timestamp
  | Date
  | { seconds?: number; nanoseconds?: number }
  | null
  | undefined

export type SentNotificationItem = {
  id: string
  title: string
  message: string
  sentBy: string
  sentTo: string
  sentDate: NotificationDateValue
}

export type PushCustomerItem = {
  id: string
  uid: string
  name: string
  email: string
  phone: string
  playerId: string
}

export type NotificationTargetMode = 'all' | 'selected'

export type SendPushNotificationInput = {
  title: string
  message: string
  targetMode: NotificationTargetMode
  sentBy: string
  recipients: PushCustomerItem[]
}

export type SendPushNotificationResult = {
  notificationIds: string[]
  sentCount: number
}
