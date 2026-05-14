import type {
  ClientReservationDetailItem,
  ActivityReservation,
  CarReservation,
  ClientReservationItem,
  HebergementReservation,
  Reservation,
  ReservationStatus,
  ReservationType,
  VtcReservation,
} from './reservation.types'
import type { Paiement } from '~/types'

type RawReservation = Record<string, unknown>

function normalizeReservationType(type: unknown): ReservationType {
  switch (String(type || '').toUpperCase()) {
    case 'ACTIVITE':
      return 'ACTIVITE'
    case 'HEBERGEMENT':
      return 'HEBERGEMENT'
    case 'LOCATION_VOITURE':
      return 'LOCATION_VOITURE'
    case 'VTC':
      return 'VTC'
    default:
      throw new Error('Unknown reservation type')
  }
}

function normalizeReservationStatus(status: unknown): ReservationStatus {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return 'pending'
    case 'confirmee':
    case 'confirmed':
      return 'confirmee'
    case 'annulee':
    case 'cancelled':
      return 'annulee'
    case 'refunded':
      return 'refunded'
    default:
      return 'pending'
  }
}

export function mapReservation(data: RawReservation): Reservation {
  const type = normalizeReservationType(data.type)
  const normalized = {
    ...data,
    type,
    status: normalizeReservationStatus(data.status),
  }

  switch (type) {
    case 'ACTIVITE':
      return normalized as ActivityReservation
    case 'HEBERGEMENT':
      return normalized as HebergementReservation
    case 'LOCATION_VOITURE':
      return normalized as CarReservation
    case 'VTC':
      return normalized as VtcReservation
  }
}

export function toClientReservationItem(reservation: Reservation): ClientReservationItem {
  const fallbackTitleByType: Record<ReservationType, string> = {
    ACTIVITE: reservation.type === 'ACTIVITE' ? reservation.detailsSpecifiques?.activite_nom : 'Activite',
    HEBERGEMENT: 'Hebergement',
    LOCATION_VOITURE: reservation.type === 'LOCATION_VOITURE' ? reservation.detailsSpecifiques?.catalogue_nom : 'Location voiture',
    VTC: 'Trajet VTC',
  }

  const fallbackCity =
    reservation.ville ||
    (reservation.type === 'ACTIVITE' ? reservation.detailsSpecifiques?.ville : undefined) ||
    undefined

  return {
    id: reservation.id || '',
    reference: reservation.reference || '',
    type: reservation.type,
    elementTitre: reservation.elementTitre || fallbackTitleByType[reservation.type] || 'Reservation',
    status: reservation.status,
    ville: fallbackCity,
    montantTotal: Number(reservation.montantTotal ?? 0),
    devise: reservation.devise || 'MAD',
    dateDebut: reservation.dateDebut,
    dateFin: reservation.dateFin,
    createdAt: reservation.createdAt,
    image: reservation.image || null,
  }
}

export function toClientReservationDetailItem(
  reservation: Reservation,
  payments: Paiement[],
): ClientReservationDetailItem {
  const item = toClientReservationItem(reservation)
  const reservationPayments = payments.filter((payment) => payment.reservationId === reservation.id)
  const confirmedPayments = reservationPayments.filter((payment) => payment.statut === 'confirmed')
  const paidAmount = confirmedPayments.reduce((sum, payment) => sum + Number(payment.montant ?? 0), 0)

  return {
    ...item,
    payments: reservationPayments,
    confirmedPayments,
    paidAmount,
    remainingAmount: Math.max(0, Number(item.montantTotal ?? 0) - paidAmount),
  }
}
