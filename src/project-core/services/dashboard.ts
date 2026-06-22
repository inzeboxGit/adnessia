import { collection, getDocs } from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { PartnerListingCategory } from '~/models/listings'
import { mapReservation, type Reservation, type ReservationType } from '~/models/reservations'
import type { Agence, Paiement, SponsorCampaign } from '~/types'

type DateLike = Date | { seconds?: number } | { toDate?: () => Date } | null | undefined

type ListingCollection = 'activities' | 'hebergements' | 'vehicules_annonces' | 'vehicules_vtc_annonces'

export type DashboardDateFilter = {
  startDate?: DateLike
  endDate?: DateLike
  date?: DateLike
  day?: number
  month?: number
  year?: number
}

export type DashboardRecentActivityKind = 'RESERVATION' | 'SPONSORING' | PartnerListingCategory

export type DashboardRecentActivityItem = {
  id: string
  kind: DashboardRecentActivityKind
  title: string
  subtitle: string
  createdAt: DateLike
  sourceCollection: 'reservations' | 'sponsor_campaigns' | ListingCollection
}

export type DashboardTopCategoryItem = {
  key: PartnerListingCategory
  label: string
  count: number
  percent: number
}

export type DashboardTopCityItem = {
  label: string
  count: number
  percent: number
}

export type DashboardPerformanceStats = {
  reservationsCount: number
  revenueMad: number
  newProvidersCount: number
}

export type DashboardHeadlineStats = {
  reservationsConfirmedToday: number
  reservationsConfirmedYesterday: number
  revenueMad: number
  revenuePreviousMad: number
  commissionMad: number
  commissionRate: number
  openIncidents: number
  pendingProviders: number
}

export type DashboardSponsoringRevenueStats = {
  revenueMad: number
}

export type DashboardAlertStats = {
  pendingReservations: number
  listingReports: number
  supportTicketsOpen: number
}

const LISTING_COLLECTIONS: Array<{ collection: ListingCollection, kind: PartnerListingCategory }> = [
  { collection: 'activities', kind: 'ACTIVITE' },
  { collection: 'hebergements', kind: 'HEBERGEMENT' },
  { collection: 'vehicules_annonces', kind: 'LOCATION_VOITURE' },
  { collection: 'vehicules_vtc_annonces', kind: 'VTC' },
]

const categoryLabel = (key: PartnerListingCategory) => {
  if (key === 'HEBERGEMENT') return 'Hebergements'
  if (key === 'LOCATION_VOITURE') return 'Locations de voitures'
  if (key === 'ACTIVITE') return 'Activites'
  return 'VTC'
}

const toDate = (value: DateLike) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const toMillis = (value: DateLike) => toDate(value)?.getTime() ?? 0

const asDateLike = (value: unknown): DateLike => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object') return value as DateLike
  return null
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const getDateRange = (filter?: DashboardDateFilter) => {
  if (!filter) return null

  if (filter.startDate || filter.endDate) {
    const start = filter.startDate ? startOfDay(toDate(filter.startDate) || new Date(0)) : new Date(0)
    const end = filter.endDate ? endOfDay(toDate(filter.endDate) || new Date()) : new Date()
    return { start, end }
  }

  if (filter.date) {
    const exact = toDate(filter.date)
    if (!exact) return null
    return { start: startOfDay(exact), end: endOfDay(exact) }
  }

  if (typeof filter.day === 'number' && typeof filter.month === 'number') {
    const year = filter.year ?? new Date().getFullYear()
    const exact = new Date(year, filter.month - 1, filter.day)
    return { start: startOfDay(exact), end: endOfDay(exact) }
  }

  return null
}

const isInDateRange = (value: DateLike, filter?: DashboardDateFilter) => {
  const range = getDateRange(filter)
  if (!range) return true

  const date = toDate(value)
  if (!date) return false

  return date >= range.start && date <= range.end
}

const listingTitle = (kind: PartnerListingCategory, raw: Record<string, unknown>, id: string) => {
  if (kind === 'ACTIVITE') return String(raw.titre || raw.title || id)
  return String(raw.title || raw.titre || raw.nom || raw.modele || id)
}

