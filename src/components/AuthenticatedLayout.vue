<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <aside
      class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col"
    >
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div
            class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center shadow-soft"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-white">
              <path
                fill="currentColor"
                d="M12 2l3.5 6H20l-3.5 6L20 20h-4.5L12 14l-3.5 6H4l3.5-6L4 8h4.5z"
              />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-sm">
              PGE-QROO
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">v1.0</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="handleClick(item.id)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            active === item.id
              ? 'bg-primary-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" :d="item.icon" /></svg>
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          @click="$emit('toggleDarkMode')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg v-if="isDarkMode" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path
              d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path
              d="M10 7C7.73228 7 6 8.73228 6 11C6 13.2677 7.73228 15 10 15C12.2677 15 14 13.2677 14 11C14 8.73228 12.2677 7 10 7ZM0 11C0 9.34315 1.34315 8 3 8H4.74339C5.08133 5.87787 6.94831 4.24694 9.23205 4.01348C8.74862 2.80923 7.7558 2 6.5 2C4.567 2 3 3.567 3 5.5C3 7.433 4.567 9 6.5 9H7V13C7 14.6569 8.34315 16 10 16C11.6569 16 13 14.6569 13 13V12H14.2676C17.0521 12 19.2676 9.78449 19.2676 7C19.2676 4.78449 17.0521 3 14.2676 3C13.2694 3 12.3346 3.34315 11.6036 3.89543C11.8618 4.54925 12 5.25795 12 6C12 8.20914 10.2091 10 8 10C6.42401 10 5.07588 9.16868 4.45445 7.93904C4.16879 7.97221 3.88915 8 3.61126 8C1.88909 8 0.447715 8.94429 0 10.3358C0 10.2258 0 10.1128 0 10C0 10.6592 0.147816 11.3032 0.42143 11.8761C0.141277 11.9445 0 12.2324 0 12.5C0 13.3284 0.671573 14 1.5 14H2V18C2 19.6569 3.34315 21 5 21C6.65685 21 8 19.6569 8 18V16.5H9C9.82843 16.5 10.5 15.8284 10.5 15V14.2676C11.3346 14.6535 12.2694 15 13.2676 15C14.5903 15 15.8119 14.5487 16.7253 13.8212C16.8697 13.7185 17 13.5814 17 13.4172V12.1577C17.6606 12.3868 18.25 12.7733 18.693 13.2744C19.6214 12.4706 20.5 11.4733 20.5 10.25V9.58998C21.5649 9.11556 22.3456 8.14214 22.3456 7C22.3456 6.22798 22.0701 5.52216 21.6149 5.00168C21.7051 5.31737 21.75 5.65356 21.75 6C21.75 7.51878 20.7557 8.79944 19.3706 9.16705C19.3927 9.27205 19.4043 9.38036 19.4043 9.49182C19.4043 10.7221 18.3882 11.7259 17.1289 11.8906C17.0624 11.895 16.9959 11.9 16.9287 11.9H16V13H16.5C17.3284 13 18 13.6716 18 14.5V15C18 16.1046 17.1046 17 16 17H15V18C15 19.6569 13.6569 21 12 21C11.2127 21 10.4949 20.6563 10 20.1046V19C10 18.4477 10.4477 18 11 18H11.5V17H11C9.89543 17 9 16.1046 9 15V14.2676C8.25239 14.7558 7.30762 15 6.5 15C5.11929 15 3.91689 14.2957 3.35112 13.2308C2.46114 13.5396 1.5 14.2624 1.5 15.5C1.5 16.9045 2.59543 18 4 18H5V22C5 23.1046 5.89543 24 7 24H11V20C11 19.4477 11.4477 19 12 19H16V18H15.5C15.2239 18 15 17.7761 15 17.5V16.5H17C17.5523 16.5 18 16.0523 18 15.5V14.5C18 14.2239 17.7761 14 17.5 14H16V12.5C16 12.2239 16.2239 12 16.5 12H17.1289C17.3935 12 17.6515 12.0347 17.9 12.1013V10.25C17.9 9.42157 17.2284 8.75 16.4 8.75H16V9C16 10.1046 15.1046 11 14 11H11.5C11.2239 11 11 10.7761 11 10.5V10H9.5C9.77614 10 10 9.77614 10 9.5V8H9.5C9.77614 8 10 7.77614 10 7.5V7Z"
            />
          </svg>
          <span>{{ isDarkMode ? 'Modo claro' : 'Modo oscuro' }}</span>
        </button>
        <button
          @click="$emit('logout')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5">
            <path
              fill="currentColor"
              d="M5 5h9v2H5v12h9v2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m10.5 1.5L19 8l-3.5 3.5-1.41-1.41L16.17 8l-3.08-3.09L15.5 3.5zm.5 4.5v2h6v-2h-6z"
            />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header
        class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ activeItem.label }}
        </h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-slate-900 dark:text-slate-100 font-medium">{{ userEmail }}</span>
            <span class="text-slate-500 dark:text-slate-400">· Admin</span>
          </div>
          <div
            class="h-8 w-8 rounded-full bg-primary-600 text-white grid place-items-center text-xs font-bold"
          >
            {{ userEmail.charAt(0).toUpperCase() }}
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ active: string; userEmail: string; isDarkMode: boolean }>()
const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'navigate'): void
  (e: 'toggleDarkMode'): void
}>()

const active = ref(props.active)

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  },
  {
    id: 'analysis',
    label: 'Análisis y Predicción',
    icon: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z',
  },
  {
    id: 'dependencies',
    label: 'Dependencias',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  { id: 'properties', label: 'Inmuebles', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { id: 'import', label: 'Carga de Consumos', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
  {
    id: 'budgets',
    label: 'Presupuestos',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm9 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.05 1.97 3.45v2h6v-2c0-2.66-5.33-4-8-4z',
  },
]

const activeItem = computed(() => navItems.find((i) => i.id === active.value) || navItems[0])

const handleClick = (id: string) => {
  active.value = id
  emit('navigate', id)
}
</script>
