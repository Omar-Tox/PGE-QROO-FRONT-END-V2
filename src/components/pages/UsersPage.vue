<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import Modal from '../Modal.vue'
import { api, type User, type Dependencia, type Rol } from '../../services/api'

// Estado
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const users = ref<any[]>([]) // Usamos any para flexibilidad con la estructura anidada
const dependencias = ref<Dependencia[]>([])
const roles = ref<Rol[]>([])

// Estado de errores
const errors = ref<Record<string, string[]>>({})

// Formulario
const form = reactive({
  id: 0,
  nombre: '',
  apellido: '',
  nombre_usuario: '',
  email: '',
  contrasena: '',
  rol_id: null as number | null,
  dependencia_id: null as number | null
})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const [rawUsers, rawDeps, rawRoles] = await Promise.all([
      api.getUsuarios(),
      api.getDependencias(),
      api.getRoles()
    ])
    
    // Normalizamos y filtramos datos válidos
    users.value = extractData(rawUsers).map(u => normalizeItem(u)).filter(u => !!u)
    dependencias.value = extractData(rawDeps).map(d => normalizeItem(d)).filter(d => !!d)
    roles.value = extractData(rawRoles).map(r => normalizeItem(r)).filter(r => !!r)
    
  } catch (error) {
    console.error("Error cargando datos:", error)
  } finally {
    loading.value = false
  }
}

// === UTILIDADES ===

