import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { auth, authReady, db } from '~/config/firebase'
import type { Agence } from '~/types'
import type {
  SocialContentItem,
  SocialContentModeration,
  SocialContentDateValue,
} from '~/models/social'

const COLLECTION = 'social_contents'

const agenceName = (agence: Agence) => {
  return (
    agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
  )
}

const toStringValue = (value: unknown) => (typeof value === 'string' ? value : '')

const toArrayOfStrings = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
  )
}

const toDateValue = (value: unknown): SocialContentDateValue => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'seconds' in value)
    return value as SocialContentDateValue
  return null
}

const getModeration = (value: unknown): SocialContentModeration => {
  const moderation =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const status = toStringValue(moderation.status) || (moderation.approved ? 'approved' : 'pending')

  return {
    approved: status === 'approved' ? true : Boolean(moderation.approved),
    reason: toStringValue(moderation.reason),
    reviewedAt: toDateValue(moderation.reviewedAt),
    reviewedBy: toStringValue(moderation.reviewedBy),
    status,
  }
}

const getTimestampSeconds = (value: SocialContentDateValue) => {
  if (!value) return 0
  if (value instanceof Date) return Math.floor(value.getTime() / 1000)
  if (typeof value === 'object' && typeof value.seconds === 'number') return value.seconds
  return 0
}

export async function getSocialContents(): Promise<SocialContentItem[]> {
  const [agencesSnap, socialSnap] = await Promise.all([
    getDocs(collection(db, 'agences')),
    getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))),
  ])

  const agenceMap = new Map<string, string>()
  const agenceRouteIdMap = new Map<string, string>()
  for (const agenceDoc of agencesSnap.docs) {
    const agence = { id: agenceDoc.id, ...agenceDoc.data() } as Agence
    const label = agenceName(agence)
    const routeId = agenceDoc.id
    if (agence.id) {
      agenceMap.set(agence.id, label)
      agenceRouteIdMap.set(agence.id, routeId)
    }
    if (agence.uid) {
      agenceMap.set(agence.uid, label)
      agenceRouteIdMap.set(agence.uid, routeId)
    }
    if (agence.agenceRef) {
      agenceMap.set(agence.agenceRef, label)
      agenceRouteIdMap.set(agence.agenceRef, routeId)
    }
  }

  return socialSnap.docs
    .map((itemDoc) => {
      const raw = itemDoc.data() as Record<string, unknown>
      const agenceRef = toStringValue(raw.agenceRef)

      return {
        id: itemDoc.id,
        agenceRef,
        agencyId: agenceRouteIdMap.get(agenceRef) || '',
        agencyName: agenceMap.get(agenceRef) || '—',
        categorie: toStringValue(raw.categorie),
        createdAt: toDateValue(raw.createdAt),
        description: toStringValue(raw.description),
        documentId: toStringValue(raw.documentId) || itemDoc.id,
        documentTitle: toStringValue(raw.documentTitle),
        hashtags: toArrayOfStrings(raw.hashtags),
        moderation: getModeration(raw.moderation),
        publicationStatus: toStringValue(raw.publicationStatus) || 'draft',
        publishedAt: toDateValue(raw.publishedAt),
        status:
          toStringValue(raw.status) ||
          toStringValue((raw.moderation as Record<string, unknown> | undefined)?.status) ||
          'pending',
        thumbnailPath: toStringValue(raw.thumbnailPath),
        thumbnailUrl: toStringValue(raw.thumbnailUrl),
        title: toStringValue(raw.title) || toStringValue(raw.documentTitle) || itemDoc.id,
        updatedAt: toDateValue(raw.updatedAt),
        videoPath: toStringValue(raw.videoPath),
        videoUrl: toStringValue(raw.videoUrl),
        raw: { id: itemDoc.id, ...raw },
      } satisfies SocialContentItem
    })
    .sort((a, b) => getTimestampSeconds(b.createdAt) - getTimestampSeconds(a.createdAt))
}

export async function approveSocialContent(id: string, reason: string): Promise<void> {
  const user = auth.currentUser || (await authReady)

  await updateDoc(doc(db, COLLECTION, id), {
    moderation: {
      approved: true,
      status: 'approved',
      reason: reason.trim(),
      reviewedBy: user?.uid || '',
      reviewedAt: new Date(),
    },
  })
}

export async function rejectSocialContent(id: string, reason: string): Promise<void> {
  const user = auth.currentUser || (await authReady)

  await updateDoc(doc(db, COLLECTION, id), {
    moderation: {
      approved: false,
      status: 'rejected',
      reason: reason.trim(),
      reviewedBy: user?.uid || '',
      reviewedAt: new Date(),
    },
  })
}
