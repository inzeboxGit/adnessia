import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp, addDoc, query, orderBy } from 'firebase/firestore'
import { db, auth } from '~/config/firebase'

type DateLike = Date | { seconds?: number } | null | undefined
type DriverAgencyFilter = {
  id?: string | null
  agenceRef?: string | null
  uid?: string | null
}

const pickFirstValue = (...values: Array<string | number | undefined | null>) => {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

const formatVehicleLabel = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') {
    const text = value.trim()
    return text || ''
  }

  if (typeof value === 'object') {
    const record = value as Record<string, any>
    const directName = pickFirstValue(
      record.nom,
      record.name,
      record.title,
      record.label,
      record.displayName,
      record.vehicleName,
      record.vehiculeName,
      record.libelle,
      record.designation,
    )
    if (directName) return directName

    const brand = pickFirstValue(record.brand, record.marque, record.make)
    const model = pickFirstValue(record.model, record.modele, record.version)
    const combined = [brand, model].filter(Boolean).join(' ')
    if (combined) return combined

    return pickFirstValue(record.immatriculation, record.plateNumber, record.licensePlate) || ''
  }

  return ''
}

const normalizeKey = (value: unknown) => String(value || '').trim().toLowerCase()

const resolveVehicleInfo = async (driverData: Record<string, any>, agencyUid?: string) => {
  const existingLabel = formatVehicleLabel(driverData.vehicle)
  const explicitVehicleId = pickFirstValue(
    driverData.vehicleId,
    driverData.vehiculeId,
    driverData.vehicle_id,
    driverData.vehicule_id,
    driverData.vehicleRef,
    driverData.vehiculeRef,
    driverData.vtcVehicleId,
    driverData.vtcVehiculeId,
    driverData.vehicle?.id,
    driverData.vehicle?.uid,
    driverData.vehicule?.id,
    driverData.vehicule?.uid,
  )

  const vehicleId = explicitVehicleId
  let matchedAgencyVehicle = false

  if (!agencyUid) {
    return { label: existingLabel || '—', vehicleId: explicitVehicleId || '', matchedAgencyVehicle }
  }

  try {
    if (vehicleId) {
      const snap = await getDoc(doc(db, 'agences', agencyUid, 'vtc_vehicules', vehicleId))
      if (snap.exists()) {
        const label = formatVehicleLabel(snap.data())
        matchedAgencyVehicle = true
        return { label: label || existingLabel || '—', vehicleId: snap.id || vehicleId, matchedAgencyVehicle }
      }
    }

    if (existingLabel) {
      return { label: existingLabel, vehicleId: explicitVehicleId || '', matchedAgencyVehicle }
    }

    const vehiclesSnap = await getDocs(collection(db, 'agences', agencyUid, 'vtc_vehicules'))
    if (vehiclesSnap.docs.length === 1) {
      const firstDoc = vehiclesSnap.docs[0]
      const label = formatVehicleLabel(firstDoc.data())
      if (label) {
        return { label, vehicleId: firstDoc.id, matchedAgencyVehicle }
      }
    }
  } catch {
    // ignore and fall back to existing value
  }

  return { label: existingLabel || '—', vehicleId: explicitVehicleId || '', matchedAgencyVehicle }
}

const extractDriverAgencyKeys = (driverData: Record<string, any>) => {
  const nestedAgence = typeof driverData.agence === 'object' && driverData.agence !== null ? driverData.agence as Record<string, any> : {}
  const nestedAgency = typeof driverData.agency === 'object' && driverData.agency !== null ? driverData.agency as Record<string, any> : {}
  const nestedProvider = typeof driverData.provider === 'object' && driverData.provider !== null ? driverData.provider as Record<string, any> : {}
  const nestedPartner = typeof driverData.partner === 'object' && driverData.partner !== null ? driverData.partner as Record<string, any> : {}

  return new Set(
    [
      driverData.agenceId,
      driverData.agenceRef,
      driverData.agencyId,
      driverData.agencyRef,
      driverData.providerId,
      driverData.providerRef,
      driverData.partnerId,
      driverData.partnerRef,
      driverData.hostId,
      driverData.hostRef,
      driverData.ownerId,
      driverData.ownerRef,
      nestedAgence.id,
      nestedAgence.uid,
      nestedAgence.agenceRef,
      nestedAgency.id,
      nestedAgency.uid,
      nestedAgency.agencyRef,
      nestedProvider.id,
      nestedProvider.uid,
      nestedProvider.agenceRef,
      nestedPartner.id,
      nestedPartner.uid,
      nestedPartner.agenceRef,
    ]
      .map(normalizeKey)
      .filter(Boolean),
  )
}

