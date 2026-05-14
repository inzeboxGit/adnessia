import type { CentralizedReservationItem } from '~/services/reservations'

type DateLike = Date | { seconds?: number } | { toDate?: () => Date } | null | undefined

export type ReservationStatItem = {
  title: string
  value: number
  change: number
  changeLabel: string
  description: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export const toDate = (value?: DateLike) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const isWithinRange = (value: Date | null, start: Date, end: Date) => {
  if (!value) return false
  return value >= start && value < end
}

const getEvolution = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

const computeStats = (items: CentralizedReservationItem[]) => {
  return {
    total: items.length,
    confirmed: items.filter((item) => item.status === 'confirmee').length,
    pending: items.filter((item) => item.status === 'pending').length,
    cancelled: items.filter((item) => item.status === 'annulee' || item.status === 'refunded').length,
    providers: new Set(items.map((item) => item.providerName).filter((name) => name && name !== '—')).size,
  }
}

export const getReservationStatItems = (reservations: CentralizedReservationItem[]): ReservationStatItem[] => {
  const stats = computeStats(reservations)
  const now = new Date()
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousPeriodEnd = currentPeriodStart

  const currentPeriodItems = reservations.filter((item) => isWithinRange(toDate(item.raw.createdAt), currentPeriodStart, currentPeriodEnd))
  const previousPeriodItems = reservations.filter((item) => isWithinRange(toDate(item.raw.createdAt), previousPeriodStart, previousPeriodEnd))

  const currentPeriodStats = computeStats(currentPeriodItems)
  const previousPeriodStats = computeStats(previousPeriodItems)

  return [
    {
      title: 'Total',
      value: stats.total,
      change: getEvolution(currentPeriodStats.total, previousPeriodStats.total),
      changeLabel: `vs ${previousPeriodStats.total}`,
      description: 'Total Categories',
      tone: 'primary',
    },
    {
      title: 'Confirmees',
      value: stats.confirmed,
      change: getEvolution(currentPeriodStats.confirmed, previousPeriodStats.confirmed),
      changeLabel: `vs ${previousPeriodStats.confirmed}`,
      description: 'Reservations validees',
      tone: 'success',
    },
    {
      title: 'En attente',
      value: stats.pending,
      change: getEvolution(currentPeriodStats.pending, previousPeriodStats.pending),
      changeLabel: `vs ${previousPeriodStats.pending}`,
      description: 'Demandes a traiter',
      tone: 'warning',
    },
    {
      title: 'Annulees',
      value: stats.cancelled,
      change: getEvolution(currentPeriodStats.cancelled, previousPeriodStats.cancelled),
      changeLabel: `vs ${previousPeriodStats.cancelled}`,
      description: 'Annulees ou remboursees',
      tone: 'danger',
    },
    {
      title: 'Prestataires',
      value: stats.providers,
      change: getEvolution(currentPeriodStats.providers, previousPeriodStats.providers),
      changeLabel: `vs ${previousPeriodStats.providers}`,
      description: 'Prestataires concernes',
      tone: 'info',
    },
  ]
}
