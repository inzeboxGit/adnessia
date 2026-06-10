import type { Timestamp } from 'firebase/firestore'
import type { Paiement } from '~/types'

export type ReservationDateValue =
  | Timestamp
  | Date
  | {
      seconds?: number
      nanoseconds?: number
    }
  | null
  | undefined

export type ReservationType =
  | 'ACTIVITE'
  | 'HEBERGEMENT'
  | 'LOCATION_VOITURE'
  | 'VTC'

export type ReservationStatus =
  | 'pending'
  | 'confirmee'
  | 'annulee'
  | 'refunded'

export interface ReservationBase {
  id?: string
  type: ReservationType
  reference: string
  status: ReservationStatus
  userId: string
  clientId?: string | null
  agenceRef?: string | null
  elementId?: string | null
  elementTitre?: string | null
  ville?: string | null
  devise: string
  montantTotal: number
  montantAvance: number
  montantRestant: number
  paiementComplete: boolean
  createdAt: ReservationDateValue
  updatedAt?: ReservationDateValue
  dateDebut?: ReservationDateValue
  dateFin?: ReservationDateValue
  datePaiement?: ReservationDateValue
  image?: string | null
  note?: number | null
}

export interface ActivityReservation extends ReservationBase {
  type: 'ACTIVITE'
  heure?: string | null
  personnes?: number | null
  items?: Array<{
    date?: ReservationDateValue
    heure?: string
    personnes?: number
    prixParPersonne?: number
    productId?: string
    titre?: string
    total?: number
  }>
  detailsSpecifiques: {
    activite_nom: string
    categorie: string[]
    participants: number
    prix_par_personne: number
    prix_base_total: number
    option_titre?: string
    option_transfert?: boolean
    ville: string
  }
}

export interface HebergementReservation extends ReservationBase {
  type: 'HEBERGEMENT'
  nbJours?: number
  detailsSpecifiques: {
    adultes: number
    enfants: number
    prixNuit?: number
    options?: Record<string, boolean>
    produits?: {
      prixNuit?: number
      [key: string]: unknown
    }
  }
  nbNuits: number
}

export interface CarReservation extends ReservationBase {
  type: 'LOCATION_VOITURE'
  vehiculeRef?: string
  modePaiement?: string
  nbJours?: number
  ville_depart?: string
  ville_retour?: string
  deuxiemeConducteur?: boolean
  options?: string[]
  optionsSelectionnees?: string[]
  optionsExtras?: Record<string, boolean>
  IdDocType?: string | null
  IdDocUrl?: string | null
  LicDocType?: string | null
  LicDocUrl?: string | null
  SecondIdDocType?: string | null
  SecondIdDocUrl?: string | null
  SecondLicDocType?: string | null
  SecondLicDocUrl?: string | null
  conducteur_principal: {
    nom: string
    prenom: string
    email: string
    telephone?: string
  }
  conducteur_secondaire?: {
    nom?: string
    prenom?: string
    email?: string
    telephone?: string
  } | null
  detailsSpecifiques: {
    catalogue_nom: string
    carburant: string
    transmission: string
    prix_journalier: number
    caution: number
    places: number
    portes: number
    ville_depart?: string
    ville_retour?: string
    agence_nom?: string
  }
  documents?: {
    idDocRectoUrl?: string
    idDocRectoType?: string
    idDocUrl?: string
    idDocType?: string
    idDocVersoUrl?: string
    idDocVersoType?: string
    licDocRectoUrl?: string
    licDocRectoType?: string
    licDocUrl?: string
    licDocType?: string
    licDocVersoUrl?: string
    licDocVersoType?: string
  }
  documentsSecondConducteur?: Record<string, unknown> | null
}

export interface VtcReservation extends ReservationBase {
  type: 'VTC'
  origin: {
    address: string
    lat: number
    lng: number
  }
  destination: {
    address: string
    lat: number
    lng: number
    distance?: string
  }
  passengers: number
  estimatedArrival?: ReservationDateValue
  isAllerSimple: boolean
  vehiculeId?: string
  heurePrise?: string
  driverId?: string | null
}

export interface ClientReservationItem {
  id: string
  reference: string
  type: 'ACTIVITE' | 'HEBERGEMENT' | 'LOCATION_VOITURE' | 'VTC'
  elementTitre: string
  status: string
  ville?: string
  montantTotal: number
  devise: string
  dateDebut?: ReservationDateValue
  dateFin?: ReservationDateValue
  createdAt: ReservationDateValue
  image?: string | null
}

export interface ClientReservationDetailItem extends ClientReservationItem {
  payments: Paiement[]
  confirmedPayments: Paiement[]
  paidAmount: number
  remainingAmount: number
}

export type Reservation =
  | ActivityReservation
  | HebergementReservation
  | CarReservation
  | VtcReservation
