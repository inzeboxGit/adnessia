import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  // getAggregateFromServer,
  getDoc,
  // sum,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '~/config/firebase'
import type {
  Agence,
  Paiement,
  PaiementStatut,
  SponsorCampaign,
  DashboardRevenue,
  RevenueByPeriod,
  RevenueByKey,
  RevenueTotal,
} from '~/types'

const COLLECTION = 'paiements'
const CONFIRMED_STATUT: PaiementStatut = 'confirmed'

// ─── helpers ────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function startOfWeek(d: Date): Date {
  const day = d.getDay() // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  return startOfDay(new Date(d.setDate(diff)))
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0)
}

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
  montantFn: (item: T) => number,
): RevenueByKey[] {
  const map = new Map<string, { montant: number; count: number }>()
  for (const item of items) {
    const k = keyFn(item)
    const existing = map.get(k) ?? { montant: 0, count: 0 }
    map.set(k, { montant: existing.montant + montantFn(item), count: existing.count + 1 })
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.montant - a.montant)
}

function safeTimestampSeconds(value?: Timestamp | null): number {
  return value?.seconds ?? 0
}

function getEvolution(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function netAmountAfterNessiaFees(amount: number, nessiaFeesRate: number): { net: number; fees: number } {
  const gross = Number(amount || 0)
  const fees = round2(gross * (nessiaFeesRate / 100))
  const net = round2(gross - fees)
  return { net, fees }
}

export type PaiementListStats = {
  total: { value: number; change: number }
  confirmed: { value: number; change: number }
  commission: { value: number; change: number; currency: string; rate: number }
  refunded: { value: number; change: number }
  confirmedAmount: { value: number; change: number; currency: string }
}

export type PaiementListPeriod = 'day' | 'week' | 'month'

export type PaiementListResponse = {
  items: Paiement[]
  stats: PaiementListStats
}

export type ProviderPayoutStatus = 'En attente' | 'Prêt'

export type ProviderPayoutItem = {
  id: string
  providerKey: string
  providerName: string
  providerCity: string
  periodKey: string
  periodLabel: string
  reservations: number
  amount: number
  grossAmount: number
  feesAmount: number
  feesRate: number
  currency: string
  status: ProviderPayoutStatus
}

export type PartnerPayoutTransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type PartnerPayoutTransaction = {
  id: string
  providerKey: string
  providerName: string
  providerCity: string
  payoutItemIds: string[]
  reservations: number
  baseAmount: number
  feeRate: number
  feeAmount: number
  netAmountPaid: number
  currency: string
  status: PartnerPayoutTransactionStatus
  reference?: string
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreatePartnerPayoutTransactionInput = {
  providerKey: string
  providerName: string
  providerCity: string
  payoutItemIds: string[]
  reservations: number
  baseAmount: number
  feeRate: number
  feeAmount: number
  netAmountPaid: number
  currency: string
  reference?: string
  notes?: string
}

export type PartnerPayoutAnomalyType = 'duplicate-reference' | 'duplicate-payout-item' | 'net-incoherent'

export type PartnerPayoutAnomaly = {
  type: PartnerPayoutAnomalyType
  severity: 'warning' | 'critical'
  transactionId: string
  message: string
}

export type SponsoringStats = {
  totalAmount: number
  totalCampaigns: number
  activeCampaigns: number
  pausedCampaigns: number
}

export type SalesAnalyticsPeriod = '7d' | '30d' | '90d'

export type SalesAnalyticsStatusFilter = 'all' | 'confirmed' | 'paid' | 'refunded' | 'failed'

export type DailyPaymentAnalyticsPoint = {
  dateKey: string
  label: string
  amount: number
  count: number
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all confirmed payments.
 */
export async function getConfirmedPaiements(): Promise<Paiement[]> {
  const q = query(
    collection(db, COLLECTION),
    where('statut', '==', CONFIRMED_STATUT),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))
}

function getPeriodBounds(period: PaiementListPeriod, now: Date) {
  switch (period) {
    case 'day': {
      const currentStart = startOfDay(new Date(now))
      const currentEnd = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
      const previousStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
      return { currentStart, currentEnd, previousStart, previousEnd: currentStart }
    }
    case 'week': {
      const currentStart = startOfWeek(new Date(now))
      const currentEnd = new Date(currentStart)
      currentEnd.setDate(currentEnd.getDate() + 7)
      const previousStart = new Date(currentStart)
      previousStart.setDate(previousStart.getDate() - 7)
      return { currentStart, currentEnd, previousStart, previousEnd: currentStart }
    }
    case 'month':
    default: {
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return { currentStart, currentEnd, previousStart, previousEnd: currentStart }
    }
  }
}

export async function getPaiementListData(period: PaiementListPeriod = 'month'): Promise<PaiementListResponse> {
  const [snap, configSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), orderBy('dateCreation', 'desc'))),
    getDocs(query(collection(db, 'nessiaConfig'), limit(1))),
  ])
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))
  const nessiaFees = Number(configSnap.docs[0]?.data()?.nessiaFees ?? 0)

  const now = new Date()
  const {
    currentStart: currentPeriodStart,
    currentEnd: currentPeriodEnd,
    previousStart: previousPeriodStart,
    previousEnd: previousPeriodEnd,
  } = getPeriodBounds(period, now)

  const inRange = (item: Paiement, start: Date, end: Date) => {
    const seconds = safeTimestampSeconds(item.dateCreation)
    if (!seconds) return false
    const value = new Date(seconds * 1000)
    return value >= start && value < end
  }

  const currentItems = items.filter((item) => inRange(item, currentPeriodStart, currentPeriodEnd))
  const previousItems = items.filter((item) => inRange(item, previousPeriodStart, previousPeriodEnd))

  const countByStatus = (list: Paiement[], status: PaiementStatut) => list.filter((item) => item.statut === status).length
  const amountConfirmed = (list: Paiement[]) =>
    list
      .filter((item) => item.statut === CONFIRMED_STATUT)
      .reduce((sum, item) => sum + Number(item.montant ?? 0), 0)
  const commissionFromAmount = (amount: number) => amount * (nessiaFees / 100)

  const primaryCurrency = items[0]?.devise || 'MAD'
  const currentConfirmedAmount = amountConfirmed(currentItems)
  const previousConfirmedAmount = amountConfirmed(previousItems)
  const totalConfirmedAmount = amountConfirmed(items)

  return {
    items,
    stats: {
      total: {
        value: items.length,
        change: getEvolution(currentItems.length, previousItems.length),
      },
      confirmed: {
        value: countByStatus(items, 'confirmed'),
        change: getEvolution(countByStatus(currentItems, 'confirmed'), countByStatus(previousItems, 'confirmed')),
      },
      commission: {
        value: commissionFromAmount(totalConfirmedAmount),
        change: getEvolution(commissionFromAmount(currentConfirmedAmount), commissionFromAmount(previousConfirmedAmount)),
        currency: primaryCurrency,
        rate: nessiaFees,
      },
      refunded: {
        value: countByStatus(items, 'refunded') + countByStatus(items, 'partially_refunded'),
        change: getEvolution(
          countByStatus(currentItems, 'refunded') + countByStatus(currentItems, 'partially_refunded'),
          countByStatus(previousItems, 'refunded') + countByStatus(previousItems, 'partially_refunded'),
        ),
      },
      confirmedAmount: {
        value: totalConfirmedAmount,
        change: getEvolution(currentConfirmedAmount, previousConfirmedAmount),
        currency: primaryCurrency,
      },
    },
  }
}

