<template>
  <section class="container py-12">
    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
      <h2 class="text-2xl font-semibold text-slate-900">Módulo de Transparencia</h2>
      <p class="mt-2 text-slate-600 max-w-3xl">
        Consulta ciudadana del consumo y gasto energético por dependencia. Esta sección expone indicadores clave y
        series históricas consumidas desde una API pública conforme al Núcleo Digital de Gobierno.
      </p>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="rounded-xl border border-slate-200 p-5">
          <p class="text-sm font-semibold text-slate-900">Indicadores abiertos</p>
          <p class="mt-1 text-sm text-slate-600">Consumo total, gasto y eficiencia por kWh.</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-5">
          <p class="text-sm font-semibold text-slate-900">Descarga de datos</p>
          <p class="mt-1 text-sm text-slate-600">Exportación en CSV y JSON desde la API.</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-5">
          <p class="text-sm font-semibold text-slate-900">Comparativas</p>
          <p class="mt-1 text-sm text-slate-600">Benchmarking entre dependencias y periodos.</p>
        </div>
      </div>
      <div class="mt-6">
        <a href="#" class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white shadow-soft hover:bg-primary-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M5 20h14v-2H5v2zM5 4v8h4v8h6v-8h4V4H5z"/></svg>
          Documentación de API
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
