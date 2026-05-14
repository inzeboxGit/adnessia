import { collection, doc, documentId, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '~/config/firebase'
import { mapReservation, type Reservation, type ReservationStatus, type ReservationType } from '~/models/reservations'
import type { Agence, Customer, Paiement } from '~/types'

export type CentralizedReservationItem = {
  id: string
  title: string
  category: ReservationType
  providerId: string
  providerName: string
  clientId: string
  clientName: string
  city: string
  amount: number
  currency: string
  date: Reservation['dateDebut']
  status: ReservationStatus
  raw: Reservation
}

export type CentralizedReservationStats = {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  providers: number
}

const agenceName = (agence: Agence) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

const customerName = (customer: Customer) => {
  return customer.name || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—'
}

const asNonEmptyString = (value: unknown): string | null => {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

const dateValueToSeconds = (value: Reservation['dateDebut']): number => {
  if (!value) return 0
  if (value instanceof Date) return Math.floor(value.getTime() / 1000)
  if ('seconds' in value && typeof value.seconds === 'number') return value.seconds
  return 0
}

export async function getCentralizedReservations(): Promise<CentralizedReservationItem[]> {
  const [reservationsSnap, agencesSnap, customersSnap, paiementsSnap] = await Promise.all([
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'agences')),
    getDocs(collection(db, 'customers')),
    getDocs(collection(db, 'paiements')),
  ])

  const agences = agencesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Agence))
  const customers = customersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer & Record<string, unknown>))
  const paiements = paiementsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Paiement))

  const agenceMap = new Map<string, string>()
  for (const agence of agences) {
    if (agence.id) agenceMap.set(agence.id, agenceName(agence))
    if (agence.agenceRef) agenceMap.set(agence.agenceRef, agenceName(agence))
    if (agence.uid) agenceMap.set(agence.uid, agenceName(agence))
  }

  const customerMap = new Map<string, string>()
  for (const customer of customers) {
    const displayName = customerName(customer)
    const candidateKeys = [
      customer.id,
      customer.uid,
      asNonEmptyString(customer.clientId),
      asNonEmptyString(customer.customerId),
      asNonEmptyString(customer.userId),
    ].filter((value): value is string => Boolean(value))

    for (const key of candidateKeys) {
      customerMap.set(key, displayName)
    }
  }

  const paymentClientNameByReservationId = new Map<string, string>()
  const paymentClientNameByClientId = new Map<string, string>()
  for (const paiement of paiements) {
    const paymentClientName = asNonEmptyString(paiement.metadata?.nomClient)
    if (!paymentClientName) continue

    const reservationKey = asNonEmptyString(paiement.reservationId)
    const paymentClientKey = asNonEmptyString(paiement.clientId) || asNonEmptyString(paiement.metadata?.customerId)

    if (reservationKey && !paymentClientNameByReservationId.has(reservationKey)) {
      paymentClientNameByReservationId.set(reservationKey, paymentClientName)
    }

    if (paymentClientKey && !paymentClientNameByClientId.has(paymentClientKey)) {
      paymentClientNameByClientId.set(paymentClientKey, paymentClientName)
    }
  }

  return reservationsSnap.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>
      const reservation = mapReservation({ id: doc.id, ...data })
      const providerKey = String(reservation.agenceRef || data.agenceId || '')
      const clientKey = String(
        data.clientId
        || data.customerId
        || data.userId
        || reservation.userId
        || '',
      )
      const rawClientName =
        asNonEmptyString(data.clientName)
        || asNonEmptyString(data.nomClient)
        || asNonEmptyString(data.customerName)
        || asNonEmptyString(data.userName)
      const resolvedClientName =
        customerMap.get(clientKey)
        || paymentClientNameByReservationId.get(doc.id)
        || paymentClientNameByClientId.get(clientKey)
        || rawClientName
        || '—'

      return {
        id: doc.id,
        title: reservation.elementTitre || reservation.reference || 'Réservation',
        category: reservation.type,
        providerId: providerKey,
        providerName: agenceMap.get(providerKey) || '—',
        clientId: clientKey,
        clientName: resolvedClientName,
        city: reservation.ville || '—',
        amount: Number(reservation.montantTotal ?? 0),
        currency: reservation.devise || 'MAD',
        date: reservation.dateDebut || reservation.createdAt,
        status: reservation.status,
        raw: reservation,
      } satisfies CentralizedReservationItem
    })
    .sort((a, b) => dateValueToSeconds(b.date) - dateValueToSeconds(a.date))
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  if (!id) throw new Error('Reservation id is required')
  await updateDoc(doc(db, 'reservations', id), { status })
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  if (!id) return null
  const snap = await getDoc(doc(db, 'reservations', id))
  if (!snap.exists()) return null
  return mapReservation({ id: snap.id, ...snap.data() })
}

export async function getReservationsByIds(ids: string[]): Promise<Map<string, Reservation>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const reservations = new Map<string, Reservation>()

  if (uniqueIds.length === 0) return reservations

  for (let index = 0; index < uniqueIds.length; index += 10) {
    const batch = uniqueIds.slice(index, index + 10)
    const snap = await getDocs(query(collection(db, 'reservations'), where(documentId(), 'in', batch)))

    for (const item of snap.docs) {
      reservations.set(item.id, mapReservation({ id: item.id, ...item.data() }))
    }
  }

  return reservations
}

function normalizeVtcImage(image?: string | null): string | null {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `https://nessia.ma/vtc/${String(image).replace(/^\/+/, '')}`
}

export async function getReservationElementImage(reservation: Reservation): Promise<string | null> {
  if (reservation.image) return reservation.image

  switch (reservation.type) {
    case 'ACTIVITE': {
      if (!reservation.elementId) return null
      const snap = await getDoc(doc(db, 'activities', reservation.elementId))
      if (!snap.exists()) return null
      return (snap.data().mainImage as string | undefined) || null
    }
    case 'HEBERGEMENT': {
      if (!reservation.elementId) return null
      const snap = await getDoc(doc(db, 'hebergements', reservation.elementId))
      if (!snap.exists()) return null
      return (snap.data().imageUrl as string | undefined) || null
    }
    case 'LOCATION_VOITURE': {
      if (!reservation.elementId) return null
      const snap = await getDoc(doc(db, 'vehicules_annonces', reservation.elementId))
      if (!snap.exists()) return null
      return (snap.data().image as string | undefined) || null
    }
    case 'VTC': {
      if (!reservation.vehiculeId) return null
      const snap = await getDoc(doc(db, 'vehicules_vtc_annonces', reservation.vehiculeId))
      if (!snap.exists()) return null
      return normalizeVtcImage((snap.data().image as string | undefined) || null)
    }
  }
}

export function getCentralizedReservationStats(items: CentralizedReservationItem[]): CentralizedReservationStats {
  return {
    total: items.length,
    confirmed: items.filter((item) => item.status === 'confirmee').length,
    pending: items.filter((item) => item.status === 'pending').length,
    cancelled: items.filter((item) => item.status === 'annulee' || item.status === 'refunded').length,
    providers: new Set(items.map((item) => item.providerName).filter((name) => name && name !== '—')).size,
  }
}