const agenceName = (agence: Agence) => {
  return agence.nom || agence.name || `${agence.firstName ?? ''} ${agence.lastName ?? ''}`.trim() || '—'
}

export async function getProviderPayouts(): Promise<ProviderPayoutItem[]> {
  const [paiementsSnap, agencesSnap, configSnap, txSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), orderBy('dateCreation', 'desc'))),
    getDocs(collection(db, 'agences')),
    getDocs(query(collection(db, 'nessiaConfig'), limit(1))),
    getDocs(query(collection(db, 'partner_payout_transactions'), orderBy('createdAt', 'desc'))),
  ])

  const paiements = paiementsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement & { agenceRef?: string }))
  const agences = agencesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Agence))
  const nessiaFees = Number(configSnap.docs[0]?.data()?.nessiaFees ?? 0)
  const alreadyProcessedPayoutIds = new Set<string>()
  for (const txDoc of txSnap.docs) {
    const data = txDoc.data() as {
      status?: PartnerPayoutTransactionStatus
      payoutItemIds?: unknown
    }
    const status = data.status
    const ids = Array.isArray(data.payoutItemIds) ? data.payoutItemIds : []
    if (status !== 'pending' && status !== 'paid') continue
    for (const id of ids) {
      if (typeof id === 'string' && id) alreadyProcessedPayoutIds.add(id)
    }
  }

  const now = new Date()
  const currentPeriodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const agenceMap = new Map<string, { name: string; city: string }>()
  for (const agence of agences) {
    const value = { name: agence.nom || agenceName(agence), city: agence.ville || agence.city || '—' }
    if (agence.id) agenceMap.set(agence.id, value)
    if (agence.agenceRef) agenceMap.set(agence.agenceRef, value)
    if (agence.uid) agenceMap.set(agence.uid, value)
  }

  const groups = new Map<string, {
    providerKey: string
    providerName: string
    providerCity: string
    periodKey: string
    periodLabel: string
    reservations: Set<string>
    amount: number
    grossAmount: number
    feesAmount: number
    feesRate: number
    currency: string
    status: ProviderPayoutStatus
  }>()

  for (const paiement of paiements) {
    if (paiement.statut !== CONFIRMED_STATUT || !paiement.agenceRef || !paiement.dateCreation?.seconds) continue

    const date = new Date(paiement.dateCreation.seconds * 1000)
    const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const periodLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
    const currency = paiement.devise || 'MAD'
    const providerKey = paiement.agenceRef
    const provider = agenceMap.get(providerKey)
    const providerName = provider?.name || '—'
    const providerCity = provider?.city || '—'
    const groupKey = `${providerKey}::${periodKey}::${currency}`
    if (alreadyProcessedPayoutIds.has(groupKey)) continue

    const existing = groups.get(groupKey) ?? {
      providerKey,
      providerName,
      providerCity,
      periodKey,
      periodLabel,
      reservations: new Set<string>(),
      amount: 0,
      grossAmount: 0,
      feesAmount: 0,
      feesRate: nessiaFees,
      currency,
      status: periodKey === currentPeriodKey ? 'En attente' : 'Prêt',
    }

    if (paiement.reservationId) existing.reservations.add(paiement.reservationId)
    const gross = Number(paiement.montant ?? 0)
    const { net, fees } = netAmountAfterNessiaFees(gross, nessiaFees)
    existing.amount += net
    existing.grossAmount += gross
    existing.feesAmount += fees
    groups.set(groupKey, existing)
  }

  return Array.from(groups.entries())
    .map(([id, item]) => ({
      id,
      providerKey: item.providerKey,
      providerName: item.providerName,
      providerCity: item.providerCity,
      periodKey: item.periodKey,
      periodLabel: item.periodLabel,
      reservations: item.reservations.size,
      amount: round2(item.amount),
      grossAmount: round2(item.grossAmount),
      feesAmount: round2(item.feesAmount),
      feesRate: item.feesRate,
      currency: item.currency,
      status: item.status,
    }))
    .sort((a, b) => b.periodKey.localeCompare(a.periodKey) || a.providerName.localeCompare(b.providerName))
}

