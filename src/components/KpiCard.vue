<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-500">{{ label }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ value }}</p>
      </div>
      <div class="h-10 w-10 rounded-lg bg-slate-50 grid place-items-center text-primary-600">
        <slot name="icon">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </slot>
      </div>
    </div>
    <div v-if="caption" class="mt-2 text-xs text-slate-500">{{ caption }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
  caption?: string
}

const props = defineProps<Props>()
</script>
