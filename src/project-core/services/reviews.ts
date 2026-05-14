import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { Agence, Customer, Review } from '~/types'

export type ReviewStats = {
  count: number
  avgNote: number
}

export type CustomerReviewListItem = {
  id: string
  category: 'Activité' | 'Hébergement' | 'Location de voiture' | 'VTC'
  sourceTitle: string
  comment: string
  rating: number
  userId: string
  userName: string
  approved: boolean
  createdAt: Review['createdAt'] | Date | null
  customerId: string
  path: string
}

const REVIEW_SOURCE_LABELS = {
  activities: 'Activité',
  hebergements: 'Hébergement',
  vehicules_annonces: 'Location de voiture',
  vehicules_vtc_annonces: 'VTC',
} as const

type ReviewSourceCollection = keyof typeof REVIEW_SOURCE_LABELS

function isSupportedReviewSource(value: string): value is ReviewSourceCollection {
  return value in REVIEW_SOURCE_LABELS
}

function resolveSourceTitle(sourceCollection: ReviewSourceCollection, data: Record<string, unknown>, fallbackId: string) {
  if (sourceCollection === 'activities') {
    return String(data.titre || data.title || data.nom || fallbackId)
  }

  if (sourceCollection === 'hebergements') {
    return String(data.title || data.titre || data.nom || fallbackId)
  }

  if (sourceCollection === 'vehicules_annonces') {
    return String(data.title || data.titre || data.nom || data.modele || fallbackId)
  }

  return String(data.title || data.titre || data.nom || data.modele || fallbackId)
}

async function getReviewsBySourceCollection(sourceCollection: ReviewSourceCollection) {
  console.log(`[reviews] getAllCustomerReviews → loading parents from ${sourceCollection}`)
  const parentsSnap = await getDocs(collection(db, sourceCollection))
  console.log(`[reviews] getAllCustomerReviews → ${sourceCollection} parents count:`, parentsSnap.docs.length)

  const reviewSnaps = await Promise.all(
    parentsSnap.docs.map((parentDoc) => getDocs(collection(db, sourceCollection, parentDoc.id, 'reviews'))),
  )

  const docs = reviewSnaps.flatMap((snap) => snap.docs)
  console.log(`[reviews] getAllCustomerReviews → ${sourceCollection} reviews count:`, docs.length)

  return docs.map((reviewDoc) => ({
    reviewDoc,
    sourceCollection,
    sourceId: reviewDoc.ref.parent.parent?.id || '',
    parentData: reviewDoc.ref.parent.parent?.parent ? parentsSnap.docs.find((doc) => doc.id === reviewDoc.ref.parent.parent?.id)?.data() ?? {} : {},
  }))
}

/**
 * Customer review stats are aggregated from stats.totalReviews + stats.ratingSum
 * on each customer document — same approach as agences, avoids subcollection reads.
 */
export async function getCustomerReviewsStats(): Promise<ReviewStats> {
  const snap = await getDocs(collection(db, 'customers'))
  let totalReviews = 0
  let ratingSum = 0

  for (const d of snap.docs) {
    const stats = (d.data() as Customer).stats
    if (stats) {
      totalReviews += stats.totalReviews ?? 0
      ratingSum += stats.ratingSum ?? 0
    }
  }

  const avgNote = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0
  return { count: totalReviews, avgNote }
}

/**
 * Agence review stats are computed from the 'stats' field on each agence doc
 * (ratingSum / totalReviews) — avoids reading every review subcollection.
 */
export async function getAgenceReviewsStats(): Promise<ReviewStats> {
  const snap = await getDocs(collection(db, 'agences'))
  let totalReviews = 0
  let ratingSum = 0

  for (const d of snap.docs) {
    const stats = (d.data() as Agence).stats
    if (stats) {
      totalReviews += stats.totalReviews ?? 0
      ratingSum += stats.ratingSum ?? 0
    }
  }

  const avgNote = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0
  return { count: totalReviews, avgNote }
}

export async function getAllCustomerReviews(): Promise<CustomerReviewListItem[]> {
  console.log('[reviews] getAllCustomerReviews → sources: activities, hebergements, vehicules_annonces, vehicules_vtc_annonces')
  const [reviewEntries, customersSnap] = await Promise.all([
    Promise.all([
      getReviewsBySourceCollection('activities'),
      getReviewsBySourceCollection('hebergements'),
      getReviewsBySourceCollection('vehicules_annonces'),
      getReviewsBySourceCollection('vehicules_vtc_annonces'),
    ]).then((entries) => entries.flat()),
    getDocs(collection(db, 'customers')),
  ])
  console.log('[reviews] getAllCustomerReviews → raw reviews count:', reviewEntries.length)
  console.log('[reviews] getAllCustomerReviews → customers count:', customersSnap.docs.length)

  const customerMap = new Map<string, string>()
  for (const doc of customersSnap.docs) {
    const customer = { id: doc.id, ...doc.data() } as Customer
    const displayName = customer.name || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
    if (customer.id) customerMap.set(customer.id, displayName)
    if (customer.uid) customerMap.set(customer.uid, displayName)
  }

  const items = reviewEntries
    .filter((item) => isSupportedReviewSource(item.sourceCollection))
    .map(({ reviewDoc, sourceCollection, sourceId, parentData }) => {
      const raw = reviewDoc.data() as Partial<Review> & { customerId?: string }
      const customerId = String(raw.customerId || raw.userId || '')
      const userId = String(raw.userId || '')
      const createdAt = raw.createdAt || null
      const userName = raw.userName
        || customerMap.get(customerId)
        || customerMap.get(userId)
        || '—'

      return {
        id: reviewDoc.id,
        category: REVIEW_SOURCE_LABELS[sourceCollection],
        sourceTitle: resolveSourceTitle(sourceCollection, parentData, sourceId || reviewDoc.id),
        comment: String(raw.comment || ''),
        rating: Number(raw.rating ?? 0),
        userId,
        userName,
        approved: Boolean(raw.approved),
        createdAt,
        customerId,
        path: reviewDoc.ref.path,
      } satisfies CustomerReviewListItem
    })
    .sort((a, b) => {
      const toSeconds = (value: CustomerReviewListItem['createdAt']) => {
        if (!value) return 0
        if (value instanceof Date) return Math.floor(value.getTime() / 1000)
        return typeof value.seconds === 'number' ? value.seconds : 0
      }

      return toSeconds(b.createdAt) - toSeconds(a.createdAt)
    })

  console.log('[reviews] getAllCustomerReviews → filtered customer reviews count:', items.length)
  console.log('[reviews] getAllCustomerReviews → results:', items)

  return items
}

export async function deleteCustomerReview(path: string): Promise<void> {
  if (!path) throw new Error('Review path is required')

  console.log('[reviews] deleteCustomerReview → path:', path)
  await deleteDoc(doc(db, path))
}

export async function updateCustomerReviewApproval(path: string, approved: boolean): Promise<void> {
  if (!path) throw new Error('Review path is required')

  console.log('[reviews] updateCustomerReviewApproval → path:', path, 'approved:', approved)
  await updateDoc(doc(db, path), { approved })
}
