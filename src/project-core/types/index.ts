import type { Timestamp } from 'firebase/firestore'

export type SuperAdminPermissions = {
  usersBan: boolean
  providersEdit: boolean
  payoutsManage: boolean
}

export type SuperAdmin = {
  id?: string
  role: 'superadmin' | 'admin' | 'staff'
  email: string
  displayName: string
  active: boolean
  permissions: SuperAdminPermissions
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
}

export type PaiementStatut =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'expired'

export type PaiementMetadata = {
  customerId: string
  elementNom: string
  nomClient: string
  typeCategorie: string
  ville: string
}

export type Paiement = {
  id?: string
  agenceRef?: string
  clientId: string
  dateCreation: Timestamp
  description: string
  devise: string
  elementId: string
  metadata: PaiementMetadata
  methodePaiement: string
  montant: number
  reference: string
  reservationId: string
  statut: PaiementStatut
}

export type SponsorCampaignPayment = {
  id: string
  reference: string
  status: PaiementStatut
}

export type SponsorCampaignPerformance = {
  clicks: number
  reservations: number
  views: number
}

export type SponsorCampaignPricing = {
  amount: number
  currency: string
}

export type SponsorCampaignPublication = {
  category: string
  categoryLabel: string
  city: string
  collection: 'activities' | 'hebergements' | 'vehicules_annonces' | 'vehicules_vtc_annonces' | string
  id: string
  title: string
}

export type SponsorCampaignAgency = {
  id: string
}

export type SponsorCampaignStatus = 'active' | 'paused' | 'completed' | 'cancelled' | string

export type SponsorCampaign = {
  id?: string
  agency: SponsorCampaignAgency
  createdAt: Timestamp
  durationDays: number
  endAt: Timestamp
  pausedAt?: Timestamp
  payment: SponsorCampaignPayment
  performance: SponsorCampaignPerformance
  pricing: SponsorCampaignPricing
  publication: SponsorCampaignPublication
  remainingMs: number
  resumedAt?: Timestamp
  startAt: Timestamp
  status: SponsorCampaignStatus
  updatedAt: Timestamp
}

// ---- Dashboard revenue types ----

export type RevenueTotal = {
  montant: number
  devise: string
  count: number
}

export type RevenueByPeriod = {
  today: number
  thisWeek: number
  thisMonth: number
  thisYear: number
}

export type RevenueByKey = {
  key: string
  montant: number
  count: number
}

export type DashboardRevenue = {
  totals: RevenueTotal[]
  byPeriod: RevenueByPeriod
  byMethode: RevenueByKey[]
  byCategorie: RevenueByKey[]
  byVille: RevenueByKey[]
  countByStatut: Record<PaiementStatut, number>
  recentPaiements: Paiement[]
}

export type VariantType = 'primary' | 'danger' | 'warning' | 'success' | 'info' | 'dark' | 'secondary' | 'purple' | 'light'

// ---- Review (reusable: agences/*/reviews & customers/*/reviews) ----

export type Review = {
  id?: string
  approved: boolean
  bookingId: string
  comment: string
  createdAt: Timestamp
  rating: number
  userId: string
  userName: string
}

export type IncidentStatus = 'open' | 'in_review' | 'resolved' | 'rejected' | string

export type IncidentDisputeStatus = 'none' | 'approved' | 'rejected' | 'partial' | string

export type IncidentType = 'SERVICE_ISSUE' | string

export type Incident = {
  id?: string
  adminResponse?: string
  adminResponseUpdatedAt?: Timestamp
  clientId: string
  createdAt: Timestamp
  description: string
  disputeStatus: IncidentDisputeStatus
  inReviewAt?: Timestamp
  listingId?: string
  listingTitle?: string
  proofUrl?: string
  providerId: string
  reason: string
  rejectedAt?: Timestamp
  reservationId?: string
  resolvedAt?: Timestamp
  status: IncidentStatus
  type: IncidentType
}

// ---- Favorite (reusable: agences/*/favorites & customers/*/favorites) ----

export type Favorite = {
  id: string
  addedAt: Timestamp
  description: string
  mainImage: string
  noteMoyenne: number
  prixParPersonne: number
  titre: string
  type: string
  ville: string
}

// ---- Agence ----
export type AgenceDocument = {
  id: string
  name: string
  path: string
  size: number
  type: string
  uploadedAt: Timestamp
  url: string
}

//agences documents (identity, company, rib) are stored in a subcollection 'documents' with doc ids 'identity', 'company', 'rib' — this type represents the structure of each document
export type AgenceDocuments = {
  company?: AgenceDocument
  identity?: AgenceDocument
  rib?: AgenceDocument
}

// stats customers / agences (used for both, with 'sourceCollection' field to distinguish)
export type UserStats = {
  cancellationRate: number
  lastUpdated: Timestamp
  positiveCount: number
  positiveRate: number
  rating: number
  ratingSum: number
  totalReviews: number
}

// ---- Customer ----
export type Customer = {
  id?: string
  accountStatus?: boolean | 'active' | 'pending' | 'suspended'
  address: string
  city: string
  createdAt: Timestamp
  currency: string
  email: string
  firstName: string
  gender: string
  ios: boolean
  isOnline: boolean
  isVerified: boolean
  language: string
  lastLogin: Timestamp
  lastName: string
  lastSeen: number
  name: string
  phone: string
  profileComplete: boolean
  stats?: UserStats
  uid: string
}

// interface Agences
export type Agence = {
  id?: string
  adresse: string
  age_minimum_agence: number
  agenceRef: string
  annulation: string
  applicationStatus: 'pending' | 'approved' | 'rejected' | 'suspended'
  avatar: string
  caution: number
  cautionType: string
  city: string
  createdAt: Timestamp
  currency: string
  documents: AgenceDocuments
  email: string
  firstName: string
  gender: string
  hostStatus: string
  inVacation: boolean
  isOnline: boolean
  isProvider: boolean
  isVerified: boolean
  language: string
  lastLogin: Timestamp
  lastName: string
  lastSeen: number
  logo: string
  name: string
  // Info : champ nom is used for display agence name
  nom: string
  profileComplete: boolean
  rating: number
  selectedServices: string[]
  serviceDescription: string
  serviceOptions: string[]
  serviceZones: string
  skipOnboarding: boolean
  skipOnboardingDate: Timestamp
  stats: UserStats
  telephone: string
  uid: string
  updatedAt: Timestamp
  ville: string
  website: string
  whatsapp: string
}

// ---- Menu Item ---- (used for sidebar and other menus)
export type MenuItemType = {
  slug: string
  label: string
  isTitle?: boolean
  icon?: string
  url?: string
  badge?: {
    className: string
    text: string
  }
  target?: string
  isDisabled?: boolean
  isSpecial?: boolean
  children?: MenuItemType[]
}

export type PrestataireCandidatureStatus =
  | 'new'
  | 'pending'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | string

export type PrestataireCandidature = {
  id?: string
  anciennete?: string
  autresPlateformes?: boolean
  capacite?: string | number
  consentement?: boolean
  createdAt?: Timestamp
  description?: string
  email?: string
  entreprise?: string
  motivation?: string
  nom?: string
  plateformesDetails?: string
  prenom?: string
  services?: string[]
  source?: string
  status?: PrestataireCandidatureStatus
  telephone?: string
  ville?: string
  zones?: string[]
}
