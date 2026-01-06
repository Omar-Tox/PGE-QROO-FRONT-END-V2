<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// --- ECHARTS IMPORTS ---
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, GaugeChart } from 'echarts/charts'
import { 
  GridComponent, 
  TooltipComponent, 
  LegendComponent, 
  TitleComponent,
  MarkLineComponent,
  MarkAreaComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// Registro de componentes ECharts
use([
  CanvasRenderer, 
  BarChart, 
  LineChart, 
  PieChart, 
  GaugeChart, 
  GridComponent, 
  TooltipComponent, 
  LegendComponent, 
  TitleComponent,
  MarkLineComponent,
  MarkAreaComponent
])

// --- ESTADO ---
const selectedDep = ref('Secretaría de Finanzas')
const chartMode = ref<'financiera' | 'tendencia'>('financiera') // Controla qué gráfica se ve

// Datos Reactivos
const currentKpis = ref({
  consumo: 0,
  consumoTrend: 0,
  costo: 0,
  costoTrend: 0,
  presupuestoUsado: 0,
  presupuestoTotal: 0,
  presupuestoPorcentaje: 0,
  ahorro: 0
})

const currentChartData = ref<{meses: string[], kwh: number[], costo: number[]}>({ meses: [], kwh: [], costo: [] })
const currentEdificios = ref<{nombre: string, kwh: number}[]>([])

// --- DATOS SIMULADOS (MOCK DATA) ---
const mockData: any = {
  'Secretaría de Finanzas': {
    chart: {
      kwh: [12500, 13200, 11800, 14500, 15800, 16200, 15900, 15100, 14200, 13800, 12900, 12520],
      costo: [24000, 25500, 22800, 27500, 29800, 31000, 30500, 29200, 27500, 26800, 25100, 24350]
    },
    presupuestoAnual: 400000,
    edificios: [
      { nombre: 'Edificio Central', kwh: 65520 },
      { nombre: 'Archivo Histórico', kwh: 35100 },
      { nombre: 'Oficinas Recaudación', kwh: 28400 },
      { nombre: 'Bodega Norte', kwh: 15500 }
    ]
  },
  'Secretaría de Salud': {
    chart: {
      kwh: [28500, 29800, 31200, 36000, 39500, 43000, 46500, 45200, 42100, 39800, 36500, 33400],
      costo: [56000, 59200, 63500, 71000, 78000, 85000, 92000, 89500, 83000, 78500, 72000, 66500]
    },
    presupuestoAnual: 1000000,
    edificios: [
      { nombre: 'Hospital General', kwh: 185400 },
      { nombre: 'Clínica Especialidades', kwh: 129200 },
      { nombre: 'Almacén Medicamentos', kwh: 85800 },
      { nombre: 'Oficinas Admin', kwh: 43000 }
    ]
  },
  'Secretaría de Educación': {
    chart: {
      kwh: [15200, 16500, 15800, 12500, 11200, 9500, 8800, 9200, 14500, 15800, 16500, 15100],
      costo: [30500, 32800, 31500, 25000, 22500, 19000, 17500, 18500, 29000, 31500, 33000, 30200]
    },
    presupuestoAnual: 450000,
    edificios: [
      { nombre: 'SEQ Central', kwh: 76500 },
      { nombre: 'Centro Capacitación', kwh: 44200 },
      { nombre: 'Biblioteca Pública', kwh: 22800 },
      { nombre: 'Almacén Libros', kwh: 11600 }
    ]
  }
}

// --- LÓGICA DE ACTUALIZACIÓN ---
function updateData() {
  const data = mockData[selectedDep.value] || mockData['Secretaría de Finanzas']
  
  const lastIdx = data.chart.kwh.length - 1
  const prevIdx = lastIdx - 1
  
  const consumoActual = data.chart.kwh[lastIdx]
  const consumoPrev = data.chart.kwh[prevIdx]
  const costoActual = data.chart.costo[lastIdx]
  const costoPrev = data.chart.costo[prevIdx]
  const costoTotalAnual = data.chart.costo.reduce((a: number, b: number) => a + b, 0)
  
  const consumoTrend = ((consumoActual - consumoPrev) / consumoPrev) * 100
  const costoTrend = ((costoActual - costoPrev) / costoPrev) * 100
  const presupuestoTotal = data.presupuestoAnual
  const porcentajeUso = (costoTotalAnual / presupuestoTotal) * 100
  const gastoPromedioEsperado = presupuestoTotal / 12
  const ahorroMensual = gastoPromedioEsperado - costoActual

  currentKpis.value = {
    consumo: consumoActual,
    consumoTrend: Number(consumoTrend.toFixed(1)),
    costo: costoActual,
    costoTrend: Number(costoTrend.toFixed(1)),
    presupuestoUsado: costoTotalAnual,
    presupuestoTotal: presupuestoTotal,
    presupuestoPorcentaje: Number(porcentajeUso.toFixed(1)),
    ahorro: Number(ahorroMensual.toFixed(0))
  }
  
  currentEdificios.value = data.edificios
  
  currentChartData.value = {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    kwh: data.chart.kwh,
    costo: data.chart.costo
  }
}

onMounted(updateData)
watch(selectedDep, updateData)

// --- CONFIGURACIÓN ECHARTS ---

// 1. Gráfica Financiera (Barras y Líneas) - Comparativa Consumo vs Costo
const chartOptionFinanciera = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  legend: { data: ['Consumo (kWh)', 'Costo ($)'], bottom: 0 },
  grid: { left: '3%', right: '3%', bottom: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: currentChartData.value.meses,
    axisLine: { lineStyle: { color: '#94a3b8' } }
  },
  yAxis: [
    { type: 'value', name: 'Consumo', position: 'left', axisLabel: { formatter: '{value} k' }, splitLine: { lineStyle: { type: 'dashed' } } },
    { type: 'value', name: 'Costo', position: 'right', axisLabel: { formatter: '${value}' }, splitLine: { show: false } }
  ],
  series: [
    {
      name: 'Consumo (kWh)',
      type: 'bar',
      data: currentChartData.value.kwh,
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
      barWidth: '40%'
    },
    {
      name: 'Costo ($)',
      type: 'line',
      yAxisIndex: 1,
      data: currentChartData.value.costo,
      itemStyle: { color: '#10b981' },
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3 }
    }
  ]
}))

