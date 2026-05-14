<template>
  <AdminLayout>
    <PageBreadcrumb page-title="Configuration generale" />
    <p class="mb-4 text-sm text-gray-500">Parametrage global de l'application Nessia et des tarifs VTC.</p>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement de la configuration...
    </div>

    <div v-else class="space-y-5 sm:space-y-6">
      <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Configuration app (nessiaConfig/config)</h3>
          <button
            type="button"
            class="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            :disabled="saving"
            @click="saveAppConfig"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Nom application</span>
            <input v-model="appConfig.appName" type="text" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Logo URL</span>
            <input v-model="appConfig.nessiaLogo" type="text" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Commission Nessia (%)</span>
            <input v-model.number="appConfig.nessiaFees" type="number" min="0" max="100" step="0.1" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block md:col-span-2 xl:col-span-1">
            <span class="mb-1 block text-xs text-gray-500">Langues (separees par virgule)</span>
            <input v-model="languagesInput" type="text" placeholder="fr,en,ar" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Devise par defaut</span>
            <input v-model="appConfig.defaultCurrency" type="text" placeholder="MAD" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Fuseau horaire</span>
            <input v-model="appConfig.timezone" type="text" placeholder="Africa/Casablanca" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Email support</span>
            <input v-model="appConfig.supportEmail" type="email" placeholder="support@nessia.ma" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Telephone support</span>
            <input v-model="appConfig.supportPhone" type="text" placeholder="+212..." class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Pays principal</span>
            <input v-model="appConfig.country" type="text" placeholder="MA" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Reservation max avance (jours)</span>
            <input v-model.number="appConfig.maxBookingAdvanceDays" type="number" min="0" step="1" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Delai annulation gratuite (heures)</span>
            <input v-model.number="appConfig.cancellationGraceHours" type="number" min="0" step="1" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>

          <label class="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
            <input v-model="appConfig.maintenance" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
            Mode maintenance active
          </label>

          <label class="block md:col-span-2 xl:col-span-3">
            <span class="mb-1 block text-xs text-gray-500">Message maintenance</span>
            <textarea v-model="appConfig.maintenanceMessage" rows="3" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>
        </div>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Tarifs VTC (nessiaConfig/tarifs_vtc)</h3>
          <button
            type="button"
            class="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            :disabled="saving"
            @click="saveTarifsVtc"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>

        <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Devise</span>
            <input v-model="tarifsVtc.devise" type="text" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs text-gray-500">Version</span>
            <input v-model.number="tarifsVtc.version" type="number" min="1" step="1" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
          </label>
          <label class="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
            <input v-model="tarifsVtc.isActive" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
            Tarification active
          </label>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="category in categoryKeys"
            :key="category"
            class="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
          >
            <h4 class="mb-3 text-sm font-semibold text-gray-900 capitalize dark:text-white">{{ category }}</h4>
            <div class="space-y-3">
              <label class="block">
                <span class="mb-1 block text-xs text-gray-500">Label</span>
                <input v-model="tarifsVtc.categories[category].label" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
              </label>

              <div class="grid grid-cols-2 gap-2">
                <label class="block">
                  <span class="mb-1 block text-xs text-gray-500">Base min</span>
                  <input v-model.number="tarifsVtc.categories[category].base.min" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                </label>
                <label class="block">
                  <span class="mb-1 block text-xs text-gray-500">Base max</span>
                  <input v-model.number="tarifsVtc.categories[category].base.max" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                </label>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <label class="block">
                  <span class="mb-1 block text-xs text-gray-500">Prix/km min</span>
                  <input v-model.number="tarifsVtc.categories[category].prixKm.min" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                </label>
                <label class="block">
                  <span class="mb-1 block text-xs text-gray-500">Prix/km max</span>
                  <input v-model.number="tarifsVtc.categories[category].prixKm.max" type="number" step="0.1" min="0" class="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                </label>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div v-if="notice" class="rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
        {{ notice }}
      </div>
      <div v-if="error" class="rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
        {{ error }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '~/config/firebase'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

type AppConfigForm = {
  appName: string
  nessiaLogo: string
  languages: string[]
  nessiaFees: number
  maintenance: boolean
  maintenanceMessage: string
  supportEmail: string
  supportPhone: string
  defaultCurrency: string
  timezone: string
  country: string
  maxBookingAdvanceDays: number
  cancellationGraceHours: number
}

type TariffRange = {
  min: number
  max: number
}

type TariffCategory = {
  label: string
  base: TariffRange
  prixKm: TariffRange
}

type TarifsVtcForm = {
  type: 'tarifs_vtc'
  devise: string
  isActive: boolean
  version: number
  categories: Record<string, TariffCategory>
}

const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const error = ref('')
const tarifsCreatedAt = ref<Timestamp | null>(null)

const appConfig = ref<AppConfigForm>({
  appName: 'Nessia',
  nessiaLogo: '',
  languages: ['fr'],
  nessiaFees: 15,
  maintenance: false,
  maintenanceMessage: '',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'MAD',
  timezone: 'Africa/Casablanca',
  country: 'MA',
  maxBookingAdvanceDays: 180,
  cancellationGraceHours: 24,
})

const tarifsVtc = ref<TarifsVtcForm>({
  type: 'tarifs_vtc',
  devise: 'MAD',
  isActive: true,
  version: 1,
  categories: {
    eco: { label: 'Economie', base: { min: 12, max: 15 }, prixKm: { min: 5.5, max: 6 } },
    confort: { label: 'Confort', base: { min: 15, max: 18 }, prixKm: { min: 6.5, max: 7.5 } },
    premium: { label: 'Premium', base: { min: 20, max: 25 }, prixKm: { min: 8, max: 9 } },
    luxe: { label: 'Luxe', base: { min: 30, max: 40 }, prixKm: { min: 10, max: 12 } },
  },
})

const categoryKeys = computed(() => Object.keys(tarifsVtc.value.categories))

const languagesInput = computed({
  get: () => appConfig.value.languages.join(','),
  set: (value: string) => {
    appConfig.value.languages = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  },
})

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const mapCategory = (raw: unknown, fallbackLabel: string): TariffCategory => {
  const source = (raw as Partial<TariffCategory>) || {}
  const base = (source.base as Partial<TariffRange>) || {}
  const prixKm = (source.prixKm as Partial<TariffRange>) || {}
  return {
    label: String(source.label || fallbackLabel),
    base: {
      min: toNumber(base.min, 0),
      max: toNumber(base.max, 0),
    },
    prixKm: {
      min: toNumber(prixKm.min, 0),
      max: toNumber(prixKm.max, 0),
    },
  }
}

const loadConfig = async () => {
  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    const configRef = doc(db, 'nessiaConfig', 'config')
    const tarifsRef = doc(db, 'nessiaConfig', 'tarifs_vtc')

    const [configSnap, tarifsSnap] = await Promise.all([getDoc(configRef), getDoc(tarifsRef)])

    if (configSnap.exists()) {
      const data = configSnap.data() as Partial<AppConfigForm> & Record<string, unknown>
      appConfig.value = {
        ...appConfig.value,
        appName: String(data.appName || appConfig.value.appName),
        nessiaLogo: String(data.nessiaLogo || ''),
        languages: Array.isArray(data.languages)
          ? data.languages.map((lang) => String(lang).trim()).filter(Boolean)
          : appConfig.value.languages,
        nessiaFees: toNumber(data.nessiaFees, appConfig.value.nessiaFees),
        maintenance: Boolean(data.maintenance),
        maintenanceMessage: String(data.maintenanceMessage || ''),
        supportEmail: String(data.supportEmail || ''),
        supportPhone: String(data.supportPhone || ''),
        defaultCurrency: String(data.defaultCurrency || appConfig.value.defaultCurrency),
        timezone: String(data.timezone || appConfig.value.timezone),
        country: String(data.country || appConfig.value.country),
        maxBookingAdvanceDays: toNumber(data.maxBookingAdvanceDays, appConfig.value.maxBookingAdvanceDays),
        cancellationGraceHours: toNumber(data.cancellationGraceHours, appConfig.value.cancellationGraceHours),
      }
    }

    if (tarifsSnap.exists()) {
      const data = tarifsSnap.data() as Record<string, unknown>
      tarifsCreatedAt.value = (data.createdAt as Timestamp) || null
      const categoriesRaw = (data.categories as Record<string, unknown>) || {}
      tarifsVtc.value = {
        type: 'tarifs_vtc',
        devise: String(data.devise || 'MAD'),
        isActive: Boolean(data.isActive),
        version: toNumber(data.version, 1),
        categories: {
          eco: mapCategory(categoriesRaw.eco, 'Economie'),
          confort: mapCategory(categoriesRaw.confort, 'Confort'),
          premium: mapCategory(categoriesRaw.premium, 'Premium'),
          luxe: mapCategory(categoriesRaw.luxe, 'Luxe'),
        },
      }
    }
  } catch {
    error.value = 'Impossible de charger la configuration.'
  } finally {
    loading.value = false
  }
}

