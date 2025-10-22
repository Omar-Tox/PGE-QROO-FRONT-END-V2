<template>
  <div class="p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900">Dependencias del Estado</h2>
      <button @click="showModal=true" class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">
        <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Añadir Dependencia
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900">Nombre de la Dependencia</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900">Categoría</th>
            <th class="px-6 py-3 text-right font-semibold text-slate-900">Nº de Inmuebles</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dep in dependencies" :key="dep.id" class="border-t border-slate-200">
            <td class="px-6 py-4 text-slate-900">{{ dep.name }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{{ dep.category }}</span>
            </td>
            <td class="px-6 py-4 text-right text-slate-900">{{ dep.properties }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <button class="text-slate-600 hover:text-primary-600">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
              </button>
              <button class="text-slate-600 hover:text-red-600">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" title="Nueva Dependencia" @close="showModal=false">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Nombre de la Dependencia *</label>
          <input type="text" placeholder="Ej. Secretaría de Educación" class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Categoría *</label>
          <select class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Seleccionar categoría</option>
            <option>Finanzas</option>
            <option>Educación</option>
            <option>Salud</option>
          </select>
        </div>
        <div class="flex gap-3 justify-end">
          <button type="button" @click="showModal=false" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Guardar</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../Modal.vue'

const showModal = ref(false)
const dependencies = [
  { id: '1', name: 'Secretaría de Finanzas', category: 'Finanzas', properties: 8 },
  { id: '2', name: 'Secretaría de Educación', category: 'Educación', properties: 45 },
  { id: '3', name: 'Secretaría de Salud', category: 'Salud', properties: 23 },
  { id: '4', name: 'Seguridad Pública', category: 'Seguridad Pública', properties: 12 },
  { id: '5', name: 'Infraestructura y Obras', category: 'Infraestructura', properties: 15 },
]
</script>
