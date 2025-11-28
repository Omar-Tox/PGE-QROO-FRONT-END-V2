<template>
  <div class="p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Dashboard: {{ selectedDep }}
      </h2>
      <select
        v-model="selectedDep"
        class="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
      >
        <option>Secretaría de Finanzas</option>
        <option>Secretaría de Salud</option>
        <option>Secretaría de Educación</option>
      </select>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div
        class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Consumo del Mes
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">150,230 kWh</p>
        <p class="mt-1 text-xs text-green-600">▲ 5.2% vs Mes anterior</p>
      </div>
      <div
        class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Costo del Mes
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">$285,437.00</p>
        <p class="mt-1 text-xs text-red-600">▼ 2.1% vs Mes anterior</p>
      </div>
      <div
        class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Uso del Presupuesto
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">$2.25M / $3.00M</p>
        <div class="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-2 rounded-full bg-accent-500" style="width: 75%"></div>
        </div>
      </div>
      <div
        class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Ahorro vs Año Anterior
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">$30,150.00</p>
        <p class="mt-1 text-xs text-green-600">Octubre 2024</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div
        class="col-span-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 class="font-semibold text-slate-900 dark:text-slate-100">
          Evolución de Consumo y Costo – 12 Meses
        </h3>
        <div
          class="mt-4 h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg"
        >
          <p class="text-slate-400 dark:text-slate-500 text-sm">
            Gráfico de línea (Chart.js / Chart.vue)
          </p>
        </div>
      </div>
      <div
        class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 class="font-semibold text-slate-900 dark:text-slate-100">
          Inmuebles con Mayor Consumo
        </h3>
        <ul class="mt-4 space-y-3">
          <li class="flex items-center justify-between text-sm">
            <span class="text-slate-700 dark:text-slate-300">Edificio Central</span>
            <span class="font-semibold text-slate-900 dark:text-slate-100">45,300 kWh</span>
          </li>
          <li class="flex items-center justify-between text-sm">
            <span class="text-slate-700 dark:text-slate-300">Oficinas Zona Norte</span>
            <span class="font-semibold text-slate-900 dark:text-slate-100">32,500 kWh</span>
          </li>
          <li class="flex items-center justify-between text-sm">
            <span class="text-slate-700 dark:text-slate-300">Archivo General</span>
            <span class="font-semibold text-slate-900 dark:text-slate-100">28,800 kWh</span>
          </li>
          <li class="flex items-center justify-between text-sm">
            <span class="text-slate-700 dark:text-slate-300">Bodega Principal</span>
            <span class="font-semibold text-slate-900 dark:text-slate-100">19,800 kWh</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedDep = ref('Secretaría de Finanzas')
</script>
