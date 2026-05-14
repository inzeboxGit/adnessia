import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { auth, authReady, db } from '~/config/firebase'
import type { Agence } from '~/types'
import type {
  ActivityListing,
  PartnerListingCategory,
  PartnerListingListItem,
  PartnerListingModeration,
} from '~/models/listings'

const agenceName = (agence: Agence) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

const CATEGORY_META: Array<{
  category: PartnerListingCategory
  collection: 'activities' | 'hebergements' | 'vehicules_annonces' | 'vehicules_vtc_annonces'
}> = [
  { category: 'ACTIVITE', collection: 'activities' },
  { category: 'HEBERGEMENT', collection: 'hebergements' },
  { category: 'LOCATION_VOITURE', collection: 'vehicules_annonces' },
  { category: 'VTC', collection: 'vehicules_vtc_annonces' },
]

function getListingTitle(category: PartnerListingCategory, data: Record<string, unknown>, id: string) {
  if (category === 'ACTIVITE') return String(data.titre || data.title || id)
  return String(data.title || data.titre || data.nom || data.modele || id)
}

function getListingImage(category: PartnerListingCategory, data: Record<string, unknown>) {
  if (category === 'ACTIVITE') return String(data.mainImage || (Array.isArray(data.images) ? data.images[0] : '') || '') || null
  if (category === 'HEBERGEMENT') return String(data.imageUrl || (Array.isArray(data.images) ? data.images[0] : '') || '') || null
  if (category === 'LOCATION_VOITURE') return String(data.image || (Array.isArray(data.images) ? data.images[0] : '') || '') || null

  const image = String(data.image || (Array.isArray(data.images) ? data.images[0] : '') || '')
  if (!image) return null
  return /^https?:\/\//i.test(image) ? image : `https://nessia.ma/vtc/${image.replace(/^\/+/, '')}`
}

function getListingPrice(category: PartnerListingCategory, data: Record<string, unknown>) {
  if (category === 'ACTIVITE') return Number(data.prixParPersonne ?? 0)
  if (typeof data.prix === 'number') return Number(data.prix)
  if (typeof data.prixParJour === 'number') return Number(data.prixParJour)
  if (typeof data.prixNuit === 'number') return Number(data.prixNuit)
  return null
}

function getListingModeration(data: Record<string, unknown>): PartnerListingModeration {
  const moderation = (data.moderation as Partial<PartnerListingModeration> | undefined) || {}
  const moderationStatus = typeof moderation.status === 'string' && moderation.status.trim()
    ? moderation.status.trim()
    : (moderation.approved ? 'approved' : 'pending')

  return {
    approved: moderationStatus === 'approved' ? true : Boolean(moderation.approved),
    status: moderationStatus,
    reason: String(moderation.reason || ''),
    reviewedBy: String(moderation.reviewedBy || ''),
    reviewedAt: moderation.reviewedAt,
  }
}

function getProviderInfo(raw: Record<string, unknown>, agenceMap: Map<string, string>) {
  const providerId = String(raw.agenceRef || raw.agenceId || raw.providerId || raw.uid || '')
  const explicitName = String(raw.agenceNom || raw.providerName || '').trim()
  const providerName = explicitName || (providerId ? agenceMap.get(providerId) || '—' : '—')

  return { providerId, providerName }
}