const listingHeadline = (kind: PartnerListingCategory) => {
  if (kind === 'ACTIVITE') return 'Nouvelle activite'
  if (kind === 'HEBERGEMENT') return 'Nouveau hebergement'
  if (kind === 'LOCATION_VOITURE') return 'Nouvelle annonce location'
  return 'Nouvelle annonce VTC'
}

const reservationTypeLabel = (type: ReservationType) => {
  if (type === 'ACTIVITE') return 'Activite'
  if (type === 'HEBERGEMENT') return 'Hebergement'
  if (type === 'LOCATION_VOITURE') return 'Location voiture'
  return 'VTC'
}

function toReservationActivity(raw: Record<string, unknown>, id: string): DashboardRecentActivityItem | null {
  try {
    const reservation = mapReservation({ id, ...raw }) as Reservation
    const reference = String(reservation.reference || id)
    const city = String(reservation.ville || '—')

    return {
      id,
      kind: 'RESERVATION',
      title: `Nouvelle reservation #${reference}`,
      subtitle: `${reservationTypeLabel(reservation.type)} - ${city}`,
      createdAt: reservation.createdAt,
      sourceCollection: 'reservations',
    }
  } catch {
    return null
  }
}

function toListingActivity(
  raw: Record<string, unknown>,
  id: string,
  source: { collection: ListingCollection, kind: PartnerListingCategory },
): DashboardRecentActivityItem {
  const title = listingTitle(source.kind, raw, id)
  const city = String(raw.ville || raw.city || '').trim()

  return {
    id,
    kind: source.kind,
    title: listingHeadline(source.kind),
    subtitle: city ? `${title} - ${city}` : title,
    createdAt: (raw.createdAt as DateLike) || (raw.updatedAt as DateLike) || null,
    sourceCollection: source.collection,
  }
}

function toSponsoringActivity(campaign: SponsorCampaign): DashboardRecentActivityItem {
  const title = String(campaign.publication?.title || campaign.id || 'Campagne')
  const city = String(campaign.publication?.city || '').trim()

  return {
    id: String(campaign.id || ''),
    kind: 'SPONSORING',
    title: 'Nouveau sponsoring active',
    subtitle: city ? `${title} - ${city}` : title,
    createdAt: campaign.createdAt || campaign.updatedAt,
    sourceCollection: 'sponsor_campaigns',
  }
}

export async function getDashboardRecentActivity(maxItems = 30, filter?: DashboardDateFilter): Promise<DashboardRecentActivityItem[]> {
  const [reservationsSnap, campaignsSnap, ...listingSnaps] = await Promise.all([
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'sponsor_campaigns')),
    ...LISTING_COLLECTIONS.map((source) => getDocs(collection(db, source.collection))),
  ])

  const reservationItems = reservationsSnap.docs
    .map((doc) => toReservationActivity(doc.data() as Record<string, unknown>, doc.id))
    .filter((item): item is DashboardRecentActivityItem => item !== null)

  const listingItems = listingSnaps.flatMap((snap, index) => {
    const source = LISTING_COLLECTIONS[index]!

    return snap.docs.map((doc) => {
      const raw = doc.data() as Record<string, unknown>
      return toListingActivity(raw, doc.id, source)
    })
  })

  const sponsoringItems = campaignsSnap.docs.map((doc) => {
    const campaign = { id: doc.id, ...doc.data() } as SponsorCampaign
    return toSponsoringActivity(campaign)
  })

  return [...reservationItems, ...listingItems, ...sponsoringItems]
    .filter((item) => isInDateRange(item.createdAt, filter))
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .slice(0, maxItems)
}

