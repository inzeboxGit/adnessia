<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Permissions" />
    <p class="mb-4 text-sm text-gray-500">Gestion des permissions par categories basees sur le menu sidebar, pour chaque admin/staff.</p>

    <div v-if="error" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
      {{ error }}
    </div>
    <div v-if="success" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
      {{ success }}
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Admins</h3>
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            :disabled="loading"
            @click="loadAdmins"
          >
            {{ loading ? 'Chargement...' : 'Rafraichir' }}
          </button>
        </div>

        <div class="space-y-2">
          <button
            v-for="admin in admins"
            :key="admin.id"
            type="button"
            class="w-full rounded-xl border px-3 py-2 text-left transition"
            :class="selectedAdminId === admin.id
              ? 'border-brand-300 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20'
              : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:hover:bg-gray-800/30'"
            @click="selectAdmin(admin.id)"
          >
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ admin.displayName || '—' }}</p>
            <p class="text-xs text-gray-500">{{ admin.email || '—' }}</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-200">{{ admin.role }}</span>
              <span class="rounded-full px-2 py-0.5 text-[11px]" :class="admin.active ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'">
                {{ admin.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </button>

          <div v-if="!loading && admins.length === 0" class="rounded-xl border border-dashed border-gray-300 px-3 py-5 text-center text-sm text-gray-500 dark:border-gray-700">
            Aucun admin dans superadmins.
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-8">
        <div v-if="!selectedAdmin" class="rounded-xl border border-dashed border-gray-300 px-3 py-8 text-center text-sm text-gray-500 dark:border-gray-700">
          Selectionner un admin pour gerer ses permissions.
        </div>

        <template v-else>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Permissions de {{ selectedAdmin.displayName || selectedAdmin.email || selectedAdmin.id }}</h3>
              <p class="text-xs text-gray-500">Role: {{ selectedAdmin.role }} | uid: {{ selectedAdmin.id }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              :disabled="saving"
              @click="savePermissions"
            >
              {{ saving ? 'Enregistrement...' : 'Sauvegarder permissions' }}
            </button>
          </div>

          <div class="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              @click="setAllPermissions(true)"
            >
              Tout autoriser
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              @click="setAllPermissions(false)"
            >
              Tout bloquer
            </button>
          </div>

          <div class="space-y-4">
            <article
              v-for="category in permissionCategories"
              :key="category.key"
              class="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
            >
              <div class="mb-2 flex items-center justify-between">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{{ category.label }}</h4>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    @click="setCategoryPermissions(category.key, true)"
                  >
                    Tout cocher
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    @click="setCategoryPermissions(category.key, false)"
                  >
                    Tout decocher
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                <label
                  v-for="item in category.items"
                  :key="item.key"
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
                >
                  <input
                    v-model="editablePermissions[item.key]"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  {{ item.label }}
                </label>
              </div>
            </article>
          </div>
        </template>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { db } from '~/config/firebase'
import { getSuperAdmins } from '~/services/superadmins'
import type { SuperAdmin } from '~/types'

type PermissionItem = { key: string; label: string }
type PermissionCategory = { key: string; label: string; items: PermissionItem[] }

type EditableAdmin = SuperAdmin & {
  id: string
  menuPermissions?: Record<string, boolean>
}

const permissionCategories: PermissionCategory[] = [
  {
    key: 'platform',
    label: 'Gestion De La Plateforme',
    items: [
      { key: 'partenaires', label: 'Prestataires' },
      { key: 'rideRequests', label: 'Gestion courses' },
      { key: 'listings', label: 'Listings' },
      { key: 'reservations', label: 'Reservations' },
      { key: 'clients', label: 'Clients' },
    ],
  },
  {
    key: 'support',
    label: 'Support & Moderation',
    items: [
      { key: 'qualityClientReviews', label: 'Avis & Qualite' },
      { key: 'ticketSupports', label: 'Support (SAV)' },
      { key: 'providerReports', label: 'Signalements' },
    ],
  },
  {
    key: 'finance',
    label: 'Paiements & Finance',
    items: [
      { key: 'financePayments', label: 'Liste des paiements' },
      { key: 'financePayouts', label: 'Payouts' },
      { key: 'financeCommissions', label: 'Commissions' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    items: [
      { key: 'marketingSponsoring', label: 'Sponsoring' },
      { key: 'marketingPush', label: 'Notifications push' },
      { key: 'marketingCoupons', label: 'Coupons' },
    ],
  },
  {
    key: 'settings',
    label: 'Parametres',
    items: [
      { key: 'settingsGeneral', label: 'Configuration generale' },
      { key: 'settingsAdminRoles', label: 'Admins & Roles' },
      { key: 'settingsPermissions', label: 'Permissions' },
      { key: 'settingsActivity', label: 'Activite' },
    ],
  },
]

const allPermissionKeys = permissionCategories.flatMap((category) => category.items.map((item) => item.key))

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const admins = ref<EditableAdmin[]>([])
const selectedAdminId = ref('')
const editablePermissions = ref<Record<string, boolean>>({})

const defaultPermissions = () => Object.fromEntries(allPermissionKeys.map((key) => [key, true])) as Record<string, boolean>

const normalizeMenuPermissions = (permissions?: Record<string, boolean>) => {
  const base = defaultPermissions()
  for (const key of allPermissionKeys) {
    if (typeof permissions?.[key] === 'boolean') base[key] = Boolean(permissions[key])
  }
  return base
}

const selectedAdmin = computed(() => {
  return admins.value.find((admin) => admin.id === selectedAdminId.value) || null
})

const selectAdmin = (id: string) => {
  selectedAdminId.value = id
  const admin = admins.value.find((item) => item.id === id)
  editablePermissions.value = normalizeMenuPermissions(admin?.menuPermissions)
  success.value = null
  error.value = null
}

const loadAdmins = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const list = await getSuperAdmins()
    admins.value = list
      .filter((item) => Boolean(item.id))
      .map((item) => ({ ...item, id: String(item.id || ''), menuPermissions: (item as EditableAdmin).menuPermissions || {} }))
      .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))

    if (admins.value.length > 0) {
      selectAdmin(admins.value[0].id)
    }
  } catch {
    error.value = 'Impossible de charger les admins.'
  } finally {
    loading.value = false
  }
}

const setAllPermissions = (value: boolean) => {
  const next = { ...editablePermissions.value }
  for (const key of allPermissionKeys) next[key] = value
  editablePermissions.value = next
}

const setCategoryPermissions = (categoryKey: string, value: boolean) => {
  const category = permissionCategories.find((item) => item.key === categoryKey)
  if (!category) return
  const next = { ...editablePermissions.value }
  for (const item of category.items) next[item.key] = value
  editablePermissions.value = next
}

const savePermissions = async () => {
  const admin = selectedAdmin.value
  if (!admin?.id) return

  saving.value = true
  error.value = null
  success.value = null

  try {
    await updateDoc(doc(db, 'superadmins', admin.id), {
      menuPermissions: editablePermissions.value,
      updatedAt: serverTimestamp(),
    })

    admins.value = admins.value.map((item) => (
      item.id === admin.id
        ? { ...item, menuPermissions: { ...editablePermissions.value } }
        : item
    ))

    success.value = `Permissions mises a jour pour ${admin.displayName || admin.email || admin.id}.`
  } catch {
    error.value = 'Impossible de sauvegarder les permissions.'
  } finally {
    saving.value = false
  }
}

onMounted(loadAdmins)
</script>
