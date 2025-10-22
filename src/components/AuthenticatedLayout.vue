<template>
  <div class="flex h-screen bg-slate-50">
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div class="p-4 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center shadow-soft">
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-white"><path fill="currentColor" d="M12 2l3.5 6H20l-3.5 6L20 20h-4.5L12 14l-3.5 6H4l3.5-6L4 8h4.5z"/></svg>
          </div>
          <div>
            <p class="font-semibold text-slate-900 leading-tight text-sm">PGE-QROO</p>
            <p class="text-xs text-slate-500 -mt-0.5">v1.0</p>
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
              : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" :d="item.icon" /></svg>
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="p-4 border-t border-slate-200">
        <button @click="$emit('logout')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M5 5h9v2H5v12h9v2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m10.5 1.5L19 8l-3.5 3.5-1.41-1.41L16.17 8l-3.08-3.09L15.5 3.5zm.5 4.5v2h6v-2h-6z"/></svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-slate-900">{{ activeItem.label }}</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-slate-900 font-medium">{{ userEmail }}</span>
            <span class="text-slate-500">· Admin</span>
          </div>
          <div class="h-8 w-8 rounded-full bg-primary-600 text-white grid place-items-center text-xs font-bold">
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

const props = defineProps<{ active: string; userEmail: string }>()
const emit = defineEmits<{ (e: 'logout'): void }>()

const active = ref(props.active)

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'analysis', label: 'Análisis y Predicción', icon: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z' },
  { id: 'dependencies', label: 'Dependencias', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { id: 'properties', label: 'Inmuebles', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { id: 'import', label: 'Carga de Consumos', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
  { id: 'budgets', label: 'Presupuestos', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z' },
  { id: 'users', label: 'Usuarios', icon: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm9 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.05 1.97 3.45v2h6v-2c0-2.66-5.33-4-8-4z' },
]

const activeItem = computed(() => navItems.find(i => i.id === active.value) || navItems[0])

const handleClick = (id: string) => {
  active.value = id
  emit('navigate', id)
}
</script>
