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
  image?: string | null
  note?: number | null
}

export interface ActivityReservation extends ReservationBase {
  type: 'ACTIVITE'
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
  detailsSpecifiques: {
    adultes: number
    enfants: number
    prixNuit: number
    produits: Record<string, unknown>
  }
  nbNuits: number
}

export interface CarReservation extends ReservationBase {
  type: 'LOCATION_VOITURE'
  vehiculeRef?: string
  modePaiement?: string
  conducteur_principal: {
    nom: string
    prenom: string
    email: string
    telephone?: string
  }
  detailsSpecifiques: {
    catalogue_nom: string
    carburant: string
    transmission: string
    prix_journalier: number
    caution: number
    places: number
    portes: number
  }
  documents?: {
    idDocUrl?: string
    licDocUrl?: string
  }
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
  }
  passengers: number
  estimatedArrival?: ReservationDateValue
  isAllerSimple: boolean
  vehiculeId?: string
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
