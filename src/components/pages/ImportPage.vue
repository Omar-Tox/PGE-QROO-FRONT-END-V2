<template>
  <div class="p-8 space-y-8">
    <h2 class="text-2xl font-bold text-slate-900">Carga de Consumos</h2>
    <p class="text-slate-600">Importa datos históricos de consumo energético desde archivos CSV o XLSX.</p>

    <div class="bg-white rounded-xl border border-slate-200 p-8">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-blue-800"><strong>Formato requerido:</strong> CSV o XLSX con columnas: Fecha, Departamento, kWh, Costo.</p>
        <a href="#" class="inline-block mt-2 text-sm text-blue-600 hover:underline">Descargar plantilla de ejemplo</a>
      </div>

      <div class="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:bg-slate-50">
        <svg viewBox="0 0 24 24" class="mx-auto h-12 w-12 text-slate-400"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        <p class="mt-4 text-slate-900 font-medium">Arrastra tu archivo aquí</p>
        <p class="text-sm text-slate-600">o <button type="button" class="text-primary-600 hover:underline font-medium">selecciona un archivo</button></p>
      </div>

      <div class="mt-6">
        <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Seleccionar Archivo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
