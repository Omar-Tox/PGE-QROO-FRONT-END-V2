<template>
  <div class="space-y-6">
    <!-- Map Container -->
    <div
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft overflow-hidden"
    >
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Mapa de Zonas sin Electricidad
      </h2>
      <p class="text-slate-600 dark:text-slate-400 mb-6">
        Visualización de áreas reportadas por usuarios con interrupciones de servicio eléctrico en
        Quintana Roo
      </p>

      <!-- Leaflet Map -->
      <div
        ref="mapContainer"
        class="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm"
      />

      <!-- Legend -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded" style="background-color: #d32f2f" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Crítico (70-100)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded" style="background-color: #f57c00" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Alto (50-69)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded" style="background-color: #fbc02d" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Medio (30-49)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded" style="background-color: #ffee58" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Bajo (10-29)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded" style="background-color: #c5e1a5" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Normal (&lt;10)</span>
        </div>
      </div>
    </div>

    <!-- Zones Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Zonas Críticas</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">2</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 grid place-items-center">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4v2m0 4v2M6.343 3.665c1.932-.576 4.073-.576 6.012 0 2.397.686 4.413 2.328 5.416 4.589 1.004 2.26 1.004 4.861 0 7.12-.884 2.16-2.307 3.805-4.004 4.686"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Zonas Alerta</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">3</p>
          </div>
          <div
            class="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 grid place-items-center"
          >
            <svg
              class="h-6 w-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4v2m0 0v2M6.343 3.665c1.932-.576 4.073-.576 6.012 0 2.397.686 4.413 2.328 5.416 4.589 1.004 2.26 1.004 4.861 0 7.12-.884 2.16-2.307 3.805-4.004 4.686"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reportes</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">427</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 grid place-items-center">
            <svg
              class="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports Table -->
    <div
      class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft"
    >
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Reportes Recientes
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Zona
              </th>
              <th class="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Ubicación
              </th>
              <th class="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Severidad
              </th>
              <th class="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Reportes
              </th>
              <th class="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Última Actualización
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 1</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Centro Histórico</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-200"
                >
                  Crítico
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">78</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 15 min</td>
            </tr>
            <tr
              class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 2</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Playa del Carmen</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-800 dark:text-orange-200"
                >
                  Alto
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">56</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 23 min</td>
            </tr>
            <tr
              class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 3</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Cozumel</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-200"
                >
                  Crítico
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">92</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 8 min</td>
            </tr>
            <tr
              class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 4</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Felipe Carrillo Puerto</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-800 dark:text-orange-200"
                >
                  Alto
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">34</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 31 min</td>
            </tr>
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 5</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Isla Mujeres</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200"
                >
                  Medio
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">45</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 42 min</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

const mapContainer = ref<HTMLDivElement | null>(null)

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
}

const zones: HeatmapPoint[] = [
  // Chetumal area (critical)
  { lat: 18.4986, lng: -88.3092, intensity: 0.95 },
  { lat: 18.5, lng: -88.31, intensity: 0.92 },

  // Playa del Carmen area (high)
  { lat: 20.6296, lng: -87.0739, intensity: 0.75 },
  { lat: 20.63, lng: -87.07, intensity: 0.72 },
  { lat: 20.64, lng: -87.08, intensity: 0.7 },

  // Cancún area (medium-high)
  { lat: 21.1619, lng: -86.8515, intensity: 0.58 },
  { lat: 21.16, lng: -86.85, intensity: 0.55 },
  { lat: 21.17, lng: -86.86, intensity: 0.52 },

  // Tulum area (medium)
  { lat: 20.2108, lng: -87.4256, intensity: 0.45 },
  { lat: 20.21, lng: -87.42, intensity: 0.42 },

  // Cozumel area (critical)
  { lat: 20.5, lng: -87.05, intensity: 0.88 },
  { lat: 20.51, lng: -87.06, intensity: 0.85 },

  // Isla Mujeres area (low)
  { lat: 21.2306, lng: -86.7314, intensity: 0.25 },

  // Felipe Carrillo Puerto area (high)
  { lat: 19.5826, lng: -87.7582, intensity: 0.68 },
  { lat: 19.58, lng: -87.76, intensity: 0.65 },

  // Additional scattered points across the state
  { lat: 20.1, lng: -87.5, intensity: 0.35 },
  { lat: 20.3, lng: -87.3, intensity: 0.3 },
  { lat: 20.7, lng: -87.2, intensity: 0.4 },
  { lat: 20.9, lng: -87.0, intensity: 0.28 },
  { lat: 19.8, lng: -87.8, intensity: 0.32 },
]

onMounted(() => {
  if (!mapContainer.value) return

  // Create map centered on Quintana Roo
  const map = L.map(mapContainer.value).setView([20.5, -87.3], 8)

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    maxNativeZoom: 19,
  }).addTo(map)

  // Prepare heatmap data: [lat, lng, intensity]
  const heatData = zones.map((zone) => [zone.lat, zone.lng, zone.intensity])

  // Add heatmap layer
  ;(L.heatLayer as any)(heatData, {
    radius: 50,
    blur: 25,
    maxZoom: 17,
    max: 1.0,
    minOpacity: 0.4,
    gradient: {
      0.0: '#c5e1a5', // Light green - Low intensity
      0.2: '#ffee58', // Yellow - Low-medium
      0.4: '#fbc02d', // Darker yellow - Medium
      0.6: '#f57c00', // Orange - High
      1.0: '#d32f2f', // Red - Critical
    },
  }).addTo(map)

  // Add markers for major zones
  const majorZones = [
    { name: 'Chetumal', lat: 18.4986, lng: -88.3092, severity: 'Crítico' },
    { name: 'Playa del Carmen', lat: 20.6296, lng: -87.0739, severity: 'Alto' },
    { name: 'Cancún', lat: 21.1619, lng: -86.8515, severity: 'Medio' },
    { name: 'Cozumel', lat: 20.5, lng: -87.05, severity: 'Crítico' },
    { name: 'Isla Mujeres', lat: 21.2306, lng: -86.7314, severity: 'Bajo' },
    { name: 'Felipe Carrillo Puerto', lat: 19.5826, lng: -87.7582, severity: 'Alto' },
  ]

  majorZones.forEach((zone) => {
    const color =
      zone.severity === 'Crítico'
        ? '#d32f2f'
        : zone.severity === 'Alto'
          ? '#f57c00'
          : zone.severity === 'Medio'
            ? '#fbc02d'
            : zone.severity === 'Bajo'
              ? '#ffee58'
              : '#c5e1a5'

    L.circleMarker([zone.lat, zone.lng], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .bindPopup(`<strong>${zone.name}</strong><br/>Severidad: ${zone.severity}`)
      .addTo(map)
  })
})
</script>