// This function creates a payout transaction for a provider, which will be processed later by the finance team.
export async function createPartnerPayoutTransaction(input: CreatePartnerPayoutTransactionInput): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(collection(db, 'partner_payout_transactions'), {
    providerKey: input.providerKey,
    providerName: input.providerName,
    providerCity: input.providerCity,
    payoutItemIds: input.payoutItemIds,
    reservations: input.reservations,
    baseAmount: round2(input.baseAmount),
    feeRate: input.feeRate,
    feeAmount: round2(input.feeAmount),
    netAmountPaid: round2(input.netAmountPaid),
    currency: input.currency,
    status: 'pending' as PartnerPayoutTransactionStatus,
    reference: input.reference ?? '',
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

// This function updates the status of a payout transaction to 'paid' and adds the payment reference. It should be called after the finance team has processed the payout.
export async function getPartnerPayoutTransactions(): Promise<PartnerPayoutTransaction[]> {
  const snap = await getDocs(query(collection(db, 'partner_payout_transactions'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => {
    const data = d.data() as Omit<PartnerPayoutTransaction, 'id'>
    return { id: d.id, ...data }
  })
}

// This function updates the status of a payout transaction to 'paid' and adds the payment reference. It should be called after the finance team has processed the payout.
export async function confirmPartnerPayoutTransaction(id: string, reference: string): Promise<void> {
  const txId = id.trim()
  const txRef = reference.trim()
  if (!txId) throw new Error('Transaction invalide')
  if (!txRef) throw new Error('Numéro de transaction requis')

  await updateDoc(doc(db, 'partner_payout_transactions', txId), {
    status: 'paid' as PartnerPayoutTransactionStatus,
    reference: txRef,
    updatedAt: Timestamp.now(),
  })
}

export async function runPartnerPayoutAutoReconciliation(): Promise<{ updated: number }> {
  const snap = await getDocs(query(collection(db, 'partner_payout_transactions'), orderBy('createdAt', 'desc')))
  let updated = 0
  const now = Timestamp.now()

  for (const d of snap.docs) {
    const data = d.data() as { status?: PartnerPayoutTransactionStatus; reference?: string }
    const status = data.status
    const reference = String(data.reference ?? '').trim()
    if (status !== 'pending' || !reference) continue

    await updateDoc(doc(db, 'partner_payout_transactions', d.id), {
      status: 'paid' as PartnerPayoutTransactionStatus,
      updatedAt: now,
    })
    updated += 1
  }

  return { updated }
}

export function detectPartnerPayoutAnomalies(transactions: PartnerPayoutTransaction[]): PartnerPayoutAnomaly[] {
  const anomalies: PartnerPayoutAnomaly[] = []
  const refMap = new Map<string, string[]>()
  const payoutItemMap = new Map<string, string[]>()

  for (const tx of transactions) {
    const reference = String(tx.reference ?? '').trim()
    if (reference) {
      const list = refMap.get(reference) ?? []
      list.push(tx.id)
      refMap.set(reference, list)
    }

    for (const payoutItemId of tx.payoutItemIds ?? []) {
      const list = payoutItemMap.get(payoutItemId) ?? []
      list.push(tx.id)
      payoutItemMap.set(payoutItemId, list)
    }

    const expectedFees = round2(Number(tx.baseAmount ?? 0) * (Number(tx.feeRate ?? 0) / 100))
    const expectedNet = round2(Number(tx.baseAmount ?? 0) - expectedFees)
    const actualNet = round2(Number(tx.netAmountPaid ?? 0))
    if (Math.abs(expectedNet - actualNet) > 1) {
      anomalies.push({
        type: 'net-incoherent',
        severity: 'critical',
        transactionId: tx.id,
        message: `Net incohérent: attendu ${expectedNet}, enregistré ${actualNet}.`,
      })
    }
  }

  for (const [reference, ids] of refMap.entries()) {
    if (ids.length <= 1) continue
    for (const id of ids) {
      anomalies.push({
        type: 'duplicate-reference',
        severity: 'critical',
        transactionId: id,
        message: `Référence dupliquée (${reference}) sur ${ids.length} transactions.`,
      })
    }
  }

  for (const [payoutItemId, ids] of payoutItemMap.entries()) {
    if (ids.length <= 1) continue
    for (const id of ids) {
      anomalies.push({
        type: 'duplicate-payout-item',
        severity: 'warning',
        transactionId: id,
        message: `Payout déjà utilisé (${payoutItemId}) dans ${ids.length} transactions.`,
      })
    }
  }

  return anomalies
}

// This function retrieves a payout transaction by its ID or reference. It is useful for checking the status of a payout after it has been processed.
export async function getPaiementById(id: string): Promise<Paiement | null> {
  if (!id) return null
  console.log('[paiements] getPaiementById → id:', id)
  const snap = await getDoc(doc(db, COLLECTION, id))
  console.log('[paiements] getPaiementById → exists:', snap.exists())
  if (!snap.exists()) return null
  const paiement = { id: snap.id, ...snap.data() } as Paiement
  console.log('[paiements] getPaiementById → result:', paiement)
  return paiement
}

// This function retrieves a payment by its reference number. It is useful for checking the status of a payment after it has been processed, especially when the document ID is not known. Note that references are not guaranteed to be unique, so this function returns the first match found.
export async function getPaiementByReference(reference: string): Promise<Paiement | null> {
  if (!reference) return null
  console.log('[paiements] getPaiementByReference → reference:', reference)
  const snap = await getDocs(query(collection(db, COLLECTION), where('reference', '==', reference), limit(1)))
  const first = snap.docs[0]
  console.log('[paiements] getPaiementByReference → matches:', snap.docs.length)
  if (!first) return null
  const paiement = { id: first.id, ...first.data() } as Paiement
  console.log('[paiements] getPaiementByReference → result:', paiement)
  return paiement
}

// This function tries to resolve a payment either by its document ID or by its reference number. It is useful for checking the status of a payment after it has been processed, when the input query could be either the ID or the reference.
export async function getPaiementDetailsByQuery(value: string): Promise<Paiement | null> {
  if (!value) return null
  console.log('[paiements] getPaiementDetailsByQuery → query:', value)
  const byId = await getPaiementById(value)
  if (byId) {
    console.log('[paiements] getPaiementDetailsByQuery → resolved by document id')
    return byId
  }
  console.log('[paiements] getPaiementDetailsByQuery → fallback to reference lookup')
  const byReference = await getPaiementByReference(value)
  console.log('[paiements] getPaiementDetailsByQuery → final result:', byReference)
  return byReference
}

/**
 * Full dashboard revenue report (confirmed payments only).
 */
export async function getDashboardRevenue(): Promise<DashboardRevenue> {
  const now = new Date()

  // Fetch confirmed + all statuses in parallel
  const [confirmedSnap, allSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), where('statut', '==', CONFIRMED_STATUT))),
    getDocs(collection(db, COLLECTION)),
  ])

  const confirmed = confirmedSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))
  const all = allSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))

  // ── totals by devise ─────────────────────────────────────────────────────
  const deviseMap = new Map<string, { montant: number; count: number }>()
  for (const p of confirmed) {
    const existing = deviseMap.get(p.devise) ?? { montant: 0, count: 0 }
    deviseMap.set(p.devise, { montant: existing.montant + p.montant, count: existing.count + 1 })
  }
  const totals: RevenueTotal[] = Array.from(deviseMap.entries()).map(([devise, v]) => ({
    devise,
    montant: v.montant,
    count: v.count,
  }))

  console.log('Dashboard revenue - totals by devise:', totals)
  console.log(`→ all docs: ${all.length}, confirmed docs: ${confirmed.length}`)
  if (all.length > 0) {
    const statuts = [...new Set(all.map((p) => p.statut))]
    console.log('→ statuts trouvés en Firestore:', statuts)
  }

  // ── by period (primary devise = first, or MAD fallback) ──────────────────
  const todayStart = Timestamp.fromDate(startOfDay(new Date(now)))
  const weekStart = Timestamp.fromDate(startOfWeek(new Date(now)))
  const monthStart = Timestamp.fromDate(startOfMonth(new Date(now)))
  const yearStart = Timestamp.fromDate(startOfYear(new Date(now)))

  const sum = (items: Paiement[], from: Timestamp): number =>
    items
      .filter((p) => p.dateCreation.seconds >= from.seconds)
      .reduce((acc, p) => acc + p.montant, 0)

  const byPeriod: RevenueByPeriod = {
    today: sum(confirmed, todayStart),
    thisWeek: sum(confirmed, weekStart),
    thisMonth: sum(confirmed, monthStart),
    thisYear: sum(confirmed, yearStart),
  }

  // ── breakdown axes ────────────────────────────────────────────────────────
  const byMethode = groupBy(
    confirmed,
    (p) => p.methodePaiement || 'Non renseignee',
    (p) => Number(p.montant ?? 0),
  )
  const byCategorie = groupBy(
    confirmed,
    (p) => p.metadata?.typeCategorie || 'Non renseignee',
    (p) => Number(p.montant ?? 0),
  )
  const byVille = groupBy(
    confirmed,
    (p) => p.metadata?.ville || 'Non renseignee',
    (p) => Number(p.montant ?? 0),
  )

  // ── count per statut ──────────────────────────────────────────────────────
  const statutKeys: PaiementStatut[] = [
    'pending', 'confirmed', 'paid', 'failed',
    'cancelled', 'refunded', 'partially_refunded', 'expired',
  ]
  const countByStatut = Object.fromEntries(statutKeys.map((s) => [s, 0])) as Record<PaiementStatut, number>
  for (const p of all) {
    if (p.statut in countByStatut) {
      countByStatut[p.statut]++
    }
  }

  // ── recent confirmed payments (last 10) ───────────────────────────────────
  const recentPaiements = [...confirmed]
    .sort((a, b) => b.dateCreation.seconds - a.dateCreation.seconds)
    .slice(0, 10)

  return { totals, byPeriod, byMethode, byCategorie, byVille, countByStatut, recentPaiements }
}

