<template>
  <div class="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-soft border border-slate-200">
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <svg viewBox="0 0 24 24" class="h-6 w-6"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
        </button>
      </div>
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
defineEmits<{ (e: 'close'): void }>()
</script>