export async function getDashboardTopCategoriesByListings(filter?: DashboardDateFilter): Promise<DashboardTopCategoryItem[]> {
  const snaps = await Promise.all(
    LISTING_COLLECTIONS.map((source) => getDocs(collection(db, source.collection))),
  )

  const counts = snaps.map((snap, index) => {
    const source = LISTING_COLLECTIONS[index]!
    const count = snap.docs.filter((doc) => {
      const raw = doc.data() as Record<string, unknown>
      const createdAt = asDateLike(raw.createdAt) || asDateLike(raw.updatedAt)
      return isInDateRange(createdAt, filter)
    }).length

    return {
      key: source.kind,
      label: categoryLabel(source.kind),
      count,
    }
  })

  const total = counts.reduce((sum, item) => sum + item.count, 0)

  return counts
    .map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export async function getDashboardTopCitiesByListings(maxItems = 5, filter?: DashboardDateFilter): Promise<DashboardTopCityItem[]> {
  const listingSnaps = await Promise.all(
    LISTING_COLLECTIONS.map((source) => getDocs(collection(db, source.collection))),
  )

  const cityCount = new Map<string, number>()

  for (const snap of listingSnaps) {
    for (const doc of snap.docs) {
      const raw = doc.data() as Record<string, unknown>
      const createdAt = asDateLike(raw.createdAt) || asDateLike(raw.updatedAt)
      if (!isInDateRange(createdAt, filter)) continue

      const city = String(raw.ville || raw.city || '').trim()
      if (!city || city === '—' || city === '-') continue
      cityCount.set(city, (cityCount.get(city) || 0) + 1)
    }
  }

  const rows = [...cityCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return rows.slice(0, maxItems).map((row) => ({
    ...row,
    percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
  }))
}

export async function getDashboardPerformanceStats(filter?: DashboardDateFilter): Promise<DashboardPerformanceStats> {
  const [reservationsSnap, paiementsSnap, agencesSnap] = await Promise.all([
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'paiements')),
    getDocs(collection(db, 'agences')),
  ])

  const reservationsCount = reservationsSnap.docs.reduce((sum, doc) => {
    try {
      const reservation = mapReservation({ id: doc.id, ...doc.data() } as Record<string, unknown>) as Reservation
      return sum + (isInDateRange(reservation.createdAt, filter) ? 1 : 0)
    } catch {
      return sum
    }
  }, 0)

  const revenueMad = paiementsSnap.docs.reduce((sum, doc) => {
    const paiement = { id: doc.id, ...doc.data() } as Paiement
    if (paiement.statut !== 'confirmed') return sum
    if (!isInDateRange(asDateLike(paiement.dateCreation), filter)) return sum
    return sum + Number(paiement.montant ?? 0)
  }, 0)

  const newProvidersCount = agencesSnap.docs.reduce((sum, doc) => {
    const agence = { id: doc.id, ...doc.data() } as Agence
    return sum + (isInDateRange(asDateLike(agence.createdAt), filter) ? 1 : 0)
  }, 0)

  return {
    reservationsCount,
    revenueMad,
    newProvidersCount,
  }
}

export async function getDashboardSponsoringRevenueStats(
  filter?: DashboardDateFilter,
): Promise<DashboardSponsoringRevenueStats> {
  const paiementsSnap = await getDocs(collection(db, 'paiements'))

  const revenueMad = paiementsSnap.docs.reduce((sum, doc) => {
    const paiement = doc.data() as Paiement
    const reference = String(paiement.reference || '')
    const statut = String(paiement.statut || '').toLowerCase()

    if (!reference.startsWith('SPON-')) return sum
    if (statut !== 'paid') return sum
    if (!isInDateRange(paiement.dateCreation, filter)) return sum

    console.log('paiement xxx', paiement, 'sum', sum)

    return sum + Number(paiement.montant ?? 0)
  }, 0)

  return { revenueMad }
}