const agencyMatchesDriver = (driverData: Record<string, any>, agency?: DriverAgencyFilter | null) => {
  if (!agency) return true

  const agencyKeys = new Set(
    [agency.id, agency.agenceRef, agency.uid]
      .map(normalizeKey)
      .filter(Boolean),
  )

  if (agencyKeys.size === 0) return true

  const driverAgencyKeys = extractDriverAgencyKeys(driverData)
  for (const key of driverAgencyKeys) {
    if (agencyKeys.has(key)) return true
  }

  return false
}

export type DriverRow = {
  id: string
  fullName: string
  email: string
  phone?: string
  status?: string
  isVerified?: boolean
  moderationStatus?: string
  profileImage?: string
  rating: number
  totalTrips: number
  nbrCourses: number
  vehicle: string
  vehicleId?: string
  balance: number
  currency: string
  createdAt: DateLike
}

const asDateLike = (value: unknown): DateLike => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return value as { seconds?: number }
  }
  return null
}

export async function getDriversTable(options?: { agency?: DriverAgencyFilter | null }): Promise<DriverRow[]> {
  const driversSnap = await getDocs(collection(db, 'drivers'))
  const agency = options?.agency ?? null
  const agencyUid = agency?.uid || ''

  const rows: DriverRow[] = []

  for (const doc of driversSnap.docs) {
    const data = doc.data() as Record<string, any>

    // attempt to read wallet subcollection (first doc)
    let balance = 0
    let currency = 'MAD'
    try {
      const walletSnap = await getDocs(collection(db, 'drivers', doc.id, 'wallet'))
      const wdoc = walletSnap.docs[0]
      if (wdoc) {
        const w = wdoc.data() as Record<string, any>
        balance = Number(w.balance || 0)
        currency = String(w.currency || 'MAD')
      }
    } catch {
      // ignore
    }

    const vehicleInfo = await resolveVehicleInfo(data, agencyUid)
    if (agency && !agencyMatchesDriver(data, agency) && !vehicleInfo.matchedAgencyVehicle) {
      continue
    }

    rows.push({
      id: doc.id,
      fullName: String(data.fullName || data.name || data.fullName || '—'),
      email: String(data.email || '—'),
      phone: String(data.phone || data.telephone || data.phoneNumber || ''),
      status: String(data.status || data.isVerified ? 'verified' : '—'),
      isVerified: typeof data.isVerified === 'boolean' ? data.isVerified : undefined,
      moderationStatus: String(data.moderation?.status || ''),
      profileImage: String(data.profileImage || ''),
      rating: Number(data.rating || 0),
      totalTrips: Number(data.totalTrips || data.totalCourseDurationSeconds || 0),
      nbrCourses: Number(data.nbrCourses || 0),
      vehicle: vehicleInfo.label,
      vehicleId: vehicleInfo.vehicleId || undefined,
      balance,
      currency,
      createdAt: asDateLike(data.createdAt),
    })
  }

  return rows
}

export async function getDriverById(id: string): Promise<Record<string, any> | null> {
  const snap = await getDoc(doc(db, 'drivers', id))
  if (!snap.exists()) return null
  const data = snap.data() as Record<string, any>

  let balance = 0
  let currency = 'MAD'
  try {
    const walletSnap = await getDocs(collection(db, 'drivers', id, 'wallet'))
    const wdoc = walletSnap.docs[0]
    if (wdoc) {
      const w = wdoc.data() as Record<string, any>
      balance = Number(w.balance || 0)
      currency = String(w.currency || 'MAD')
    }
  } catch {}

  const agencyUid = auth?.currentUser?.uid || ''
  const vehicleInfo = await resolveVehicleInfo(data, agencyUid)

  // Return full driver data with some normalized fields used by the UI
  return {
    id: snap.id,
    ...data,
    fullName: String(data.fullName || data.name || '—'),
    email: String(data.email || '—'),
    phone: String(data.phone || data.telephone || ''),
    status: String(data.status || (data.isVerified ? 'verified' : '—')),
    profileImage: String(data.profileImage || ''),
    vehicle: vehicleInfo.label,
    vehicleId: vehicleInfo.vehicleId || undefined,
    balance,
    currency,
    createdAt: asDateLike(data.createdAt),
  }
}

