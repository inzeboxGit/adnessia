import type { Timestamp } from 'firebase/firestore'

export type PartnerListingCategory =
  | 'ACTIVITE'
  | 'HEBERGEMENT'
  | 'LOCATION_VOITURE'
  | 'VTC'

export type PartnerListingDateValue = Timestamp | Date | { seconds?: number; nanoseconds?: number } | null | undefined

export type PartnerListingStatus = 'active' | 'inactive' | 'draft' | 'rejected' | 'trashed' | string

export type PartnerListingModeration = {
  approved: boolean
  status?: string
  reason: string
  reviewedBy: string
  reviewedAt: PartnerListingDateValue
}

export type ActivityListing = {
  id?: string
  acomptePourcentage?: number
  agenceRef?: string
  categorie?: string[]
  createdAt?: PartnerListingDateValue
  description?: string
  devise?: string
  images?: string[]
  mainImage?: string
  moderation?: Partial<PartnerListingModeration>
  nombreAvis?: number
  noteMoyenne?: number
  prixParPersonne?: number
  rejectedReason?: string
  slug?: string
  signaled?: boolean
  sponsorise?: boolean
  statut?: PartnerListingStatus
  titre?: string
  type?: string
  ville?: string
}

export type PartnerListingListItem = {
  id: string
  approved: boolean
  category: PartnerListingCategory
  title: string
  providerId: string
  providerName: string
  incidentId: string
  city: string
  image: string | null
  price: number | null
  currency: string
  moderation: PartnerListingModeration
  rejectedReason: string
  signaled: boolean
  status: PartnerListingStatus
  sponsored: boolean
  createdAt: PartnerListingDateValue
  raw: Record<string, unknown>
}
