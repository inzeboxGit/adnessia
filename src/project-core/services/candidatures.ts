import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { PrestataireCandidature } from '~/types'

const COLLECTION = 'candidatures_prestataires'

const toDate = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value

  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }

    if ('seconds' in value && typeof (value as { seconds?: unknown }).seconds === 'number') {
      return new Date((value as { seconds: number }).seconds * 1000)
    }
  }

  return null
}

export async function getCandidaturesPrestataires(status?: string): Promise<PrestataireCandidature[]> {
  const snap = await getDocs(collection(db, COLLECTION))

  const candidatures = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as PrestataireCandidature[]

  const normalizedStatus = status?.trim().toLowerCase()

  const filtered = normalizedStatus
    ? candidatures.filter((item) => String(item.status || '').toLowerCase() === normalizedStatus)
    : candidatures

  return filtered.sort((a, b) => {
    const aDate = toDate(a.createdAt)?.getTime() || 0
    const bDate = toDate(b.createdAt)?.getTime() || 0
    return bDate - aDate
  })
}

export async function getCandidaturePrestataire(id: string): Promise<PrestataireCandidature | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))

  if (!snap.exists()) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as PrestataireCandidature
}
