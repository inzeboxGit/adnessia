import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '~/config/firebase'
import { mapReservation, type Reservation } from '~/models/reservations'
import type { Customer, Review, Favorite, Paiement } from '~/types'

const COLLECTION = 'customers'
const BATCH_SIZE = 10

export type CustomerMetrics = {
  reservations: number
  spending: number
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function getCustomers(): Promise<Customer[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer))
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Customer) : null
}

export async function getCustomerByQuery(value: string): Promise<Customer | null> {
  if (!value) return null

  const byId = await getCustomer(value)
  if (byId) return byId

  const snap = await getDocs(query(collection(db, COLLECTION), where('uid', '==', value)))
  const first = snap.docs[0]
  return first ? ({ id: first.id, ...first.data() } as Customer) : null
}

export async function getVerifiedCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COLLECTION), where('isVerified', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer))
}

export async function getCustomerReviews(customerId: string): Promise<Review[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION, customerId, 'reviews'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review))
}

export async function getCustomerFavorites(customerId: string): Promise<Favorite[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION, customerId, 'favorites'), orderBy('addedAt', 'desc')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Favorite))
}

export async function getCustomersCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, COLLECTION))
  return snap.data().count
}

export async function getVerifiedCustomersCount(): Promise<number> {
  const q = query(collection(db, COLLECTION), where('isVerified', '==', true))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function updateCustomerAccountStatus(id: string, accountStatus: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    accountStatus,
  })
}

export async function getCustomerMetrics(customers: Array<Pick<Customer, 'id' | 'uid'>>): Promise<Record<string, CustomerMetrics>> {
  const reservationIds = [...new Set(customers.map((c) => c.uid).filter(Boolean))]
  const paymentIds = [...new Set(customers.map((c) => c.id).filter(Boolean) as string[])]
  const metrics = Object.fromEntries(
    customers.map((c) => [c.uid, { reservations: 0, spending: 0 }]),
  ) as Record<string, CustomerMetrics>

  if (customers.length === 0) return metrics

  const reservationBatches = chunk(reservationIds, BATCH_SIZE)
  const paymentBatches = chunk(paymentIds, BATCH_SIZE)
  const customerIdToUid = new Map(
    customers
      .filter((c): c is Pick<Customer, 'id' | 'uid'> & { id: string } => Boolean(c.id))
      .map((c) => [c.id, c.uid]),
  )

  const [reservationUserSnaps, reservationCustomerSnaps, paiementSnaps] = await Promise.all([
    Promise.all(
      reservationBatches.map((batch) =>
        getDocs(query(collection(db, 'reservations'), where('userId', 'in', batch))),
      ),
    ),
    Promise.all(
      reservationBatches.map((batch) =>
        getDocs(query(collection(db, 'reservations'), where('customerId', 'in', batch))),
      ),
    ),
    Promise.all(
      paymentBatches.map((batch) =>
        getDocs(query(collection(db, 'paiements'), where('clientId', 'in', batch))),
      ),
    ),
  ])

  const countedReservations = new Set<string>()

  for (const snap of [...reservationUserSnaps, ...reservationCustomerSnaps]) {
    for (const doc of snap.docs) {
      if (countedReservations.has(doc.id)) continue

      const data = doc.data()
      const reservationUserId =
        (data.userId as string | undefined) ??
        (data.customerId as string | undefined)

      if (reservationUserId && metrics[reservationUserId]) {
        metrics[reservationUserId].reservations += 1
        countedReservations.add(doc.id)
      }
    }
  }

  for (const snap of paiementSnaps) {
    for (const doc of snap.docs) {
      const paiement = doc.data() as Paiement
      const uid = paiement.clientId ? customerIdToUid.get(paiement.clientId) : undefined
      if (uid && metrics[uid] && paiement.statut === 'confirmed') {
        metrics[uid].spending += Number(paiement.montant ?? 0)
      }
    }
  }

  return metrics
}

export async function getCustomerReservations(customerId: string, userId?: string): Promise<Reservation[]> {
  const [customerSnap, userSnap] = await Promise.all([
    getDocs(query(collection(db, 'reservations'), where('customerId', '==', customerId))),
    userId ? getDocs(query(collection(db, 'reservations'), where('userId', '==', userId))) : Promise.resolve(null),
  ])

  const unique = new Map<string, Reservation>()

  for (const snap of [customerSnap, userSnap].filter(Boolean)) {
    for (const d of snap!.docs) {
      unique.set(d.id, mapReservation({ id: d.id, ...d.data() }))
    }
  }

  const toEpochMs = (value: Reservation['createdAt']) => {
    if (!value) return 0
    if (value instanceof Date) return value.getTime()
    if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
      return value.seconds * 1000
    }
    return 0
  }

  return [...unique.values()].sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt))
}

export async function getCustomerPaiements(customerId: string): Promise<Paiement[]> {
  const snap = await getDocs(query(collection(db, 'paiements'), where('clientId', '==', customerId)))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Paiement))
    .sort((a, b) => (b.dateCreation?.seconds ?? 0) - (a.dateCreation?.seconds ?? 0))
}
