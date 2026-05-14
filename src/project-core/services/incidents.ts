import { collection, doc, getDocs, updateDoc, type DocumentData, type UpdateData } from 'firebase/firestore'
import { db } from '~/config/firebase'
import { mapReservation, type Reservation } from '~/models/reservations'
import type {
  Agence,
  Customer,
  Incident,
  IncidentDisputeStatus,
  IncidentStatus,
} from '~/types'

export type IncidentListItem = {
  adminResponse: string
  adminResponseUpdatedAt: Incident['adminResponseUpdatedAt'] | Date | null
  id: string
  inReviewAt: Incident['inReviewAt'] | Date | null
  listingId: string
  listingTitle: string
  reservationId: string
  reservationTitle: string
  reservation: Reservation | null
  rejectedAt: Incident['rejectedAt'] | Date | null
  resolvedAt: Incident['resolvedAt'] | Date | null
  clientId: string
  clientName: string
  providerId: string
  providerName: string
  status: IncidentStatus
  disputeStatus: IncidentDisputeStatus
  reason: string
  description: string
  proofUrl: string
  type: string
  createdAt: Incident['createdAt'] | Date | null
}

const customerName = (customer: Customer) => {
  return customer.name || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—'
}

const agenceName = (agence: Agence) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

export async function getIncidents(): Promise<IncidentListItem[]> {
  const [incidentsSnap, reservationsSnap, customersSnap, agencesSnap] = await Promise.all([
    getDocs(collection(db, 'incidents')),
    getDocs(collection(db, 'reservations')),
    getDocs(collection(db, 'customers')),
    getDocs(collection(db, 'agences')),
  ])

  const reservationMap = new Map<string, Reservation>()
  for (const reservationDoc of reservationsSnap.docs) {
    reservationMap.set(reservationDoc.id, mapReservation({ id: reservationDoc.id, ...reservationDoc.data() }))
  }

  const customerMap = new Map<string, string>()
  for (const customerDoc of customersSnap.docs) {
    const customer = { id: customerDoc.id, ...customerDoc.data() } as Customer
    const label = customerName(customer)
    if (customer.id) customerMap.set(customer.id, label)
    if (customer.uid) customerMap.set(customer.uid, label)
  }

  const providerMap = new Map<string, string>()
  for (const agenceDoc of agencesSnap.docs) {
    const agence = { id: agenceDoc.id, ...agenceDoc.data() } as Agence
    const label = agenceName(agence)
    if (agence.id) providerMap.set(agence.id, label)
    if (agence.uid) providerMap.set(agence.uid, label)
    if (agence.agenceRef) providerMap.set(agence.agenceRef, label)
  }

  return incidentsSnap.docs
    .map((incidentDoc) => {
      const incident = { id: incidentDoc.id, ...incidentDoc.data() } as Incident
      const reservationId = incident.reservationId || ''
      const clientId = incident.clientId || ''
      const providerId = incident.providerId || ''
      const reservation = reservationMap.get(reservationId) || null

      return {
        id: incidentDoc.id,
        reservationId,
        reservationTitle: reservation?.elementTitre || reservation?.reference || reservationId,
        reservation,
        listingId: incident.listingId || '',
        listingTitle: incident.listingTitle || '',
        clientId,
        clientName: customerMap.get(clientId) || '—',
        providerId,
        providerName: providerMap.get(providerId) || '—',
        adminResponse: incident.adminResponse || '',
        adminResponseUpdatedAt: incident.adminResponseUpdatedAt,
        inReviewAt: incident.inReviewAt,
        rejectedAt: incident.rejectedAt,
        resolvedAt: incident.resolvedAt,
        status: incident.status || 'open',
        disputeStatus: incident.disputeStatus || 'none',
        reason: incident.reason || '—',
        description: incident.description || '',
        proofUrl: incident.proofUrl || '',
        type: incident.type || '—',
        createdAt: incident.createdAt,
      } satisfies IncidentListItem
    })
    .sort((a, b) => {
      const toSeconds = (value: IncidentListItem['createdAt']) => {
        if (!value) return 0
        if (value instanceof Date) return Math.floor(value.getTime() / 1000)
        return typeof value.seconds === 'number' ? value.seconds : 0
      }

      return toSeconds(b.createdAt) - toSeconds(a.createdAt)
    })
}

export async function getIncidentById(id: string): Promise<IncidentListItem | null> {
  const incidents = await getIncidents()
  return incidents.find((incident) => incident.id === id) || null
}

export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<void> {
  if (!id) throw new Error('Incident id is required')
  const now = new Date()
  const payload: UpdateData<DocumentData> = { status }

  if (status === 'in_review')
    payload.inReviewAt = now

  if (status === 'resolved')
    payload.resolvedAt = now

  if (status === 'rejected')
    payload.rejectedAt = now

  await updateDoc(doc(db, 'incidents', id), payload)
}

export async function updateIncidentDisputeStatus(id: string, disputeStatus: IncidentDisputeStatus): Promise<void> {
  if (!id) throw new Error('Incident id is required')
  await updateDoc(doc(db, 'incidents', id), { disputeStatus })
}

export async function updateIncidentAdminResponse(
  id: string,
  adminResponse: string,
  adminResponseUpdatedAt: Date,
): Promise<void> {
  if (!id) throw new Error('Incident id is required')
  await updateDoc(doc(db, 'incidents', id), {
    adminResponse,
    adminResponseUpdatedAt,
    status: 'in_review',
    inReviewAt: adminResponseUpdatedAt,
  })
}
