<template>
  <div class="p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900">Presupuestos Asignados</h2>
      <button @click="showModal=true" class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">
        <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Asignar Presupuesto
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-xl bg-white border border-slate-200 p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500">Presupuesto Total Q4 2025</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">$27,100,000</p>
      </div>
      <div class="rounded-xl bg-white border border-slate-200 p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500">Dependencias con Presupuesto</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">5</p>
      </div>
      <div class="rounded-xl bg-white border border-slate-200 p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500">Promedio por Dependencia</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">$5,420,000</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900">Dependencia</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900">Año</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900">Trimestre</th>
            <th class="px-6 py-3 text-right font-semibold text-slate-900">Monto Asignado</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in budgets" :key="b.id" class="border-t border-slate-200">
            <td class="px-6 py-4 text-slate-900">{{ b.dependency }}</td>
            <td class="px-6 py-4 text-slate-700">{{ b.year }}</td>
            <td class="px-6 py-4"><span class="text-blue-600 font-medium">{{ b.quarter }}</span></td>
            <td class="px-6 py-4 text-right font-semibold text-slate-900">{{ formatCurrency(b.amount) }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <button class="text-slate-600 hover:text-primary-600"><svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg></button>
              <button class="text-slate-600 hover:text-red-600"><svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" title="Asignar Nuevo Presupuesto" @close="showModal=false">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Seleccionar Dependencia *</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Secretaría de Finanzas</option>
            <option>Secretaría de Educación</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Año Fiscal *</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Trimestre *</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Q4 (Oct-Dec)</option>
            <option>Q1 (Ene-Mar)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Monto Asignado (MXN) *</label>
          <input type="number" placeholder="0.00" class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div class="flex gap-3 justify-end">
          <button type="button" @click="showModal=false" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Guardar Presupuesto</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../Modal.vue'

const showModal = ref(false)
const budgets = [
  { id: '1', dependency: 'Secretaría de Finanzas', year: 2025, quarter: 'Q4 (Oct-Dec)', amount: 3000000 },
  { id: '2', dependency: 'Secretaría de Educación', year: 2025, quarter: 'Q4 (Oct-Dec)', amount: 8500000 },
  { id: '3', dependency: 'Secretaría de Salud', year: 2025, quarter: 'Q4 (Oct-Dec)', amount: 5200000 },
  { id: '4', dependency: 'Seguridad Pública', year: 2025, quarter: 'Q4 (Oct-Dec)', amount: 4400000 },
  { id: '5', dependency: 'Infraestructura y Obras', year: 2025, quarter: 'Q4 (Oct-Dec)', amount: 6300000 },
]

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
}
</script>
