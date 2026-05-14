import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { auth, authReady, db } from '~/config/firebase'

export type SupportTicketStatus = 'open' | 'pending_user' | 'answered' | 'closed' | string
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent' | string

export type SupportTicketDateValue = Date | { seconds?: number; nanoseconds?: number } | null | undefined

export type SupportTicketItem = {
  id: string
  ticketNumber: string
  userId: string | null
  providerId: string | null
  role: 'client' | 'provider' | string
  subject: string
  category: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  assignedAdminId: string | null
  reservationId: string | null
  lastMessageAt: SupportTicketDateValue
  lastMessageBy: string
  createdAt: SupportTicketDateValue
  updatedAt: SupportTicketDateValue
  closedAt: SupportTicketDateValue
  unreadByAdmin: boolean
  unreadByUser: boolean
}

export async function getSupportTickets(): Promise<SupportTicketItem[]> {
  const snap = await getDocs(query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc')))

  return snap.docs.map((d) => {
    const raw = d.data() as Record<string, unknown>

    return {
      id: d.id,
      ticketNumber: String(raw.ticketNumber || d.id),
      userId: raw.userId ? String(raw.userId) : null,
      providerId: raw.providerId ? String(raw.providerId) : null,
      role: String(raw.role || 'client'),
      subject: String(raw.subject || '—'),
      category: String(raw.category || 'general'),
      status: String(raw.status || 'open'),
      priority: String(raw.priority || 'normal'),
      assignedAdminId: raw.assignedAdminId ? String(raw.assignedAdminId) : null,
      reservationId: raw.reservationId ? String(raw.reservationId) : null,
      lastMessageAt: (raw.lastMessageAt as SupportTicketDateValue) || null,
      lastMessageBy: String(raw.lastMessageBy || ''),
      createdAt: (raw.createdAt as SupportTicketDateValue) || null,
      updatedAt: (raw.updatedAt as SupportTicketDateValue) || null,
      closedAt: (raw.closedAt as SupportTicketDateValue) || null,
      unreadByAdmin: Boolean(raw.unreadByAdmin),
      unreadByUser: Boolean(raw.unreadByUser),
    } satisfies SupportTicketItem
  })
}

export async function replySupportTicket(ticketId: string, message: string): Promise<void> {
  const trimmed = message.trim()
  if (!trimmed) return

  const user = auth.currentUser || await authReady
  const now = new Date()

  await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
    message: trimmed,
    senderRole: 'admin',
    senderId: user?.uid || '',
    createdAt: now,
    type: 'text',
  })

  await updateDoc(doc(db, 'supportTickets', ticketId), {
    lastMessageAt: now,
    lastMessageBy: 'admin',
    unreadByUser: true,
    unreadByAdmin: false,
    updatedAt: now,
    status: 'answered',
  })
}
