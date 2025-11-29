<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../../services/api'

const file = ref<File | null>(null)
const isDragging = ref(false)
const loading = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const errorDetails = ref<string[]>([]) // Para mostrar los detalles del 422

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    processFile(input.files[0])
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0])
  }
}

function processFile(selectedFile: File) {
  // Validación simple de tipo (opcional, el backend es el juez final)
  if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
    message.value = { type: 'error', text: 'Solo se permiten archivos CSV o Excel (.xlsx, .xls).' }
    return
  }
  file.value = selectedFile
  message.value = null
  errorDetails.value = []
}

async function uploadFile() {
  if (!file.value) return

  loading.value = true
  message.value = null
  errorDetails.value = []

  try {
    const response = await api.uploadConsumosMasiva(file.value)
    
    // Éxito (201)
    message.value = { 
      type: 'success', 
      text: response.message || 'Datos importados con éxito.' 
    }
    file.value = null // Limpiar archivo
    
    // Opcional: Limpiar mensaje de éxito después de 5 seg
    setTimeout(() => message.value = null, 5000)

  } catch (error: any) {
    console.error("Error subiendo archivo:", error)

    if (error.status === 422) {
      // Error de validación de formato
      message.value = { 
        type: 'error', 
        text: error.data.message || 'El archivo tiene errores de formato.' 
      }
      // Si 'details' es un array de strings o un objeto, lo adaptamos
      if (Array.isArray(error.data.details)) {
        errorDetails.value = error.data.details
      } else if (typeof error.data.details === 'object') {
        errorDetails.value = Object.values(error.data.details).flat() as string[]
      }
    } else if (error.status === 500) {
      // Error de servidor
      message.value = { 
        type: 'error', 
        text: error.data.message || 'Error interno del servidor al leer el archivo.' 
      }
      if (error.data.error) {
        errorDetails.value = [error.data.error] // Mostrar detalle técnico si existe
      }
    } else {
      // Otro error
      message.value = { type: 'error', text: 'Ocurrió un error inesperado al subir el archivo.' }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8 space-y-8">
    <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Carga Masiva de Consumos</h2>
    <p class="text-slate-600 dark:text-slate-300">
      Sube tu archivo CSV o Excel para actualizar el histórico de consumos energéticos.
    </p>

    <div
      class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm"
    >
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Requisitos del archivo:</h4>
        <ul class="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>Formato <strong>.csv</strong> o <strong>.xlsx</strong>.</li>
          <li>Columnas requeridas (ejemplo): <code>id_edificio</code>, <code>anio</code>, <code>mes</code>, <code>consumo_kwh</code>, <code>costo</code>.</li>
          <li>Asegúrate de que los IDs de edificio existan previamente.</li>
        </ul>
      </div>

      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        :class="[
          'relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer',
          isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30'
        ]"
      >
        <input
          type="file"
          ref="fileInput"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          @change="onFileSelect"
          accept=".csv, .xlsx, .xls"
        />
        
        <div v-if="!file" class="pointer-events-none">
          <svg viewBox="0 0 24 24" class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" v-if="false" /> <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>
          <p class="text-slate-900 dark:text-slate-100 font-medium">Arrastra tu archivo aquí</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">o haz clic para seleccionar</p>
        </div>

        <div v-else class="pointer-events-none">
          <svg viewBox="0 0 24 24" class="mx-auto h-12 w-12 text-green-500 mb-4">
            <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          <p class="text-slate-900 dark:text-slate-100 font-semibold">{{ file.name }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ (file.size / 1024).toFixed(2) }} KB</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3" v-if="file">
        <button
          @click="file = null; message = null; errorDetails = []"
          class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          @click="uploadFile"
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-70"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Procesando...' : 'Subir Archivo' }}
        </button>
      </div>

      <div v-if="message" :class="[
        'mt-6 p-4 rounded-lg flex items-start gap-3',
        message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      ]">
        <svg v-if="message.type === 'success'" viewBox="0 0 24 24" class="h-6 w-6 flex-shrink-0"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <svg v-else viewBox="0 0 24 24" class="h-6 w-6 flex-shrink-0"><path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
        
        <div class="flex-1">
          <p class="font-medium">{{ message.text }}</p>
          
          <ul v-if="errorDetails.length > 0" class="mt-2 list-disc list-inside text-sm opacity-90 space-y-1">
            <li v-for="(err, index) in errorDetails" :key="index">{{ err }}</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>