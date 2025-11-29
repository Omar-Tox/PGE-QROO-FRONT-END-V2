<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import Modal from '../Modal.vue'
import { api, type Dependencia, type Presupuesto } from '../../services/api'

// Estado
const loading = ref(false)
const showModal = ref(false)
const dependencias = ref<Dependencia[]>([])
const presupuestos = ref<Presupuesto[]>([])
const selectedDepId = ref<number | null>(null)

// Formulario
const form = reactive({
  año: new Date().getFullYear(),
  trimestre: 1,
  monto_asignado: 0
})

const errors = ref<Record<string, string[]>>({})

// Cargar dependencias al inicio
onMounted(async () => {
  try {
    dependencias.value = await api.getDependencias()
  } catch (e) {
    console.error("Error cargando dependencias", e)
  }
})

// Cargar presupuestos al cambiar la dependencia
watch(selectedDepId, async (newId) => {
  if (newId) {
    await fetchPresupuestos(newId)
  } else {
    presupuestos.value = []
  }
})

async function fetchPresupuestos(depId: number) {
  loading.value = true
  try {
    presupuestos.value = await api.getPresupuestosByDependencia(depId)
  } catch (e) {
    console.error("Error cargando presupuestos", e)
  } finally {
    loading.value = false
  }
}

// Acciones del Modal
function openCreateModal() {
  if (!selectedDepId.value) return alert("Selecciona una dependencia primero.")
  
  // Reset form
  form.año = new Date().getFullYear()
  form.trimestre = 1
  form.monto_asignado = 0
  errors.value = {}
  
  showModal.value = true
}

async function handleSubmit() {
  if (!selectedDepId.value) return
  errors.value = {}

  try {
    const nuevo = await api.createPresupuesto(selectedDepId.value, {
      año: form.año,
      trimestre: form.trimestre,
      monto_asignado: form.monto_asignado
    })
    
    presupuestos.value.push(nuevo)
    showModal.value = false
  } catch (error: any) {
    if (error.status === 422 && error.data.errors) {
      errors.value = error.data.errors
    } else {
      console.error("Error guardando presupuesto:", error)
      alert("Error al asignar el presupuesto.")
    }
  }
}

async function handleDelete(item: Presupuesto) {
  if (!confirm(`¿Eliminar presupuesto del ${item.año} (T${item.trimestre})?`)) return
  
  try {
    await api.deletePresupuesto(item.id_presupuesto)
    presupuestos.value = presupuestos.value.filter(p => p.id_presupuesto !== item.id_presupuesto)
  } catch (e) {
    alert("No se pudo eliminar el presupuesto.")
  }
}

// Formateadores
function formatCurrency(val: string | number) {
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN' 
  }).format(Number(val))
}

function trimestreLabel(t: number) {
  const map = { 1: 'Ene - Mar', 2: 'Abr - Jun', 3: 'Jul - Sep', 4: 'Oct - Dic' }
  return `Trimestre ${t} (${map[t as keyof typeof map] || ''})`
}
</script>

<template>
  <div class="p-8 space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Asignación de Presupuestos</h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">Gestiona el presupuesto trimestral asignado a cada dependencia.</p>
      </div>

      <div class="flex items-center gap-3">
        <select 
          v-model="selectedDepId"
          class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm min-w-[250px] focus:ring-primary-500"
        >
          <option :value="null">-- Seleccionar Dependencia --</option>
          <option v-for="dep in dependencias" :key="dep.id_dependencia" :value="dep.id_dependencia">
            {{ dep.nombre_dependencia }}
          </option>
        </select>

        <button
          @click="openCreateModal"
          :disabled="!selectedDepId"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          Asignar
        </button>
      </div>
    </div>

    <div v-if="!selectedDepId" class="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
      <p class="text-slate-500 dark:text-slate-400">Selecciona una dependencia para ver su historial presupuestal.</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Cargando datos...</div>
      
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Año</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Periodo</th>
            <th class="px-6 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">Monto Asignado</th>

          </tr>
        </thead>
        <tbody>
          <tr v-if="presupuestos.length === 0">
            <td colspan="4" class="p-6 text-center text-slate-500">No hay presupuestos asignados para esta dependencia.</td>
          </tr>
          <tr v-for="p in presupuestos" :key="p.id_presupuesto" class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ p.año }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
              <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                {{ trimestreLabel(p.trimestre) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
              {{ formatCurrency(p.monto_asignado) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" title="Asignar Nuevo Presupuesto" @close="showModal = false">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300 mb-4">
          Asignando a: <strong>{{ dependencias.find(d => d.id_dependencia === selectedDepId)?.nombre_dependencia }}</strong>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Año Fiscal</label>
            <input
              v-model.number="form.año"
              type="number"
              min="2020"
              max="2030"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white"
            />
            <p v-if="errors.año" class="text-xs text-red-600 mt-1">{{ errors.año[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Trimestre</label>
            <select
              v-model.number="form.trimestre"
              class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white"
            >
              <option :value="1">Q1 (Ene - Mar)</option>
              <option :value="2">Q2 (Abr - Jun)</option>
              <option :value="3">Q3 (Jul - Sep)</option>
              <option :value="4">Q4 (Oct - Dic)</option>
            </select>
            <p v-if="errors.trimestre" class="text-xs text-red-600 mt-1">{{ errors.trimestre[0] }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto Asignado (MXN)</label>
          <div class="relative mt-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">$</span>
            <input
              v-model.number="form.monto_asignado"
              type="number"
              step="0.01"
              required
              class="block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 pl-7 pr-3 py-2 outline-none focus:border-primary-500 dark:text-white"
            />
          </div>
          <p v-if="errors.monto_asignado" class="text-xs text-red-600 mt-1">{{ errors.monto_asignado[0] }}</p>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Guardar Asignación</button>
        </div>
      </form>
    </Modal>
  </div>
</template>