export async function getDashboardAlertStats(filter?: DashboardDateFilter): Promise<DashboardAlertStats> {
  const [reservationsSnap, incidentsSnap, supportTicketsSnap] = await Promise.all([
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'incidents')),
    getDocs(collection(db, 'supportTickets')),
  ])

  const pendingReservations = reservationsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.status || '').toLowerCase()
    const createdAt = asDateLike(raw.createdAt)
    if (status !== 'pending') return sum
    if (!isInDateRange(createdAt, filter)) return sum
    return sum + 1
  }, 0)

  const listingReports = incidentsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const type = String(raw.type || '').toLowerCase()
    const listingId = String(raw.listingId || '').trim()
    const createdAt = asDateLike(raw.createdAt)

    const isListingIncident = type === 'listing' || type.includes('listing') || Boolean(listingId)
    if (!isListingIncident) return sum
    if (!isInDateRange(createdAt, filter)) return sum
    return sum + 1
  }, 0)

  const supportTicketsOpen = supportTicketsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.status || '').toLowerCase()
    const createdAt = asDateLike(raw.createdAt)
    if (status !== 'open') return sum
    if (!isInDateRange(createdAt, filter)) return sum
    return sum + 1
  }, 0)

  return {
    pendingReservations,
    listingReports,
    supportTicketsOpen,
  }
}

export async function getDashboardHeadlineStats(filter?: DashboardDateFilter): Promise<DashboardHeadlineStats> {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStart = startOfDay(yesterday)
  const yesterdayEnd = endOfDay(yesterday)

  const [reservationsSnap, paiementsSnap, incidentsSnap, agencesSnap, nessiaConfigSnap] = await Promise.all([
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'paiements')),
    getDocs(collection(db, 'incidents')),
    getDocs(collection(db, 'agences')),
    getDocs(collection(db, 'nessiaConfig')),
  ])

  const reservationsConfirmedToday = reservationsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.status || '').toLowerCase()
    const createdAt = asDateLike(raw.createdAt)
    if (status !== 'confirmee' && status !== 'confirmed') return sum
    return sum + (isInDateRange(createdAt, { startDate: todayStart, endDate: todayEnd }) ? 1 : 0)
  }, 0)

  const reservationsConfirmedYesterday = reservationsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.status || '').toLowerCase()
    const createdAt = asDateLike(raw.createdAt)
    if (status !== 'confirmee' && status !== 'confirmed') return sum
    return sum + (isInDateRange(createdAt, { startDate: yesterdayStart, endDate: yesterdayEnd }) ? 1 : 0)
  }, 0)

  const revenueMad = paiementsSnap.docs.reduce((sum, doc) => {
    const paiement = { id: doc.id, ...doc.data() } as Paiement
    if (paiement.statut !== 'confirmed') return sum
    if (!isInDateRange(asDateLike(paiement.dateCreation), filter)) return sum
    return sum + Number(paiement.montant ?? 0)
  }, 0)

  let revenuePreviousMad = 0
  if (filter?.startDate && filter?.endDate) {
    const currentStart = toDate(filter.startDate)
    const currentEnd = toDate(filter.endDate)

    if (currentStart && currentEnd) {
      const duration = currentEnd.getTime() - currentStart.getTime()
      const previousEnd = new Date(currentStart.getTime() - 1)
      const previousStart = new Date(previousEnd.getTime() - duration)

      revenuePreviousMad = paiementsSnap.docs.reduce((sum, doc) => {
        const paiement = { id: doc.id, ...doc.data() } as Paiement
        if (paiement.statut !== 'confirmed') return sum
        if (!isInDateRange(asDateLike(paiement.dateCreation), { startDate: previousStart, endDate: previousEnd })) return sum
        return sum + Number(paiement.montant ?? 0)
      }, 0)
    }
  }

  const commissionRate = Number(nessiaConfigSnap.docs[0]?.data()?.nessiaFees ?? 0)
  const commissionMad = revenueMad * (commissionRate / 100)

  const openIncidents = incidentsSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.status || '').toLowerCase()
    return sum + (status === 'open' ? 1 : 0)
  }, 0)

  const pendingProviders = agencesSnap.docs.reduce((sum, doc) => {
    const raw = doc.data() as Record<string, unknown>
    const status = String(raw.applicationStatus || '').toLowerCase()
    return sum + (status === 'pending' ? 1 : 0)
  }, 0)

  return {
    reservationsConfirmedToday,
    reservationsConfirmedYesterday,
    revenueMad,
    revenuePreviousMad,
    commissionMad,
    commissionRate,
    openIncidents,
    pendingProviders,
  }
}
