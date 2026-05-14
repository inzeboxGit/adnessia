<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/logo-dark.png"
          alt="Nessia Admin Logo"
          width="150"
          height="40"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/logo-dark.png"
          alt="Logo"
          width="150"
          height="40"
        />
        <img
          v-else
          src="/images/logo/logo-icon.png"
          alt="Logo"
          width="16"
          height="16"
        />
      </router-link>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(
                          groupIndex,
                          index
                        ),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path || '/'"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems || []" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(
                                subItem.path
                              ),
                              'menu-dropdown-item-inactive': !isActive(
                                subItem.path
                              ),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute } from "vue-router";

import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  PlugInIcon,
  StaredIcon,
  SupportIcon,
  FlagIcon,
  BellIcon,
  SettingsIcon,
  UserGroupIcon,
  TaskIcon,
  BoxIcon,
} from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import { useSidebar } from "@/composables/useSidebar";

const route = useRoute();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

type SubMenuItem = {
  name: string
  path: string
  new?: boolean
  pro?: boolean
}

type MenuItem = {
  icon: Component
  name: string
  path?: string
  subItems?: SubMenuItem[]
}

type MenuGroup = {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      {
        icon: GridIcon,
        name: "Dashboard",
        path: "/",
      },
    ],
  },
  {
    title: "Gestion De La Plateforme",
    items: [
      {
        icon: UserGroupIcon,
        name: "Prestataires",
        subItems: [
          { name: "Liste de partenaires", path: "/opportunities" },
          { name: "Prestataire en attente", path: "/opportunities/pending" },
        ],
      },
      {
        icon: BoxIcon,
        name: "Listings",
        subItems: [{ name: "Tous les listings", path: "/listings" }],
      },
      {
        icon: CalenderIcon,
        name: "Réservations",
        subItems: [{ name: "Toutes les réservations", path: "/reservations" }],
      },
      {
        icon: UserCircleIcon,
        name: "Clients",
        subItems: [{ name: "Tous les clients", path: "/clients" }],
      },
    ],
  },
  {
    title: "Support & Modération",
    items: [
      {
        icon: StaredIcon,
        name: "Avis & Qualité",
        subItems: [
          { name: "Clients review", path: "/quality/client-reviews" },
          { name: "Moderation", path: "/quality/review-moderation" },
        ],
      },
      {
        icon: SupportIcon,
        name: "Support (SAV)",
        subItems: [{ name: "Tickets support", path: "/ticket-supports" }],
      },
      {
        icon: FlagIcon,
        name: "Signalements",
        subItems: [
          // { name: "Tous les signalements", path: "/badge" },
          { name: "Suivi Litigies", path: "/quality/provider-reports" },
        ],
      },
    ],
  },
  {
    title: "Paiements & Finance",
    items: [
      {
        icon: PlugInIcon,
        name: "Liste des paiements",
        subItems: [
          { name: "Historique transactions", path: "/finance/payments" },
          { name: "Transactions partenaires", path: "/finance/partner-transactions" },
          { name: "Details facture", path: "/finance/invoice-details" },
        ],
      },
      {
        icon: BoxIcon,
        name: "Payouts",
        subItems: [{ name: "Liste des virements", path: "/finance/payouts" }],
      },
      {
        icon: PieChartIcon,
        name: "Commissions",
        subItems: [{ name: "Commissions Nessia", path: "/line-chart" }],
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        icon: SettingsIcon,
        name: "Sponsoring",
        subItems: [{ name: "Campagnes sponsorisées", path: "/bar-chart" }],
      },
      {
        icon: BellIcon,
        name: "Notifications push",
        subItems: [{ name: "Campagnes push", path: "/blank" }],
      },
      {
        icon: PlugInIcon,
        name: "Coupons",
        subItems: [{ name: "Codes promo", path: "/error-404" }],
      },
    ],
  },
  {
    title: "Paramètres",
    items: [
      {
        icon: SettingsIcon,
        name: "Paramètres généraux",
        subItems: [{ name: "Configuration générale", path: "/settings/general" }],
      },
      {
        icon: UserGroupIcon,
        name: "Admins & Rôles",
        subItems: [{ name: "Gestion des rôles", path: "/signup" }],
      },
      {
        icon: TaskIcon,
        name: "Permissions",
        subItems: [{ name: "Voir permissions", path: "/settings/permissions" }],
      },
      {
        icon: TaskIcon,
        name: "Activité",
        subItems: [{ name: "Journal d'activité", path: "/videos" }],
      },
    ],
  },
];

const isActive = (path?: string) => !!path && route.path === path;

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path))
    )
  );
});

const isSubmenuOpen = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path)
      ))
  );
};

const startTransition = (el: Element) => {
  const node = el as HTMLElement;
  node.style.height = "auto";
  const height = node.scrollHeight;
  node.style.height = "0px";
  node.getBoundingClientRect();
  node.style.height = height + "px";
};

const endTransition = (el: Element) => {
  (el as HTMLElement).style.height = "";
};
</script>
