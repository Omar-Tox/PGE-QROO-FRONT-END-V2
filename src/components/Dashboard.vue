<template>
  <section class="container py-10 md:py-12">
    <div class="flex flex-col gap-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Dependencias" :value="summary.totalDepartments.toString()" />
        <KpiCard label="Consumo total (kWh)" :value="formatNumber(summary.totalKwh)" />
        <KpiCard label="Gasto total" :value="formatCurrency(summary.totalCost)" />
        <KpiCard label="Costo promedio kWh" :value="formatCurrency(summary.avgCostPerKwh)" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div class="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">Tendencia reciente de consumo</h3>
            <select v-model="selected" class="rounded-md border-slate-300 text-sm">
              <option value="all">Todas</option>
              <option v-for="d in data.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="mt-4">
            <BarChartMini :values="chartValues" />
          </div>
          <p class="mt-2 text-xs text-slate-500">Valores normalizados de kWh de los últimos meses.</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 class="text-base font-semibold text-slate-900">Predicción (próximo mes)</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="p in data.predictions" :key="p.departmentId" class="flex items-center justify-between">
              <span class="text-sm text-slate-700">{{ nameById(p.departmentId) }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ formatCurrency(p.predictedCost) }}</span>
            </li>
          </ul>
          <p class="mt-3 text-xs text-slate-500">Estimaciones generadas a partir de tendencias históricas.</p>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="text-base font-semibold text-slate-900">Histórico de consumo</h3>
        <TableEnergy :rows="data.history" :departments="data.departments" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type DashboardPayload } from '../services/api'
import KpiCard from './KpiCard.vue'
import BarChartMini from './BarChartMini.vue'
import TableEnergy from './TableEnergy.vue'

const data = ref<DashboardPayload>({ departments: [], history: [], predictions: [], summary: { totalDepartments: 0, totalKwh: 0, totalCost: 0, avgCostPerKwh: 0 } })
const selected = ref<'all' | string>('all')

onMounted(async () => {
  data.value = await api.getDashboard()
})

const summary = computed(() => data.value.summary)

function nameById(id: string) {
  return data.value.departments.find((d) => d.id === id)?.name || id
}

const chartValues = computed(() => {
  const rows = selected.value === 'all' ? data.value.history : data.value.history.filter((h) => h.departmentId === selected.value)
  const months = Array.from(new Set(rows.map((r) => r.month))).sort()
  return months.map((m) => rows.filter((r) => r.month === m).reduce((a, b) => a + b.kwh, 0))
})

function formatNumber(v: number) {
  return new Intl.NumberFormat('es-MX').format(v)
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
}
</script>