const validateTarifs = (): boolean => {
  for (const key of categoryKeys.value) {
    const category = tarifsVtc.value.categories[key]
    if (category.base.min > category.base.max || category.prixKm.min > category.prixKm.max) {
      error.value = `La categorie ${key} contient des bornes invalides (min > max).`
      return false
    }
  }
  return true
}

const saveAppConfig = async () => {
  saving.value = true
  error.value = ''
  notice.value = ''

  try {
    const payload = {
      ...appConfig.value,
      nessiaFees: toNumber(appConfig.value.nessiaFees, 0),
      languages: appConfig.value.languages,
      updatedAt: Timestamp.now(),
    }

    await setDoc(doc(db, 'nessiaConfig', 'config'), payload, { merge: true })
    notice.value = 'Configuration generale enregistree.'
  } catch {
    error.value = 'Echec de la sauvegarde de la configuration generale.'
  } finally {
    saving.value = false
  }
}

const saveTarifsVtc = async () => {
  if (!validateTarifs()) return

  saving.value = true
  error.value = ''
  notice.value = ''

  try {
    const now = Timestamp.now()
    const payload = {
      type: 'tarifs_vtc',
      devise: tarifsVtc.value.devise || 'MAD',
      isActive: Boolean(tarifsVtc.value.isActive),
      version: Math.max(1, toNumber(tarifsVtc.value.version, 1)),
      categories: tarifsVtc.value.categories,
      updatedAt: now,
      createdAt: tarifsCreatedAt.value || now,
    }

    await setDoc(doc(db, 'nessiaConfig', 'tarifs_vtc'), payload, { merge: true })
    notice.value = 'Tarifs VTC enregistres.'
  } catch {
    error.value = 'Echec de la sauvegarde des tarifs VTC.'
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>
