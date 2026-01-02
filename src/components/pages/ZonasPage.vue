<template>
  <div class="p-8 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Zonas sin Electricidad</h2>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Monitoreo de áreas con interrupciones de servicio eléctrico reportadas por usuarios
      </p>
    </div>

    <HeatmapZonas />
  </div>
</template>

<script setup lang="ts">
import HeatmapZonas from '../HeatmapZonas.vue'
</script>
