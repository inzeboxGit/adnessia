import {
  collection,
//   collectionGroup,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  updateDoc,
  where,
  orderBy,
//   limit,
} from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { Agence, Review, Favorite, Paiement } from '~/types'
import { mapReservation, type Reservation } from '~/models/reservations'

const COLLECTION = 'agences'
const BATCH_SIZE = 10

export type AgenceMetrics = {
  reservations: number
  revenue: number
}

function reservationCreatedAtSeconds(value: Reservation['createdAt']): number {
  if (!value) return 0
  if (value instanceof Date) return Math.floor(value.getTime() / 1000)
  if ('seconds' in value && typeof value.seconds === 'number') return value.seconds
  return 0
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function getAgences(): Promise<Agence[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Agence))
}

export async function getAgence(id: string): Promise<Agence | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Agence) : null
}

export async function getAgencesByStatus(status: Agence['applicationStatus']): Promise<Agence[]> {
  const q = query(collection(db, COLLECTION), where('applicationStatus', '==', status))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Agence))
}

export async function getAgenceReviews(agenceId: string): Promise<Review[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION, agenceId, 'reviews'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review))
}

export async function getAgenceFavorites(agenceId: string): Promise<Favorite[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION, agenceId, 'favorites'), orderBy('addedAt', 'desc')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Favorite))
}

export async function getAgencesCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, COLLECTION))
  return snap.data().count
}

export async function getPendingAgencesCount(): Promise<number> {
  const q = query(collection(db, COLLECTION), where('applicationStatus', '==', 'pending'))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function updateAgenceStatus(id: string, status: Agence['applicationStatus']): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    applicationStatus: status,
  })
}

// This function calculates the number of reservations and total revenue for a list of agences. It first retrieves all reservations for the given agences, then fetches the related paiements to calculate the total revenue based on confirmed paiements.
export async function getAgenceMetrics(agences: Array<Pick<Agence, 'id' | 'agenceRef'>>): Promise<Record<string, AgenceMetrics>> {
  const agenceKeys = [...new Set(
    agences.flatMap((agence) => [agence.id, agence.agenceRef]).filter(Boolean) as string[],
  )]
  const metrics = Object.fromEntries(
    agences
      .filter((agence): agence is Pick<Agence, 'id' | 'agenceRef'> & { id: string } => Boolean(agence.id))
      .map((agence) => [agence.id, { reservations: 0, revenue: 0 }]),
  ) as Record<string, AgenceMetrics>

  if (agenceKeys.length === 0) return metrics

  const keyToAgenceId = new Map(
    agences
      .filter((agence): agence is Pick<Agence, 'id' | 'agenceRef'> & { id: string } => Boolean(agence.id))
      .flatMap((agence) => [
        [agence.id, agence.id] as const,
        [agence.agenceRef, agence.id] as const,
      ])
      .filter(([key]) => Boolean(key)),
  )

  const reservationSnaps = await Promise.all(
    chunk(agenceKeys, BATCH_SIZE).map((batch) =>
      getDocs(query(collection(db, 'reservations'), where('agenceRef', 'in', batch))),
    ),
  )

  const reservationsByAgenceId = new Map<string, Reservation[]>()
  const seenReservationIds = new Set<string>()

  for (const snap of reservationSnaps) {
    for (const d of snap.docs) {
      if (seenReservationIds.has(d.id)) continue
      const reservation = mapReservation({ id: d.id, ...d.data() })
      const agenceId = reservation.agenceRef ? keyToAgenceId.get(reservation.agenceRef) : undefined
      if (!agenceId) continue

      const items = reservationsByAgenceId.get(agenceId) ?? []
      items.push(reservation)
      reservationsByAgenceId.set(agenceId, items)
      seenReservationIds.add(d.id)
    }
  }

  for (const [agenceId, reservations] of reservationsByAgenceId.entries()) {
    if (metrics[agenceId]) {
      metrics[agenceId].reservations = reservations.length
    }
  }

  const paiementSnaps = await Promise.all(
    chunk(agenceKeys, BATCH_SIZE).map((batch) =>
      getDocs(query(collection(db, 'paiements'), where('agenceRef', 'in', batch))),
    ),
  )

  for (const snap of paiementSnaps) {
    for (const d of snap.docs) {
      const paiement = d.data() as { statut?: string; montant?: number; agenceRef?: string }
      if (paiement.statut !== 'confirmed' || !paiement.agenceRef) continue
      const agenceId = keyToAgenceId.get(paiement.agenceRef)
      if (agenceId && metrics[agenceId]) {
        metrics[agenceId].revenue += Number(paiement.montant ?? 0)
      }
    }
  }

  for (const [agenceId, reservations] of reservationsByAgenceId.entries()) {
    if (!metrics[agenceId] || metrics[agenceId].revenue > 0) continue
    metrics[agenceId].revenue = reservations.reduce(
      (sum, reservation) => sum + Number(reservation.montantTotal ?? 0),
      0,
    )
  }

  return metrics
}

export async function getAgenceReservations(agence: Pick<Agence, 'id' | 'agenceRef'>): Promise<Reservation[]> {
  const keys = [...new Set([agence.id, agence.agenceRef].filter(Boolean) as string[])]
  if (keys.length === 0) return []

  const snaps = await Promise.all(
    chunk(keys, BATCH_SIZE).map((batch) =>
      getDocs(query(collection(db, 'reservations'), where('agenceRef', 'in', batch))),
    ),
  )

  const unique = new Map<string, Reservation>()
  for (const snap of snaps) {
    for (const d of snap.docs) {
      unique.set(d.id, mapReservation({ id: d.id, ...d.data() }))
    }
  }

  return [...unique.values()].sort(
    (a, b) => reservationCreatedAtSeconds(b.createdAt) - reservationCreatedAtSeconds(a.createdAt),
  )
}

export async function getAgencePaiements(agence: Pick<Agence, 'id' | 'agenceRef'>): Promise<Paiement[]> {
  const keys = [...new Set([agence.id, agence.agenceRef].filter(Boolean) as string[])]
  if (keys.length === 0) return []

  const snaps = await Promise.all(
    chunk(keys, BATCH_SIZE).map((batch) =>
      getDocs(query(collection(db, 'paiements'), where('agenceRef', 'in', batch))),
    ),
  )

  const unique = new Map<string, Paiement>()
  for (const snap of snaps) {
    for (const d of snap.docs) {
      unique.set(d.id, { id: d.id, ...d.data() } as Paiement)
    }
  }

  return [...unique.values()].sort((a, b) => (b.dateCreation?.seconds ?? 0) - (a.dateCreation?.seconds ?? 0))
}
