import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '~/config/firebase'
import type { SuperAdmin } from '~/types'

const COLLECTION = 'superadmins'
const col = collection(db, COLLECTION)

const SEED_USERS: Array<{ uid: string; email: string; displayName: string }> = [
  { uid: 'apdbteju1xhMYg0BRt67oqZ8vdB2', email: 'superadmin1@admin.com', displayName: 'Super Admin 1' },
  { uid: 'hPErWLbcfIWLuasDfcKRnhQEa1A2', email: 'superadmin2@admin.com', displayName: 'Super Admin 2' },
]

// This function is meant to be run once to seed the superadmins collection with initial data. It checks if a user with the same UID already exists and skips seeding if it does, ensuring idempotency.
export async function seedSuperAdmins(): Promise<{ seeded: number; skipped: number }> {
  let seeded = 0
  let skipped = 0
  for (const user of SEED_USERS) {
    const ref = doc(db, COLLECTION, user.uid)
    const existing = await getDoc(ref)
    if (existing.exists()) {
      skipped++
      continue
    }
    await setDoc(ref, {
      role: 'superadmin',
      email: user.email,
      displayName: user.displayName,
      active: true,
      permissions: {
        usersBan: true,
        providersEdit: true,
        payoutsManage: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })
    seeded++
  }
  return { seeded, skipped }
}

export async function getSuperAdmins(): Promise<SuperAdmin[]> {
  const snap = await getDocs(col)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SuperAdmin))
}

export async function getSuperAdmin(id: string): Promise<SuperAdmin | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as SuperAdmin) : null
}

export async function getSuperAdminByEmail(email: string): Promise<SuperAdmin | null> {
  const snap = await getDocs(query(col, where('email', '==', email)))
  if (snap.empty) return null
  const d = snap.docs[0]!
  return { id: d.id, ...d.data() } as SuperAdmin
}

export async function createSuperAdmin(
  data: Omit<SuperAdmin, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>,
): Promise<DocumentReference> {
  return addDoc(col, {
    ...data,
    role: 'superadmin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  })
}

export async function updateSuperAdmin(
  id: string,
  data: Partial<Omit<SuperAdmin, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

//
export async function updateLastLogin(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSuperAdmin(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
