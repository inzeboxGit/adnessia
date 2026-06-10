import { collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/config/firebase'

type DateLike = Date | { seconds?: number } | null | undefined

export type RideStatusGroup = 'open' | 'confirmed' | 'completed' | 'canceled' | 'unknown'

export type RideRequestRow = {
  id: string
  userId: string
  clientName: string
  selectedDriverId: string
  paymentDriverId: string
  driverName: string
  status: string
  statusGroup: RideStatusGroup
  canceledBy: string
  driverStage: string
  categoryLabel: string
  paymentMethod: string
  amount: number
  currency: string
  distanceKm: number
  pickupAddress: string
  dropoffAddress: string
  orderId: string
  transactionId: string
  isBusy?: boolean
  arrivedAtPickup?: boolean
  createdAt: DateLike
  updatedAt: DateLike
  clientPaidAt: DateLike
  rideStartedAt: DateLike
}

export type RideRequestsData = {
  rows: RideRequestRow[]
  commissionRate: number
}

export type RideDriverOption = {
  id: string
  name: string
}

const asDateLike = (value: unknown): DateLike => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return value as { seconds?: number }
  }
  return null
}

const round2 = (value: number) => Number(value.toFixed(2))

const customerDisplayName = (data: Record<string, any>) => {
  if (data.name) return String(data.name)
  return `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || '—'
}

const driverDisplayName = (data: Record<string, any>) => {
  return `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()
    || String(data.fullName || data.name || '—')
}

const normalizeStatusGroup = (status?: string, driverStage?: string): RideStatusGroup => {
  const statusValue = String(status || '').trim().toLowerCase()
  const stageValue = String(driverStage || '').trim().toLowerCase()
  const combined = `${statusValue} ${stageValue}`.trim()

  if (/(cancel|annul)/.test(combined)) return 'canceled'
  if (/(complete|finish|termine|ended|done|success)/.test(combined)) return 'completed'
  if (/(confirm|accept|assign|arriv|on_trip|in_progress|started|ongoing)/.test(combined)) return 'confirmed'
  if (/(open|pending|request|search|new|waiting)/.test(combined)) return 'open'
  return 'unknown'
}

const rideAmount = (data: Record<string, any>) => {
  return Number(
    data.payment?.totalAmount
    ?? data.selectedPrice
    ?? data.estimationDetails?.prixTotal
    ?? data.clientProposedPrice
    ?? 0,
  )
}

export async function getRideRequestsData(): Promise<RideRequestsData> {
  const [ridesSnap, configSnap, customersSnap, driversSnap] = await Promise.all([
    getDocs(collection(db, 'ride_requests')),
    getDoc(doc(db, 'nessiaConfig', 'config')),
    getDocs(collection(db, 'customers')),
    getDocs(collection(db, 'drivers')),
  ])

  const commissionRate = configSnap.exists()
    ? Number(configSnap.data()?.nessiaFees || 0)
    : 0

  const customersByKey = new Map<string, string>()
  for (const customerDoc of customersSnap.docs) {
    const customer = customerDoc.data() as Record<string, any>
    const displayName = customerDisplayName(customer)
    customersByKey.set(customerDoc.id, displayName)
    if (customer.uid) customersByKey.set(String(customer.uid), displayName)
  }

  const driversByKey = new Map<string, string>()
  for (const driverDoc of driversSnap.docs) {
    const driver = driverDoc.data() as Record<string, any>
    const displayName = driverDisplayName(driver)
    driversByKey.set(driverDoc.id, displayName)
    if (driver.uid) driversByKey.set(String(driver.uid), displayName)
  }

  const rows = ridesSnap.docs.map((rideDoc) => {
    const data = rideDoc.data() as Record<string, any>
    const userId = String(data.userId || '')
    const selectedDriverId = String(data.selectedDriverId || '')
    const paymentDriverId = String(data.payment?.driverId || '')

    return {
      id: rideDoc.id,
      userId,
      clientName: customersByKey.get(userId) || '—',
      selectedDriverId,
      paymentDriverId,
      driverName: driversByKey.get(selectedDriverId) || driversByKey.get(paymentDriverId) || '—',
      status: String(data.status || '—'),
      statusGroup: normalizeStatusGroup(data.status, data.driverStage),
      canceledBy: String(data.canceledBy || ''),
      driverStage: String(data.driverStage || ''),
      categoryLabel: String(data.estimationDetails?.categoryLabel || data.estimationDetails?.label || '—'),
      paymentMethod: String(data.payment?.pMethode || '—'),
      amount: rideAmount(data),
      currency: String(data.estimationDetails?.devise || data.payment?.currency || 'MAD'),
      distanceKm: Number(data.estimationDetails?.distanceKm || 0),
      pickupAddress: String(data.pickup?.address || data.estimationDetails?.pickupLabel || '—'),
      dropoffAddress: String(data.dropoff?.address || data.estimationDetails?.destinationLabel || '—'),
      orderId: String(data.payment?.orderId || ''),
      transactionId: String(data.payment?.transactionId || ''),
      isBusy: typeof data.is_busy === 'boolean' ? data.is_busy : undefined,
      arrivedAtPickup: typeof data.arrived_at_pickup === 'boolean' ? data.arrived_at_pickup : undefined,
      createdAt: asDateLike(data.createdAt),
      updatedAt: asDateLike(data.updatedAt),
      clientPaidAt: asDateLike(data.clientPaidAt || data.payment?.paidAt),
      rideStartedAt: asDateLike(data.rideStartedAt),
    } satisfies RideRequestRow
  })

  return {
    rows: rows.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.seconds ?? 0) * 1000
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.seconds ?? 0) * 1000
      return bTime - aTime
    }),
    commissionRate: round2(commissionRate),
  }
}

export async function getRideDriverOptions(): Promise<RideDriverOption[]> {
  const driversSnap = await getDocs(collection(db, 'drivers'))

  return driversSnap.docs
    .map((driverDoc) => {
      const driver = driverDoc.data() as Record<string, any>
      return {
        id: driverDoc.id,
        name: driverDisplayName(driver),
      } satisfies RideDriverOption
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function reassignRideRequest(rideId: string, driverId: string) {
  if (!rideId) throw new Error('Missing ride id')
  if (!driverId) throw new Error('Missing driver id')

  const rideRef = doc(db, 'ride_requests', rideId)
  const rideSnap = await getDoc(rideRef)
  if (!rideSnap.exists()) throw new Error('Ride request not found')

  const data = rideSnap.data() as Record<string, any>
  const updates: Record<string, any> = {
    selectedDriverId: driverId,
    updatedAt: serverTimestamp(),
  }

  if (data.payment && typeof data.payment === 'object') {
    updates['payment.driverId'] = driverId
  }

  await updateDoc(rideRef, updates)
}