// Extrae array de respuestas tipo Laravel Resource { data: [...] }
function extractData(response: any): any[] {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

// Desempaqueta si viene en array unitario [[{...}]]
function normalizeItem(raw: any): any {
  if (!raw) return null
  if (Array.isArray(raw)) return raw.length > 0 ? raw[0] : null
  return raw
}

function getInitial(user: any): string {
  if (!user) return '?'
  const name = user.nombre || user.nombre_usuario || '?'
  return name.charAt(0).toUpperCase()
}

function getUserId(user: any): number {
  if (!user) return 0
  return user.id || user.id_usuario || 0
}

// === MODALES Y CRUD ===

function openCreateModal() {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

function openEditModal(rawUser: any) {
  const user = normalizeItem(rawUser)
  const id = getUserId(user)

  if (!id) return alert("Error: ID de usuario no encontrado.")

  isEditing.value = true
  resetForm()
  
  // Cargar datos básicos
  form.id = id
  form.nombre = user.nombre || ''
  form.apellido = user.apellido || ''
  form.nombre_usuario = user.nombre_usuario || ''
  form.email = user.email || ''
  form.contrasena = '' 
  
  // Pre-llenar Rol y Dependencia (basado en tu JSON)
  // El JSON muestra arrays: "roles": [{ id_rol: 2... }], "dependencias": [{ id_dependencia: 2... }]
  if (user.roles && user.roles.length > 0) {
    form.rol_id = user.roles[0].id_rol || user.roles[0].id
  }
  
  if (user.dependencias && user.dependencias.length > 0) {
    form.dependencia_id = user.dependencias[0].id_dependencia || user.dependencias[0].id
  }

  showModal.value = true
}

async function handleSubmit() {
  errors.value = {}
  
  // Validación manual al crear
  if (!isEditing.value) {
    if (!form.rol_id) errors.value = { ...errors.value, 'asignaciones.rol_id': ['El rol es obligatorio.'] }
    if (!form.dependencia_id) errors.value = { ...errors.value, 'asignaciones.dependencia_id': ['La dependencia es obligatoria.'] }
    
    if (Object.keys(errors.value).length > 0) return
  }

  // Payload
  const payload: any = {
    nombre_usuario: form.nombre_usuario,
    nombre: form.nombre,
    apellido: form.apellido,
    email: form.email,
  }

  // Enviamos asignaciones si se seleccionaron
  if (form.rol_id && form.dependencia_id) {
    payload.asignaciones = [{
        rol_id: form.rol_id,
        dependencia_id: form.dependencia_id
    }]
  }

  if (!isEditing.value || form.contrasena) {
    payload.contrasena = form.contrasena
  }

  try {
    if (isEditing.value) {
      await api.updateUsuario(form.id, payload)
    } else {
      await api.createUsuario(payload)
    }
    
    await fetchData()
    closeModal()

  } catch (error: any) {
    console.error("Error submit:", error)
    if (error.status === 422 && error.data.errors) {
      errors.value = error.data.errors
    } else {
      alert("Error al guardar: " + (error.data?.message || "Revisa la consola"))
    }
  }
}

async function handleDelete(rawUser: any) {
  const user = normalizeItem(rawUser)
  if (!confirm(`¿Estás seguro de eliminar a "${user.nombre}"?`)) return

  const id = getUserId(user)
  try {
    await api.deleteUsuario(id)
    users.value = users.value.filter(u => getUserId(u) !== id)
  } catch (error) {
    alert("No se pudo eliminar el usuario.")
  }
}

function resetForm() {
  form.id = 0
  form.nombre = ''
  form.apellido = ''
  form.nombre_usuario = ''
  form.email = ''
  form.contrasena = ''
  form.rol_id = null
  form.dependencia_id = null
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
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Usuarios</h2>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700 transition-colors"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
        Nuevo Usuario
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Cargando usuarios...</div>
      
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Nombre Completo</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Usuario</th>
            <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Email</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Roles</th>
            <th class="px-6 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="5" class="p-6 text-center text-slate-500">No hay usuarios registrados.</td>
          </tr>
          
          <tr
            v-for="(user, index) in users"
            :key="getUserId(user) || index"
            class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 grid place-items-center font-bold text-xs">
                  {{ getInitial(user) }}
                </div>
                <div>
                  {{ user.nombre || 'Sin Nombre' }} {{ user.apellido || '' }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{{ user.nombre_usuario || '-' }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ user.email || '-' }}</td>
            
            <td class="px-6 py-4 text-center">
              <span v-if="user.roles && user.roles.length > 0" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {{ user.roles[0].nombre_rol || user.roles[0].nombre }}
              </span>
              <span v-else class="text-slate-400 text-xs">-</span>
            </td>

            <td class="px-6 py-4 text-center space-x-2">
              <button @click="openEditModal(user)" class="text-slate-600 hover:text-primary-600 transition-colors" title="Editar">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
              </button>
              <button @click="handleDelete(user)" class="text-slate-600 hover:text-red-600 transition-colors" title="Eliminar">
                <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="showModal" :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'" @close="closeModal">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre *</label>
            <input v-model="form.nombre" type="text" required class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white" />
            <p v-if="errors.nombre" class="text-xs text-red-600 mt-1">{{ errors.nombre[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido *</label>
            <input v-model="form.apellido" type="text" required class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white" />
            <p v-if="errors.apellido" class="text-xs text-red-600 mt-1">{{ errors.apellido[0] }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de Usuario *</label>
          <input v-model="form.nombre_usuario" type="text" required class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white" />
          <p v-if="errors.nombre_usuario" class="text-xs text-red-600 mt-1">{{ errors.nombre_usuario[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico *</label>
          <input v-model="form.email" type="email" required class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white" />
          <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email[0] }}</p>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
          <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ isEditing ? 'Actualizar Asignación' : 'Asignación Inicial' }}
          </h4>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
            <select v-model="form.rol_id" class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white">
              <option :value="null">-- Seleccionar Rol --</option>
              <option v-for="rol in roles" :key="rol.id || (rol as any).id_rol" :value="rol.id || (rol as any).id_rol">
                {{ rol.nombre || (rol as any).nombre_rol }}
              </option>
            </select>
            <p v-if="errors['asignaciones.rol_id']" class="text-xs text-red-600 mt-1">{{ errors['asignaciones.rol_id'][0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Dependencia</label>
            <select v-model="form.dependencia_id" class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white">
              <option :value="null">-- Seleccionar Dependencia --</option>
              <option v-for="dep in dependencias" :key="dep.id_dependencia" :value="dep.id_dependencia">
                {{ dep.nombre_dependencia }}
              </option>
            </select>
            <p v-if="errors['asignaciones.dependencia_id']" class="text-xs text-red-600 mt-1">{{ errors['asignaciones.dependencia_id'][0] }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Contraseña <span v-if="!isEditing">*</span> <span v-else class="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input v-model="form.contrasena" type="password" :required="!isEditing" class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 outline-none focus:border-primary-500 dark:text-white" placeholder="••••••••" />
          <p v-if="errors.contrasena" class="text-xs text-red-600 mt-1">{{ errors.contrasena[0] }}</p>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <button type="button" @click="closeModal" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {{ isEditing ? 'Actualizar' : 'Crear Usuario' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>