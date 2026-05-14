import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { Agence } from '~/types'

type DateLike = Date | { seconds?: number } | null | undefined

export type PartenaireRow = {
  id: string
  partenaire: string
  categorie: string
  ville: string
  status: string
  listings: number
  reservations: number
  revenueGeneres: number
  commissionsNessia: number
  noteMoyenne: number
  inscritLe: DateLike
  email: string
  avatar?: string
  logo?: string
  currency: string
}

const asDateLike = (value: unknown): DateLike => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return value as { seconds?: number }
  }
  return null
}

const agenceDisplayName = (agence: Partial<Agence>) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

const ratingFromAgence = (agence: Agence) => {
  const stats = agence.stats
  if (stats?.totalReviews && stats.totalReviews > 0) {
    return Number(((stats.ratingSum ?? 0) / stats.totalReviews).toFixed(1))
  }
  return Number(agence.rating ?? stats?.rating ?? 0)
}

export async function getPartenairesTable(): Promise<PartenaireRow[]> {
  const [
    agencesSnap,
    reservationsSnap,
    paiementsSnap,
    activitiesSnap,
    hebergementsSnap,
    vehiculesSnap,
    vtcSnap,
    nessiaConfigSnap,
  ] = await Promise.all([
    getDocs(collection(db, 'agences')),
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'paiements')),
    getDocs(collection(db, 'activities')),
    getDocs(collection(db, 'hebergements')),
    getDocs(collection(db, 'vehicules_annonces')),
    getDocs(collection(db, 'vehicules_vtc_annonces')),
    getDocs(query(collection(db, 'nessiaConfig'), limit(1))),
  ])

  const feeRate = Number(nessiaConfigSnap.docs[0]?.data()?.nessiaFees ?? 0)

  const reservationsByProvider = new Map<string, number>()
  for (const d of reservationsSnap.docs) {
    const data = d.data() as Record<string, unknown>
    const key = String(data.agenceRef || data.agenceId || '')
    if (!key) continue
    reservationsByProvider.set(key, (reservationsByProvider.get(key) || 0) + 1)
  }

  const revenueByProvider = new Map<string, number>()
  for (const d of paiementsSnap.docs) {
    const data = d.data() as Record<string, unknown>
    if (String(data.statut || '') !== 'confirmed') continue
    const key = String(data.agenceRef || '')
    if (!key) continue
    const amount = Number(data.montant || 0)
    revenueByProvider.set(key, (revenueByProvider.get(key) || 0) + amount)
  }

  const listingsByProvider = new Map<string, number>()
  const addListingCount = (snap: { docs: Array<{ data: () => Record<string, unknown> }> }) => {
    for (const d of snap.docs) {
      const data = d.data()
      const key = String(data.agenceRef || data.providerId || data.uid || '')
      if (!key) continue
      listingsByProvider.set(key, (listingsByProvider.get(key) || 0) + 1)
    }
  }

  addListingCount(activitiesSnap)
  addListingCount(hebergementsSnap)
  addListingCount(vehiculesSnap)
  addListingCount(vtcSnap)

  return agencesSnap.docs.map((doc) => {
    const agence = { id: doc.id, ...doc.data() } as Agence & { id: string }
    const keys = [doc.id, agence.uid, agence.agenceRef].filter(Boolean) as string[]

    const reservations = keys.reduce((sum, key) => sum + (reservationsByProvider.get(key) || 0), 0)
    const revenueGeneres = keys.reduce((sum, key) => sum + (revenueByProvider.get(key) || 0), 0)
    const listings = keys.reduce((sum, key) => sum + (listingsByProvider.get(key) || 0), 0)

    return {
      id: doc.id,
      partenaire: agenceDisplayName(agence),
      categorie: (agence.selectedServices || []).join(', ') || '—',
      ville: agence.city || agence.ville || '—',
      status: agence.applicationStatus || '—',
      listings,
      reservations,
      revenueGeneres,
      commissionsNessia: Number((revenueGeneres * (feeRate / 100)).toFixed(2)),
      noteMoyenne: ratingFromAgence(agence),
      inscritLe: asDateLike(agence.createdAt),
      email: agence.email || '—',
      avatar: agence.avatar,
      logo: agence.logo,
      currency: agence.currency || 'MAD',
    } satisfies PartenaireRow
  })
}
