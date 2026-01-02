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

  // Example zone data with descriptions and images
  const zoneData: { [key: string]: { description: string; image: string } } = {
    Chetumal:
      {
        description:
          'Corte de luz en el centro histórico. Afectados aproximadamente 2,500 hogares. Reportado por ciudadano anónimo el 2 de enero a las 14:30 horas. Causa probable: falla en subestación principal.',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=200&fit=crop',
      },
    'Playa del Carmen':
      {
        description:
          'Interrupción de servicio en zona hotelera. Más de 8 hoteles sin energía eléctrica. Reportado a las 11:15 horas. Equipo de mantenimiento ya en sitio realizando inspecciones.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      },
    Cancún:
      {
        description:
          'Falla parcial en distribución eléctrica, zona de Torres. Afectados 1,800 usuarios. Reportado hace 45 minutos. Se espera restauración en próximas 2 horas.',
        image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=200&fit=crop',
      },
    Cozumel:
      {
        description:
          'Corte total de energía en la isla. Aproximadamente 5,000 habitantes sin servicio. Reportado por múltiples usuarios a las 13:00 horas. Barco de servicio técnico en ruta.',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=200&fit=crop',
      },
    'Isla Mujeres':
      {
        description:
          'Intermitencia en el suministro eléctrico. Afectados sectores norte y central. Reportado por residente local. Equipo revisor en operaciones.',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=200&fit=crop',
      },
    'Felipe Carrillo Puerto':
      {
        description:
          'Falla en línea de distribución principal. Zona rural con aproximadamente 3,200 personas afectadas. Reportado hace 1 hora. Técnicos en despliegue.',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
      },
  }

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

    const zoneInfo = zoneData[zone.name] || {
      description: 'Reporte de corte de electricidad',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
    }

    const popupContent = `
      <div style="width: 340px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
            ${zone.name}
          </h3>
          <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #fff; background-color: ${color};">
            Severidad: ${zone.severity}
          </div>
        </div>

        <div style="margin-bottom: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <img src="${zoneInfo.image}" alt="Imagen del reporte" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
        </div>

        <div style="margin-bottom: 0; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px;">
            Descripción del reporte:
          </label>
          <textarea disabled style="width: 100%; height: 90px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; font-family: inherit; resize: none; box-sizing: border-box; background-color: #f8fafc; color: #475569; cursor: not-allowed;">${zoneInfo.description}</textarea>
        </div>
      </div>
    `

    L.circleMarker([zone.lat, zone.lng], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .bindPopup(popupContent, {
        maxWidth: 350,
        minWidth: 320,
        closeButton: true,
      })
      .addTo(map)
  })
})
</script>