export async function getPartnerListings(): Promise<PartnerListingListItem[]> {
  const [agencesSnap, incidentsSnap, ...listingSnaps] = await Promise.all([
    getDocs(collection(db, 'agences')),
    getDocs(collection(db, 'incidents')),
    ...CATEGORY_META.map((entry) => getDocs(collection(db, entry.collection))),
  ])

  const agenceMap = new Map<string, string>()
  for (const agenceDoc of agencesSnap.docs) {
    const agence = { id: agenceDoc.id, ...agenceDoc.data() } as Agence
    const label = agenceName(agence)
    if (agence.id) agenceMap.set(agence.id, label)
    if (agence.uid) agenceMap.set(agence.uid, label)
    if (agence.agenceRef) agenceMap.set(agence.agenceRef, label)
  }

  const incidentByListingId = new Map<string, string>()
  for (const incidentDoc of incidentsSnap.docs) {
    const data = incidentDoc.data() as { listingId?: string }
    if (data.listingId && !incidentByListingId.has(data.listingId)) {
      incidentByListingId.set(data.listingId, incidentDoc.id)
    }
  }

  return listingSnaps.flatMap((snap, index) => {
    const meta = CATEGORY_META[index]!

    return snap.docs.map((doc) => {
      const raw = { id: doc.id, ...doc.data() } as ActivityListing & Record<string, unknown>
      const { providerId, providerName } = getProviderInfo(raw, agenceMap)
      const moderation = getListingModeration(raw)

      return {
        id: doc.id,
        approved: moderation.approved,
        category: meta.category,
        title: getListingTitle(meta.category, raw, doc.id),
        providerId,
        providerName,
        incidentId: incidentByListingId.get(doc.id) || '',
        city: String(raw.ville || raw.city || '—'),
        image: getListingImage(meta.category, raw),
        price: getListingPrice(meta.category, raw),
        currency: String(raw.devise || raw.currency || 'MAD'),
        moderation,
        rejectedReason: moderation.reason,
        signaled: Boolean(raw.signaled),
        status: String(raw.status || 'inactive'),
        sponsored: Boolean(raw.sponsorise || raw.sponsored),
        createdAt: raw.createdAt,
        raw,
      } satisfies PartnerListingListItem
    })
  }).sort((a, b) => ((b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0) - ((a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0))
}

const CATEGORY_COLLECTION_MAP: Record<PartnerListingCategory, 'activities' | 'hebergements' | 'vehicules_annonces' | 'vehicules_vtc_annonces'> = {
  ACTIVITE: 'activities',
  HEBERGEMENT: 'hebergements',
  LOCATION_VOITURE: 'vehicules_annonces',
  VTC: 'vehicules_vtc_annonces',
}

export async function approvePartnerListing(category: PartnerListingCategory, id: string): Promise<void> {
  const collectionName = CATEGORY_COLLECTION_MAP[category]
  const user = auth.currentUser || await authReady
  await updateDoc(doc(db, collectionName, id), {
    moderation: {
      approved: true,
      status: 'approved',
      reason: '',
      reviewedBy: user?.uid || '',
      reviewedAt: new Date(),
    },
    status: 'active',
  })
}

export async function rejectPartnerListing(category: PartnerListingCategory, id: string, rejectedReason: string): Promise<void> {
  const collectionName = CATEGORY_COLLECTION_MAP[category]
  const user = auth.currentUser || await authReady
  await updateDoc(doc(db, collectionName, id), {
    moderation: {
      approved: false,
      status: 'rejected',
      reason: rejectedReason,
      reviewedBy: user?.uid || '',
      reviewedAt: new Date(),
    },
    status: 'rejected',
  })
}

export async function trashPartnerListing(category: PartnerListingCategory, id: string, reason: string): Promise<void> {
  const collectionName = CATEGORY_COLLECTION_MAP[category]
  const user = auth.currentUser || await authReady
  await updateDoc(doc(db, collectionName, id), {
    moderation: {
      approved: false,
      status: 'trashed',
      reason,
      reviewedBy: user?.uid || '',
      reviewedAt: new Date(),
    },
    status: 'trashed',
  })
}

export async function getListingById(category: PartnerListingCategory, id: string): Promise<PartnerListingListItem | null> {
  const collectionName = CATEGORY_COLLECTION_MAP[category]
  const snap = await getDoc(doc(db, collectionName, id))
  if (!snap.exists()) return null

  const raw = { id: snap.id, ...snap.data() } as ActivityListing & Record<string, unknown>
  const providerId = String(raw.agenceRef || raw.agenceId || raw.providerId || raw.uid || '')
  const providerName = String(raw.agenceNom || raw.providerName || '').trim() || '—'
  const moderation = getListingModeration(raw)

  return {
    id: snap.id,
    approved: moderation.approved,
    category,
    title: getListingTitle(category, raw, snap.id),
    providerId,
    providerName,
    incidentId: '',
    city: String(raw.ville || raw.city || '—'),
    image: getListingImage(category, raw),
    price: getListingPrice(category, raw),
    currency: String(raw.devise || raw.currency || 'MAD'),
    moderation,
    rejectedReason: moderation.reason,
    signaled: Boolean(raw.signaled),
    status: String(raw.status || 'inactive'),
    sponsored: Boolean(raw.sponsorise || raw.sponsored),
    createdAt: raw.createdAt,
    raw,
  }
}
