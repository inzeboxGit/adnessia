<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <span
        :class="{ hidden: !notifying, flex: notifying }"
        class="absolute right-0 top-0.5 z-1 min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
        <span
          class="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 -z-1 animate-ping"
        ></span>
      </span>
      <svg
        class="fill-current"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          fill=""
        />
      </svg>
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
    >
      <div
        class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800"
      >
        <h5 class="text-lg font-semibold text-gray-800 dark:text-white/90">Notifications</h5>

        <button @click="closeDropdown" class="text-gray-500 dark:text-gray-400">
          <svg
            class="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <ul class="flex flex-col h-auto overflow-y-auto custom-scrollbar">
        <li v-for="notification in notifications" :key="notification.id" @click="handleItemClick">
          <button
            type="button"
            class="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
          >
            <span class="relative mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3.33337V10L14.1667 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.8579 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.8579 17.5 10Z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </span>

            <span class="block text-left">
              <span class="mb-1 block text-sm font-semibold text-gray-800 dark:text-white/90">
                {{ notification.title }}
              </span>
              <span class="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                {{ notification.subtitle }}
              </span>

              <span class="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                <span>{{ notification.kindLabel }}</span>
                <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{{ notification.time }}</span>
              </span>
            </span>
          </button>
        </li>
        <li v-if="!notifications.length" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune notification recente.
        </li>
      </ul>

      <router-link
        to="/"
        class="mt-3 flex justify-center rounded-lg border border-gray-300 bg-white p-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        @click="handleViewAllClick"
      >
        Voir activite recente
      </router-link>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  getDashboardRecentActivity,
  type DashboardRecentActivityItem,
  type DashboardRecentActivityKind,
} from '~/services/dashboard'

const dropdownOpen = ref(false)
const notifying = ref(false)
const unreadCount = ref(0)
const dropdownRef = ref<HTMLElement | null>(null)
const pollId = ref<number | null>(null)
const isFirstLoad = ref(true)
const knownIds = ref<Set<string>>(new Set())

type HeaderNotification = {
  id: string
  title: string
  subtitle: string
  kindLabel: string
  time: string
}

const notifications = ref<HeaderNotification[]>([])

const toDate = (value: DashboardRecentActivityItem['createdAt']) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatRelativeTime = (value: DashboardRecentActivityItem['createdAt']) => {
  const date = toDate(value)
  if (!date) return 'Date inconnue'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays} j`
}

const kindLabel = (kind: DashboardRecentActivityKind) => {
  if (kind === 'RESERVATION') return 'Reservation'
  if (kind === 'HEBERGEMENT') return 'Hebergement'
  if (kind === 'LOCATION_VOITURE') return 'Location'
  if (kind === 'VTC') return 'VTC'
  if (kind === 'ACTIVITE') return 'Activite'
  return 'Sponsoring'
}

const playNotificationSoundOnce = () => {
  try {
    const context = new window.AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.value = 0.05

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.12)

    oscillator.onended = () => {
      void context.close()
    }
  } catch {
    // Ignore audio errors (browser policy/user settings).
  }
}

const loadNotifications = async () => {
  const activityItems = await getDashboardRecentActivity(10)

  const mapped = activityItems.map((item) => ({
    id: `${item.sourceCollection}:${item.id}`,
    title: item.title,
    subtitle: item.subtitle,
    kindLabel: kindLabel(item.kind),
    time: formatRelativeTime(item.createdAt),
  }))

  const currentIds = new Set(mapped.map((item) => item.id))
  if (!isFirstLoad.value) {
    let incoming = 0
    currentIds.forEach((id) => {
      if (!knownIds.value.has(id)) incoming += 1
    })

    if (incoming > 0) {
      unreadCount.value += incoming
      notifying.value = true
      playNotificationSoundOnce()
    }
  }

  notifications.value = mapped
  knownIds.value = currentIds
  isFirstLoad.value = false
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    notifying.value = false
    unreadCount.value = 0
  }
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target instanceof Node ? event.target : null
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
}

const handleItemClick = () => {
  closeDropdown()
}

const handleViewAllClick = () => {
  closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void loadNotifications()
  pollId.value = window.setInterval(() => {
    void loadNotifications()
  }, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollId.value !== null) {
    window.clearInterval(pollId.value)
  }
})
</script>