// 2. Gráfica de Tendencia (Estilo Imagen - Naranja/Verde)
const chartOptionTendencia = computed(() => {
  // Simulamos que los últimos 3 meses son predicción para efectos visuales
  const totalPoints = currentChartData.value.kwh.length
  const cutoff = totalPoints - 3
  
  // Serie Histórica (Naranja): Datos hasta el punto de corte
  const historyData = currentChartData.value.kwh.map((val, idx) => idx <= cutoff ? val : null)
  
  // Serie Predicción (Verde): Datos desde el punto de corte en adelante
  const predictionData = currentChartData.value.kwh.map((val, idx) => idx >= cutoff ? val : null)

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Consumo Histórico', 'Proyección'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: currentChartData.value.meses,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#94a3b8' } }
    },
    yAxis: {
      type: 'value',
      name: 'Energía (kWh)',
      splitLine: { lineStyle: { type: 'dashed', color: '#334155' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    // Fondo oscuro simulado en el contenedor, aquí configuramos colores brillantes
    backgroundColor: 'transparent',
    series: [
      {
        name: 'Consumo Histórico',
        type: 'line',
        data: historyData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#f59e0b' }, // Naranja
        lineStyle: { width: 4 }
      },
      {
        name: 'Proyección',
        type: 'line',
        data: predictionData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#10b981' }, // Verde Neon
        lineStyle: { width: 4, type: 'dashed' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.4)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]
          }
        },
        // Zona sombreada para indicar futuro
        markArea: {
          itemStyle: { color: 'rgba(16, 185, 129, 0.05)' },
          data: [[{ xAxis: currentChartData.value.meses[cutoff] }, { xAxis: currentChartData.value.meses[totalPoints - 1] }]]
        }
      }
    ]
  }
})

// 3. Gráfica de Donut: Distribución
const chartOptionDistribution = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} kWh ({d}%)' },
  legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10 },
  series: [
    {
      name: 'Consumo',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: currentEdificios.value.map(e => ({ value: e.kwh, name: e.nombre }))
    }
  ]
}))

// 4. Gráfica Gauge: Semáforo Presupuestal
const chartOptionBudget = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5,
      radius: '100%',
      center: ['50%', '70%'], // Bajar un poco el centro
      itemStyle: { color: currentKpis.value.presupuestoPorcentaje > 85 ? '#ef4444' : '#3b82f6' },
      progress: { show: true, roundCap: true, width: 12 },
      pointer: { show: false },
      axisLine: { roundCap: true, lineStyle: { width: 12 } },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { width: 2, color: '#999' } },
      axisLabel: { distance: 15, color: '#999', fontSize: 10 },
      title: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 24,
        offsetCenter: [0, '-20%'],
        formatter: '{value}%',
        color: 'inherit'
      },
      data: [{ value: currentKpis.value.presupuestoPorcentaje }]
    }
  ]
}))

// Utilidades
function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val)
}
function formatNumber(val: number) {
  return new Intl.NumberFormat('es-MX').format(val)
}
function formatMillions(val: number) {
  return (val / 1000000).toFixed(2) + 'M'
}
</script>