export async function moderateDriver(id: string, decision: 'approved' | 'rejected', notes: string, checks: string[]) {
  // Read current driver data to discover document keys (both nested and top-level)
  const snap = await getDoc(doc(db, 'drivers', id))
  if (!snap.exists()) throw new Error('Driver not found')
  const data = snap.data() as Record<string, any>

  const updates: Record<string, any> = {}

  // Write a simple moderation map with only the requested fields
  updates['moderation'] = {
    createdAt: serverTimestamp(),
    reason: notes || '',
    reviewedAt: serverTimestamp(),
    reviewedBy: auth?.currentUser?.uid || '',
    status: decision,
  }

  // Gather document keys from documents map and known top-level fields
  const docObj = (data.documents || {}) as Record<string, any>
  const topLevelKeys = ['idCard', 'license', 'insurance', 'profileImage']
  const keysSet = new Set<string>(Object.keys(docObj || {}))
  topLevelKeys.forEach((k) => {
    if (data[k]) keysSet.add(k)
  })

  // Removed moderation history and notifications to keep moderation map minimal

  // Apply the same validation status/reason to every discovered document.
  // If the existing document value is a string (url), replace it with an object containing the url and validation metadata.
  for (const key of Array.from(keysSet)) {
    const existing = (docObj && Object.prototype.hasOwnProperty.call(docObj, key)) ? docObj[key] : data[key]
    if (typeof existing === 'string') {
      updates[`documents.${key}`] = {
        url: existing,
        validationStatus: decision,
        validationReason: decision === 'rejected' ? (notes || '') : '',
        validatedAt: serverTimestamp(),
      }
    } else {
      updates[`documents.${key}.validationStatus`] = decision
      updates[`documents.${key}.validationReason`] = decision === 'rejected' ? (notes || '') : ''
      updates[`documents.${key}.validatedAt`] = serverTimestamp()
    }
  }

  // No history arrays appended; only the simple `moderation` map will be written

  await updateDoc(doc(db, 'drivers', id), updates)

  // Create a history entry in a subcollection for this moderation
  try {
    const historyEntry = {
      actionType: 'moderation',
      reason: notes || '',
      reviewedAt: serverTimestamp(),
      reviewedBy: auth?.currentUser?.uid || '',
      status: decision,
      checks: checks || [],
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'drivers', id, 'histories'), historyEntry)
  } catch (e) {
    // non-fatal: log but don't throw — moderation already saved
    console.error('Failed to write history entry', e)
  }
}

export async function getDriverHistories(id: string) {
  const q = query(collection(db, 'drivers', id, 'histories'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Resolve reviewer display names from superadmins collection
  const uids = Array.from(new Set(items.map((it: any) => it.reviewedBy).filter(Boolean)))
  const uidToName: Record<string, string> = {}
  await Promise.all(uids.map(async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'superadmins', uid))
      if (snap.exists()) {
        const sd = snap.data() as Record<string, any>
        uidToName[uid] = sd.displayName || sd.name || uid
      } else {
        uidToName[uid] = uid
      }
    } catch (e) {
      console.error('Failed to resolve superadmin', uid, e)
      uidToName[uid] = uid
    }
  }))

  return items.map((it: any) => ({ ...it, reviewerName: it.reviewedBy ? uidToName[it.reviewedBy] || it.reviewedBy : null }))
}

export async function verifyDriver(id: string) {
  if (!id) throw new Error('Missing driver id')
  const updates: Record<string, any> = {
    isVerified: true,
    status: 'verified',
  }

  await updateDoc(doc(db, 'drivers', id), updates)

  // add a history entry
  try {
    const entry = {
      actionType: 'verify',
      status: 'verified',
      reviewedBy: auth?.currentUser?.uid || '',
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'drivers', id, 'histories'), entry)
  } catch (e) {
    console.error('Failed to write verify history', e)
  }
}