/**
 * Daily confirmed payments analytics for a selected period.
 */
export async function getDailyPaymentAnalytics(
  period: SalesAnalyticsPeriod = '30d',
  status: SalesAnalyticsStatusFilter = 'confirmed',
): Promise<DailyPaymentAnalyticsPoint[]> {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30

  const to = startOfDay(new Date(now))
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))

  const q = query(
    collection(db, COLLECTION),
    where('dateCreation', '>=', Timestamp.fromDate(from)),
    where('dateCreation', '<=', Timestamp.fromDate(new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1))),
    orderBy('dateCreation', 'asc'),
  )

  const snap = await getDocs(q)
  const allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))

  const statusSet = new Set<PaiementStatut>(
    status === 'all'
      ? ['pending', 'confirmed', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'expired']
      : status === 'refunded'
        ? ['refunded', 'partially_refunded']
        : [status],
  )
  const items = allItems.filter((item) => statusSet.has(item.statut))

  const map = new Map<string, { amount: number; count: number }>()
  for (let i = 0; i < days; i += 1) {
    const d = new Date(from)
    d.setDate(from.getDate() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    map.set(key, { amount: 0, count: 0 })
  }

  for (const item of items) {
    const seconds = safeTimestampSeconds(item.dateCreation)
    if (!seconds) continue
    const d = new Date(seconds * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const existing = map.get(key)
    if (!existing) continue
    existing.amount += Number(item.montant ?? 0)
    existing.count += 1
    map.set(key, existing)
  }

  return Array.from(map.entries()).map(([dateKey, value]) => {
    const d = new Date(`${dateKey}T00:00:00`)
    return {
      dateKey,
      label: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(d),
      amount: round2(value.amount),
      count: value.count,
    }
  })
}

/**
 * Revenue for a custom date range (confirmed only).
 */
export async function getRevenueByRange(from: Date, to: Date): Promise<{ montant: number; count: number; devise: string }[]> {
  const q = query(
    collection(db, COLLECTION),
    where('statut', '==', CONFIRMED_STATUT),
    where('dateCreation', '>=', Timestamp.fromDate(from)),
    where('dateCreation', '<=', Timestamp.fromDate(to)),
    orderBy('dateCreation', 'desc'),
  )
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => d.data() as Paiement)

  const deviseMap = new Map<string, { montant: number; count: number }>()
  for (const p of items) {
    const existing = deviseMap.get(p.devise) ?? { montant: 0, count: 0 }
    deviseMap.set(p.devise, { montant: existing.montant + p.montant, count: existing.count + 1 })
  }
  return Array.from(deviseMap.entries()).map(([devise, v]) => ({ devise, ...v }))
}

