<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import Modal from '../Modal.vue'
import { api, type Dependencia, type Edificio } from '../../services/api'

// Estado
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

// Datos
const dependencias = ref<Dependencia[]>([])
const edificios = ref<Edificio[]>([])
const selectedDepId = ref<number | null>(null) // Filtro principal

// Estado de errores
const errors = ref<Record<string, string[]>>({})

// Formulario de Edificio
const form = reactive({
  id_edificio: 0,
  dependencia_id: 0,
  nombre_edificio: '',
  direccion: '',
  latitud: '',
  longitud: '',
  caracteristicas: ''
})

onMounted(async () => {
  await fetchDependencias()
})

// Cargar catálogo de dependencias para el filtro
async function fetchDependencias() {
  try {
    dependencias.value = await api.getDependencias()
  } catch (error) {
    console.error("Error cargando dependencias:", error)
  }
}

// Observar cambio en el filtro para cargar edificios
watch(selectedDepId, async (newId) => {
  if (newId) {
    await fetchEdificios(newId)
  } else {
    edificios.value = []
  }
})

async function fetchEdificios(depId: number) {
  loading.value = true
  try {
    edificios.value = await api.getEdificiosByDependencia(depId)
  } catch (error) {
    console.error("Error cargando edificios:", error)
  } finally {
    loading.value = false
  }
}

// === MODALES Y CRUD ===

function openCreateModal() {
  if (!selectedDepId.value) return alert("Selecciona una dependencia primero.")
  
  isEditing.value = false
  resetForm()
  form.dependencia_id = selectedDepId.value // Asignamos automáticamente la dependencia seleccionada
  showModal.value = true
}

function openEditModal(edificio: Edificio) {
  isEditing.value = true
  resetForm()
  // Llenar formulario
  form.id_edificio = edificio.id_edificio
  form.dependencia_id = edificio.dependencia_id
  form.nombre_edificio = edificio.nombre_edificio
  form.direccion = edificio.direccion
  form.latitud = edificio.latitud || ''
  form.longitud = edificio.longitud || ''
  form.caracteristicas = edificio.caracteristicas || ''
  showModal.value = true
}

async function handleSubmit() {
  errors.value = {}
  try {
    if (isEditing.value) {
      await api.updateEdificio(form.id_edificio, form)
    } else {
      await api.createEdificio(form.dependencia_id, form)
    }
    
    // Recargar tabla
    if (selectedDepId.value) await fetchEdificios(selectedDepId.value)
    closeModal()
  } catch (error: any) {
    if (error.status === 422 && error.data.errors) {
      errors.value = error.data.errors
    } else {
      console.error("Error desconocido:", error)
      alert("Error al guardar inmueble.")
    }
  }
}

async function handleDelete(edificio: Edificio) {
  if (!confirm(`¿Eliminar el edificio "${edificio.nombre_edificio}"?`)) return

  try {
    await api.deleteEdificio(edificio.id_edificio)
    // Actualizar lista local
    edificios.value = edificios.value.filter(e => e.id_edificio !== edificio.id_edificio)
  } catch (error) {
    console.error("Error eliminando:", error)
    alert("No se pudo eliminar el edificio.")
  }
}

function resetForm() {
  form.id_edificio = 0
  form.nombre_edificio = ''
  form.direccion = ''
  form.latitud = ''
  form.longitud = ''
  form.caracteristicas = ''
  errors.value = {}
}

function closeModal() {
  showModal.value = false
  resetForm()
}
</script>

<template>
  <div class="p-8 space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Inmuebles</h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">Selecciona una dependencia para gestionar sus edificios.</p>
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
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
          Nuevo
        </button>
      </div>
    </div>

    <div v-if="!selectedDepId" class="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
      <p class="text-slate-500 dark:text-slate-400">Selecciona una dependencia arriba para ver sus inmuebles.</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Cargando inmuebles...</div>
      
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Nombre del Edificio</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Dirección</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Características</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Coordenadas</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="edificios.length === 0">
            <td colspan="5" class="p-6 text-center text-slate-500">No se encontraron edificios para esta dependencia.</td>
          </tr>
          <tr v-for="edificio in edificios" :key="edificio.id_edificio" class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ edificio.nombre_edificio }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" :title="edificio.direccion">{{ edificio.direccion }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ edificio.caracteristicas || '-' }}</td>
            <td class="px-6 py-4 text-center text-xs font-mono text-slate-500">
              <span v-if="edificio.latitud && edificio.longitud">
                {{ edificio.latitud }}, {{ edificio.longitud }}
              </span>
              <span v-else class="text-slate-400">N/A</span>
            </td>
            <td class="px-6 py-4 text-center space-x-2">
              <button @click="openEditModal(edificio)" class="text-slate-600 hover:text-primary-600 transition-colors">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
              </button>
              <button @click="handleDelete(edificio)" class="text-slate-600 hover:text-red-600 transition-colors">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" :title="isEditing ? 'Editar Inmueble' : 'Nuevo Inmueble'" @close="closeModal">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          Agregando a: <strong>{{ dependencias.find(d => d.id_dependencia === selectedDepId)?.nombre_dependencia }}</strong>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Edificio *</label>
          <input
            v-model="form.nombre_edificio"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 focus:border-primary-500 outline-none dark:text-white"
          />
          <p v-if="errors.nombre_edificio" class="text-xs text-red-600 mt-1">{{ errors.nombre_edificio[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Dirección *</label>
          <input
            v-model="form.direccion"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 focus:border-primary-500 outline-none dark:text-white"
          />
          <p v-if="errors.direccion" class="text-xs text-red-600 mt-1">{{ errors.direccion[0] }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Latitud</label>
            <input
              v-model="form.latitud"
              type="text"
              placeholder="18.5000"
              class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 focus:border-primary-500 outline-none dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Longitud</label>
            <input
              v-model="form.longitud"
              type="text"
              placeholder="-88.3000"
              class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 focus:border-primary-500 outline-none dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Características</label>
          <textarea
            v-model="form.caracteristicas"
            rows="3"
            placeholder="Ej. Oficinas administrativas, bodega..."
            class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 focus:border-primary-500 outline-none dark:text-white"
          ></textarea>
        </div>

        <div class="flex gap-3 justify-end pt-2">
          <button type="button" @click="closeModal" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>