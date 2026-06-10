<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-gray-900">
      <h3 class="mb-4 text-lg font-semibold">Modération chauffeur</h3>

      <div class="mb-4 space-y-3">
        <div v-for="item in checklistOptions" :key="item.value" class="flex items-center gap-3">
          <input type="checkbox" :id="item.value" v-model="checks" :value="item.value" class="rounded" />
          <label :for="item.value" class="text-sm text-gray-700 dark:text-gray-300">{{ item.label }}</label>
        </div>

        <textarea v-model="notes" rows="4" placeholder="Notes / motif (optionnel)" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"></textarea>
      </div>

      <div class="flex items-center justify-end gap-2">
        <button type="button" class="rounded-lg border border-gray-200 px-3 py-2 text-sm" @click="$emit('close')">Annuler</button>
        <button type="button" class="rounded-lg bg-error-500 px-3 py-2 text-sm text-white" @click="apply('rejected')">Rejeter</button>
        <button type="button" class="rounded-lg bg-success-500 px-3 py-2 text-sm text-white" @click="apply('approved')">Approuver</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { moderateDriver } from '@/services/drivers'
import { useRouter } from 'vue-router'

const props = defineProps<{ driverId: string }>()
const emits = defineEmits(['close', 'done'])

const checklistOptions = [
  { value: 'documents', label: 'Documents vérifiés' },
  { value: 'license', label: 'Permis valide' },
  { value: 'insurance', label: 'Assurance valide' },
  { value: 'identity', label: 'Vérification identité' },
]

const checks = ref<string[]>([])
const notes = ref('')

const apply = async (decision: 'approved' | 'rejected') => {
  try {
    await moderateDriver(props.driverId, decision, notes.value, checks.value)
    emits('done', { decision })
  } catch (err) {
    // handle error (could show toast)
    console.error(err)
    emits('done', { decision, error: err })
  }
}
</script>