/**
 * Recent payments (any status) — useful for activity feed.
 */
export async function getRecentPaiements(n = 10): Promise<Paiement[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('dateCreation', 'desc'),
    limit(n),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement))
}

/**
 * Count reservations with status = 'confirmee'.
 */
export async function getReservationsConfirmeesCount(): Promise<number> {
  const q = query(
    collection(db, 'reservations'),
    where('status', '==', 'confirmee'),
  )
  const snap = await getCountFromServer(q)
  return snap.data().count
}

/**
 * Count all documents in the customers collection.
 */
export async function getCustomersCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, 'customers'))
  return snap.data().count
}

/**
 * Total revenue from paiements where paymentType = 'sponsoring' (all statuts).
 */
export async function getSponsoringRevenue(): Promise<number> {
  const campaigns = await getSponsorCampaigns()
  return campaigns.reduce((sum, item) => sum + Number(item.pricing?.amount ?? 0), 0)
}

export async function getSponsorCampaigns(): Promise<SponsorCampaign[]> {
  const q = query(collection(db, 'sponsor_campaigns'), orderBy('createdAt', 'desc'))
  console.log('[sponsoring] getSponsorCampaigns → query collection: sponsor_campaigns')
  const snap = await getDocs(q)
  console.log('[sponsoring] getSponsorCampaigns → docs count:', snap.docs.length)
  const campaigns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorCampaign))
  console.log('[sponsoring] getSponsorCampaigns → results:', campaigns)
  return campaigns
}

export async function getSponsoringStats(): Promise<SponsoringStats> {
  const campaigns = await getSponsorCampaigns()
  console.log('[sponsoring] getSponsoringStats → campaigns:', campaigns)
  return {
    totalAmount: campaigns.reduce((sum, item) => sum + Number(item.pricing?.amount ?? 0), 0),
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((item) => item.status === 'active').length,
    pausedCampaigns: campaigns.filter((item) => item.status === 'paused').length,
  }
}
