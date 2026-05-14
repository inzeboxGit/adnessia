<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Admins & Roles" />
    <p class="mb-4 text-sm text-gray-500">Gestion des comptes admin/staff, roles et permissions depuis la collection superadmins.</p>

    <div v-if="error" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
      {{ error }}
    </div>
    <div v-if="success" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
      {{ success }}
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Collection superadmins</h3>
        <button
          type="button"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          :disabled="loading"
          @click="loadAdmins"
        >
          {{ loading ? 'Chargement...' : 'Rafraichir' }}
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="min-w-full divide-y divide-gray-100">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Admin</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Actif</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Permissions</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Derniere connexion</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loading">
              <td colspan="6" class="px-3 py-8 text-center text-sm text-gray-500">Chargement...</td>
            </tr>
            <tr v-else-if="admins.length === 0">
              <td colspan="6" class="px-3 py-8 text-center text-sm text-gray-500">Aucun admin trouve dans superadmins.</td>
            </tr>

            <tr v-for="admin in admins" :key="admin.id" class="hover:bg-gray-50/80">
              <td class="px-3 py-3">
                <p class="text-sm font-semibold text-gray-800">{{ admin.displayName || '—' }}</p>
                <p class="text-xs text-gray-500">{{ admin.email || '—' }}</p>
                <p class="text-xs text-gray-400">uid: {{ admin.id || '—' }}</p>
              </td>

              <td class="px-3 py-3">
                <select
                  v-model="admin.role"
                  class="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none"
                >
                  <option value="superadmin">superadmin</option>
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
              </td>

              <td class="px-3 py-3">
                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input v-model="admin.active" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                  Active
                </label>
              </td>

              <td class="px-3 py-3">
                <div class="grid grid-cols-1 gap-1 text-sm text-gray-700 md:grid-cols-3">
                  <label class="inline-flex items-center gap-2">
                    <input v-model="admin.permissions.usersBan" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    usersBan
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input v-model="admin.permissions.providersEdit" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    providersEdit
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input v-model="admin.permissions.payoutsManage" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    payoutsManage
                  </label>
                </div>
              </td>

              <td class="px-3 py-3 text-sm text-gray-600">
                {{ formatDate(admin.lastLoginAt) }}
              </td>

              <td class="px-3 py-3">
                <button
                  type="button"
                  class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                  :disabled="savingId === admin.id"
                  @click="saveAdmin(admin)"
                >
                  {{ savingId === admin.id ? 'En cours...' : 'Sauvegarder' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getSuperAdmins, updateSuperAdmin } from '~/services/superadmins'
import type { SuperAdmin } from '~/types'

type EditableAdmin = SuperAdmin & {
  id: string
}

const loading = ref(true)
const savingId = ref<string | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const admins = ref<EditableAdmin[]>([])

const normalizeAdmin = (item: SuperAdmin): EditableAdmin => {
  return {
    ...item,
    id: String(item.id || ''),
    role: (item.role || 'staff') as EditableAdmin['role'],
    active: Boolean(item.active),
    permissions: {
      usersBan: Boolean(item.permissions?.usersBan),
      providersEdit: Boolean(item.permissions?.providersEdit),
      payoutsManage: Boolean(item.permissions?.payoutsManage),
    },
  }
}

const loadAdmins = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const list = await getSuperAdmins()
    admins.value = list
      .filter((item) => Boolean(item.id))
      .map(normalizeAdmin)
      .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
  } catch {
    error.value = 'Impossible de charger les admins depuis superadmins.'
  } finally {
    loading.value = false
  }
}

const saveAdmin = async (admin: EditableAdmin) => {
  if (!admin.id) return

  savingId.value = admin.id
  error.value = null
  success.value = null

  try {
    await updateSuperAdmin(admin.id, {
      role: admin.role,
      active: admin.active,
      permissions: {
        usersBan: Boolean(admin.permissions.usersBan),
        providersEdit: Boolean(admin.permissions.providersEdit),
        payoutsManage: Boolean(admin.permissions.payoutsManage),
      },
    })
    success.value = `Admin ${admin.displayName || admin.email || admin.id} mis a jour.`
  } catch {
    error.value = 'Impossible de sauvegarder cet admin.'
  } finally {
    savingId.value = null
  }
}

const toDate = (value?: Date | { seconds?: number; toDate?: () => Date } | null) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value?: Date | { seconds?: number; toDate?: () => Date } | null) => {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(loadAdmins)
</script>
