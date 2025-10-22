<template>
  <div class="p-8 space-y-8">
    <h2 class="text-2xl font-bold text-slate-900">Análisis y Predicción Energética</h2>
    <p class="text-slate-600">Análisis avanzado de consumo y predicciones basadas en datos históricos.</p>

    <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 class="font-semibold text-slate-900">Filtros</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-slate-700">Rango de Fechas</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Últimos 12 meses</option>
            <option>Últimos 6 meses</option>
            <option>Últimos 3 meses</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700">Dependencia</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Secretaría de Finanzas</option>
            <option>Secretaría de Salud</option>
            <option>Secretaría de Educación</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700">Categoría</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Todas las Categorías</option>
            <option>Edificios</option>
            <option>Equipos</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="rounded-xl bg-white border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900">Predicción de Gasto para los Próximos 6 Meses</h3>
        <div class="mt-4 h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p class="text-slate-400 text-sm">Gráfico de predicción (Chart.js)</p>
        </div>
      </div>
      <div class="rounded-xl bg-white border border-slate-200 p-6 bg-green-50/30">
        <h3 class="font-semibold text-slate-900">Pronóstico</h3>
        <div class="mt-4 h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p class="text-slate-400 text-sm">Gráfico de pronóstico con intervalo de confianza</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