<template>
  <div class="p-8 space-y-8">
    
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
        <span class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </span>
        Dashboard Ejecutivo
      </h2>
      <select
        v-model="selectedDep"
        class="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option>Secretaría de Finanzas</option>
        <option>Secretaría de Salud</option>
        <option>Secretaría de Educación</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Consumo Mes</p>
            <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ formatNumber(currentKpis.consumo) }} <span class="text-sm font-normal text-slate-500">kWh</span></p>
          </div>
          <div class="p-2 bg-amber-100 text-amber-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
        </div>
        <p :class="['mt-2 text-xs font-medium flex items-center', currentKpis.consumoTrend > 0 ? 'text-red-600' : 'text-green-600']">
          <span class="mr-1">{{ currentKpis.consumoTrend > 0 ? '▲' : '▼' }} {{ Math.abs(currentKpis.consumoTrend) }}%</span> vs mes anterior
        </p>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Gasto Mes</p>
            <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ formatCurrency(currentKpis.costo) }}</p>
          </div>
          <div class="p-2 bg-green-100 text-green-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
        </div>
        <p :class="['mt-2 text-xs font-medium flex items-center', currentKpis.costoTrend > 0 ? 'text-red-600' : 'text-green-600']">
          <span class="mr-1">{{ currentKpis.costoTrend > 0 ? '▲' : '▼' }} {{ Math.abs(currentKpis.costoTrend) }}%</span> vs mes anterior
        </p>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Ejecución Anual</p>
          <div class="p-2 bg-blue-100 text-blue-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>
        </div>
        <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {{ formatMillions(currentKpis.presupuestoUsado) }} 
          <span class="text-sm text-slate-400 font-normal">/ {{ formatMillions(currentKpis.presupuestoTotal) }}</span>
        </p>
        <div class="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div class="h-2 rounded-full bg-blue-500 transition-all duration-1000 ease-out" :style="`width: ${currentKpis.presupuestoPorcentaje}%`"></div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Balance Mensual</p>
          <div class="p-2 bg-purple-100 text-purple-600 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
        </div>
        <p :class="['mt-2 text-2xl font-bold', currentKpis.ahorro >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-500']">
          {{ formatCurrency(currentKpis.ahorro) }}
        </p>
        <p class="mt-1 text-xs text-slate-500">{{ currentKpis.ahorro >= 0 ? 'Por debajo del promedio' : 'Excedido del promedio' }}</p>
      </div>
    </div>

    <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Evolución Anual</h3>
          <p class="text-sm text-slate-500">Comparativa histórica y proyección de tendencias.</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex items-center">
          <button 
            @click="chartMode = 'financiera'"
            :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-all', chartMode === 'financiera' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']"
          >
            Vista Financiera
          </button>
          <button 
            @click="chartMode = 'tendencia'"
            :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-all', chartMode === 'tendencia' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']"
          >
            Vista Tendencia
          </button>
        </div>
      </div>

      <div class="h-80 w-full" :class="chartMode === 'tendencia' ? 'bg-slate-900 rounded-lg p-2' : ''">
        <v-chart v-if="chartMode === 'financiera'" class="chart" :option="chartOptionFinanciera" autoresize />
        <v-chart v-else class="chart" :option="chartOptionTendencia" autoresize />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-2">Consumo por Inmueble</h3>
        <div class="h-48 w-full flex-1">
          <v-chart class="chart" :option="chartOptionDistribution" autoresize />
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-between">
          <span>Ranking Consumo</span>
          <span class="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Mes Actual</span>
        </h3>
        <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <div v-for="(ed, idx) in currentEdificios" :key="idx" class="flex items-center justify-between group">
            <div class="flex items-center gap-3 w-full">
              <span class="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500">{{ idx + 1 }}</span>
              <div class="w-full">
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-medium text-slate-700 dark:text-slate-200">{{ ed.nombre }}</span>
                  <span class="font-bold text-slate-900 dark:text-slate-100">{{ formatNumber(ed.kwh) }}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500 rounded-full" :style="`width: ${(ed.kwh / currentEdificios[0].kwh) * 100}%`"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">Presupuesto Ejercido</h3>
          <span :class="['px-2 py-1 text-xs font-bold rounded', currentKpis.presupuestoPorcentaje > 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
            {{ currentKpis.presupuestoPorcentaje > 90 ? 'ALERTA' : 'OK' }}
          </span>
        </div>
        <div class="h-48 w-full">
          <v-chart class="chart" :option="chartOptionBudget" autoresize />
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100">Detalle Mensual de Datos</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th class="px-6 py-3">Mes</th>
              <th class="px-6 py-3 text-right">Consumo (kWh)</th>
              <th class="px-6 py-3 text-right">Gasto ($)</th>
              <th class="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mes, i) in currentChartData.meses" :key="i" class="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ mes }}</td>
              <td class="px-6 py-4 text-right">{{ formatNumber(currentChartData.kwh[i]) }}</td>
              <td class="px-6 py-4 text-right font-mono">{{ formatCurrency(currentChartData.costo[i]) }}</td>
              <td class="px-6 py-4 text-center">
                <span v-if="i >= currentChartData.meses.length - 3" class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Proyección</span>
                <span v-else class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Real</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>