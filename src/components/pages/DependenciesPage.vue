<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import Modal from '../Modal.vue'
import { api, type Dependencia, type Sector } from '../../services/api' // Importamos tipo Sector

// Estado
const showModal = ref(false)
const loading = ref(false)
const dependencies = ref<Dependencia[]>([])
const sectores = ref<Sector[]>([]) // Estado para guardar la lista de sectores
const isEditing = ref(false)

// Estado de errores
const errors = ref<Record<string, string[]>>({})

const form = reactive({
  id_dependencia: 0,
  nombre_dependencia: '',
  sector_id: null as number | null // Inicializamos como null para el select
})

// Cargar datos al montar
onMounted(async () => {
  loading.value = true
  // Hacemos las dos peticiones en paralelo para ser más eficientes
  await Promise.all([
    fetchDependencies(),
    fetchSectores()
  ])
  loading.value = false
})

async function fetchDependencies() {
  try {
    dependencies.value = await api.getDependencias()
  } catch (error) {
    console.error("Error cargando dependencias:", error)
  }
}

async function fetchSectores() {
  try {
    sectores.value = await api.getSectores()
  } catch (error) {
    console.error("Error cargando sectores:", error)
  }
}

function openCreateModal() {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

function openEditModal(dep: Dependencia) {
  isEditing.value = true
  resetForm()
  form.id_dependencia = dep.id_dependencia
  form.nombre_dependencia = dep.nombre_dependencia
  form.sector_id = dep.sector_id
  showModal.value = true
}

async function handleSubmit() {
  errors.value = {}
  
  // Validación manual simple antes de enviar
  if (!form.sector_id) {
    errors.value = { sector_id: ['Debes seleccionar un sector válido.'] }
    return
  }

  try {
    if (isEditing.value) {
      await api.updateDependencia(form.id_dependencia, {
        nombre_dependencia: form.nombre_dependencia,
        sector_id: form.sector_id
      })
      await fetchDependencies() 
    } else {
      const newDep = await api.createDependencia({
        nombre_dependencia: form.nombre_dependencia,
        sector_id: form.sector_id
      })
      dependencies.value.push(newDep)
    }
    
    closeModal()
  } catch (error: any) {
    if (error.status === 422 && error.data.errors) {
      errors.value = error.data.errors
    } else {
      console.error("Error desconocido:", error)
      alert("Ocurrió un error inesperado.")
    }
  }
}

async function handleDelete(dep: Dependencia) {
  if (!confirm(`¿Estás seguro de eliminar "${dep.nombre_dependencia}"?`)) return

  try {
    await api.deleteDependencia(dep.id_dependencia)
    dependencies.value = dependencies.value.filter(d => d.id_dependencia !== dep.id_dependencia)
  } catch (error) {
    console.error("Error eliminando:", error)
    alert("No se pudo eliminar la dependencia.")
  }
}

function resetForm() {
  form.id_dependencia = 0
  form.nombre_dependencia = ''
  form.sector_id = null
  errors.value = {}
}

function closeModal() {
  showModal.value = false
  resetForm()
}
</script>

<template>
  <div class="p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Dependencias del Estado</h2>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700 transition-colors"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
        Añadir Dependencia
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Cargando datos...</div>
      
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Nombre</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Sector</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Edificios</th>
            <th class="px-6 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">Alta</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dependencies.length === 0">
            <td colspan="5" class="p-6 text-center text-slate-500">No hay dependencias registradas.</td>
          </tr>
          <tr
            v-for="dep in dependencies"
            :key="dep.id_dependencia"
            class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td class="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{{ dep.nombre_dependencia }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {{ dep.sector?.nombre_sector || 'Sin sector' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{{ dep.edificios_count }}</td>
            <td class="px-6 py-4 text-right text-slate-500 text-xs font-mono">{{ new Date(dep.fecha_alta).toLocaleDateString() }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <button @click="openEditModal(dep)" class="text-slate-600 hover:text-primary-600 transition-colors" title="Editar">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" :title="isEditing ? 'Editar Dependencia' : 'Nueva Dependencia'" @close="closeModal">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de la Dependencia *</label>
          <input
            v-model="form.nombre_dependencia"
            type="text"
            required
            :class="[
              'mt-1 block w-full rounded-lg border px-3 py-2 outline-none focus:ring-primary-500',
              errors.nombre_dependencia 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:border-primary-500'
            ]"
          />
          <p v-if="errors.nombre_dependencia" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ errors.nombre_dependencia[0] }}
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Sector *</label>
          <select
            v-model="form.sector_id"
            required
            :class="[
              'mt-1 block w-full rounded-lg border px-3 py-2 outline-none focus:ring-primary-500 bg-white dark:bg-slate-700 dark:text-slate-100',
              errors.sector_id
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-300 dark:border-slate-600 focus:border-primary-500'
            ]"
          >
            <option :value="null" disabled>-- Selecciona un sector --</option>
            <option 
              v-for="sector in sectores" 
              :key="sector.id_sector" 
              :value="sector.id_sector"
            >
              {{ sector.nombre_sector }}
            </option>
          </select>
          
          <p v-if="errors.sector_id" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ errors.sector_id[0] }}
          </p>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <button type="button" @click="closeModal" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>