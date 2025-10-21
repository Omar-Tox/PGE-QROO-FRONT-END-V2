<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="container flex h-16 items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center shadow-soft">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-white"><path fill="currentColor" d="M12 2l3.5 6H20l-3.5 6L20 20h-4.5L12 14l-3.5 6H4l3.5-6L4 8h4.5z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-slate-800 leading-tight">PGE-QROO</p>
          <p class="text-xs text-slate-500 -mt-0.5">Gestión y Predicción Energética</p>
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <button :class="navClass('inicio')" @click="$emit('navigate','inicio')">Inicio</button>
        <button :class="navClass('dashboard')" @click="$emit('navigate','dashboard')">Dashboard</button>
        <button :class="navClass('publico')" @click="$emit('navigate','publico')">Transparencia</button>
      </nav>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{ active: 'inicio' | 'dashboard' | 'publico' }>()

function navClass(key: 'inicio' | 'dashboard' | 'publico') {
  const base = 'px-2 py-1.5 rounded-md transition-colors'
  return [
    base,
    props.active === key
      ? 'text-slate-900 bg-slate-100'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
  ]
}
</script>
