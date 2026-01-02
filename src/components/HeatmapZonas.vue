<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Mapa de Zonas sin Electricidad
      </h2>
      <p class="text-slate-600 dark:text-slate-400 mb-6">
        Visualización de áreas reportadas por usuarios con interrupciones de servicio eléctrico
      </p>

      <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-1 overflow-x-auto">
        <svg viewBox="0 0 800 600" class="min-w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <!-- Background -->
          <defs>
            <linearGradient id="heatGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #fee5e5; stop-opacity: 1" />
              <stop offset="50%" style="stop-color: #fcbdbd; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #f87171; stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="heatGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #fed7aa; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #fb923c; stop-opacity: 1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Map background -->
          <rect width="800" height="600" fill="#f8fafc" class="dark:fill-slate-800" />

          <!-- Grid lines -->
          <g stroke="#cbd5e1" stroke-width="1" opacity="0.3" class="dark:stroke-slate-600">
            <line x1="0" y1="150" x2="800" y2="150" />
            <line x1="0" y1="300" x2="800" y2="300" />
            <line x1="0" y1="450" x2="800" y2="450" />
            <line x1="200" y1="0" x2="200" y2="600" />
            <line x1="400" y1="0" x2="400" y2="600" />
            <line x1="600" y1="0" x2="600" y2="600" />
          </g>

          <!-- High severity zones (rojo intenso) -->
          <g filter="url(#glow)">
            <circle cx="150" cy="100" r="45" fill="#dc2626" opacity="0.7" />
            <circle cx="650" cy="520" r="50" fill="#dc2626" opacity="0.7" />
          </g>

          <!-- Medium-high severity zones (naranja-rojo) -->
          <g filter="url(#glow)">
            <circle cx="400" cy="200" r="55" fill="#f97316" opacity="0.65" />
            <circle cx="200" cy="450" r="40" fill="#ea580c" opacity="0.65" />
            <ellipse cx="600" cy="150" rx="50" ry="35" fill="#f97316" opacity="0.65" />
          </g>

          <!-- Medium severity zones (naranja) -->
          <g filter="url(#glow)">
            <circle cx="550" cy="300" r="38" fill="#fbbf24" opacity="0.6" />
            <circle cx="300" cy="350" r="35" fill="#fcd34d" opacity="0.6" />
          </g>

          <!-- Low severity zones (amarillo) -->
          <g filter="url(#glow)">
            <circle cx="700" cy="250" r="30" fill="#fef3c7" opacity="0.55" />
            <circle cx="100" cy="550" r="25" fill="#fef3c7" opacity="0.55" />
          </g>

          <!-- Zone labels -->
          <g font-size="12" font-weight="600" class="dark:fill-slate-100">
            <text x="150" y="105" text-anchor="middle" fill="#991b1b">Zona 1</text>
            <text x="400" y="210" text-anchor="middle" fill="#92400e">Zona 2</text>
            <text x="650" y="525" text-anchor="middle" fill="#991b1b">Zona 3</text>
            <text x="200" y="460" text-anchor="middle" fill="#92400e">Zona 4</text>
            <text x="550" y="310" text-anchor="middle" fill="#b45309">Zona 5</text>
            <text x="300" y="360" text-anchor="middle" fill="#b45309">Zona 6</text>
            <text x="600" y="155" text-anchor="middle" fill="#92400e">Zona 7</text>
            <text x="700" y="255" text-anchor="middle" fill="#d97706">Zona 8</text>
            <text x="100" y="555" text-anchor="middle" fill="#d97706">Zona 9</text>
          </g>
        </svg>
      </div>

      <!-- Legend -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-red-600 shadow-sm" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Crítico (70-100)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-orange-500 shadow-sm" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Alto (50-69)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-amber-400 shadow-sm" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Medio (30-49)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-yellow-100 shadow-sm" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Bajo (10-29)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-green-100 shadow-sm" />
          <span class="text-sm text-slate-600 dark:text-slate-400">Normal (&lt;10)</span>
        </div>
      </div>
    </div>

    <!-- Zones Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Zonas Críticas</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">2</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 grid place-items-center">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M6.343 3.665c1.932-.576 4.073-.576 6.012 0 2.397.686 4.413 2.328 5.416 4.589 1.004 2.26 1.004 4.861 0 7.12-.884 2.16-2.307 3.805-4.004 4.686" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Zonas Alerta</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">3</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 grid place-items-center">
            <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v2m0 0v2M6.343 3.665c1.932-.576 4.073-.576 6.012 0 2.397.686 4.413 2.328 5.416 4.589 1.004 2.26 1.004 4.861 0 7.12-.884 2.16-2.307 3.805-4.004 4.686" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reportes</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">427</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 grid place-items-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports Table -->
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft">
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
            <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 1</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Centro Histórico</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-200">
                  Crítico
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">78</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 15 min</td>
            </tr>
            <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 2</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Playa del Carmen</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-800 dark:text-orange-200">
                  Alto
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">56</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 23 min</td>
            </tr>
            <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 3</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Cozumel</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-200">
                  Crítico
                </span>
              </td>
              <td class="py-3 px-4 text-slate-900 dark:text-slate-100">92</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Hace 8 min</td>
            </tr>
            <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Zona 4</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-400">Felipe Carrillo Puerto</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-800 dark:text-orange-200">
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
                <span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
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
// Heatmap visualization component for zones without electricity
</script>
