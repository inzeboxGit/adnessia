import type { Timestamp } from 'firebase/firestore'

export type SocialContentDateValue =
  | Timestamp
  | Date
  | { seconds?: number; nanoseconds?: number }
  | null
  | undefined

export type SocialContentModerationStatus = 'approved' | 'pending' | 'rejected' | 'trashed' | string

export type SocialContentPublicationStatus = 'published' | 'draft' | 'scheduled' | 'archived' | string

export type SocialContentModeration = {
  approved: boolean
  reason: string
  reviewedAt: SocialContentDateValue
  reviewedBy: string
  status: SocialContentModerationStatus
}

export type SocialContentItem = {
  id: string
  agenceRef: string
  agencyId: string
  agencyName: string
  categorie: string
  createdAt: SocialContentDateValue
  description: string
  documentId: string
  documentTitle: string
  hashtags: string[]
  moderation: SocialContentModeration
  publicationStatus: SocialContentPublicationStatus
  publishedAt: SocialContentDateValue
  status: string
  thumbnailPath: string
  thumbnailUrl: string
  title: string
  updatedAt: SocialContentDateValue
  videoPath: string
  videoUrl: string
  raw: Record<string, unknown>
}
