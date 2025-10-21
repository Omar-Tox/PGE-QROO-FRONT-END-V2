<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 text-slate-600">
        <tr>
          <th class="px-4 py-3 text-left font-semibold">Dependencia</th>
          <th class="px-4 py-3 text-right font-semibold">Mes</th>
          <th class="px-4 py-3 text-right font-semibold">kWh</th>
          <th class="px-4 py-3 text-right font-semibold">Costo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.departmentId + row.month" class="border-t border-slate-100">
          <td class="px-4 py-3">{{ nameById(row.departmentId) }}</td>
          <td class="px-4 py-3 text-right">{{ row.month }}</td>
          <td class="px-4 py-3 text-right">{{ formatNumber(row.kwh) }}</td>
          <td class="px-4 py-3 text-right">{{ formatCurrency(row.cost) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Department, HistoricalRecord } from '../services/api'

const props = defineProps<{ rows: HistoricalRecord[]; departments: Department[] }>()

function nameById(id: string) {
  return props.departments.find((d) => d.id === id)?.name || id
}

function formatNumber(v: number) {
  return new Intl.NumberFormat('es-MX').format(v)
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
}
</script>
