<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

// --- 1. LIBRERÍAS GRÁFICAS (ECHARTS) ---
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, MarkAreaComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// --- 2. LIBRERÍAS DE EXPORTACIÓN ---
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'

// --- 3. API (Usando apiFast) ---
import { apiFast, type RecursoDependencia, type DataPunto, type AnalisisIAResponse } from '../../services/apiFast'

// Registro de componentes ECharts
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, MarkAreaComponent])

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
const chartRef = ref<any>(null)
const loading = ref(false)
const loadingIA = ref(false)
const errorMsg = ref<string | null>(null)
const noData = ref(false)

// Datos traídos de la API
const recursos = ref<RecursoDependencia[]>([])
const historialData = ref<DataPunto[]>([])
const prediccionData = ref<DataPunto[]>([])
const analisisIA = ref<AnalisisIAResponse['analisis_ia'] | null>(null)

// Filtros Reactivos
const filtros = reactive({
  meses: '6',
  dependenciaId: '' as string | number,
  verTodoHistorial: true,      // Nuevo: Toggle para ver historial completo
  edificiosIds: [] as number[] // Nuevo: Selección múltiple de edificios
})

// ==========================================
// CONFIGURACIÓN DE PLANTILLA (PERSISTENCIA)
// ==========================================
const showConfigModal = ref(false)

const defaultConfig = {
  titulo: 'GOBIERNO DEL ESTADO DE QUINTANA ROO',
  subtitulo: 'Reporte de Consumo Energético (kWh)',
  colorPrimario: '#F59E0B', // Naranja/Ámbar para energía
  colorTextoHeader: '#FFFFFF',
  // Logo placeholder (Cuadrado verde seguro)
  logoBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAlSURBVFhH7cExAQAAAMKg9U9tDQ8gAAAAAAAAAAAAAAAAAAAAPwY7DwABs7671gAAAABJRU5ErkJggg=='
}

const templateConfig = reactive({ ...defaultConfig })

// ==========================================
// PROPIEDADES COMPUTADAS (LÓGICA UI)
// ==========================================

// Filtra los edificios según la dependencia seleccionada
const edificiosDisponibles = computed(() => {
  if (!filtros.dependenciaId) return []
  const dep = recursos.value.find(d => d.id === Number(filtros.dependenciaId))
  return dep ? dep.edificios : []
})

// ==========================================
// CICLO DE VIDA Y OBSERVADORES
// ==========================================

// Carga Inicial
onMounted(async () => {
  // 1. Cargar Configuración Local
  const savedConfig = localStorage.getItem('excel_template_config')
  if (savedConfig) {
    try {
      Object.assign(templateConfig, JSON.parse(savedConfig))
    } catch (e) { console.error("Error config local") }
  }

  // 2. Cargar Recursos API
  try {
    const res = await apiFast.getMisRecursos()
    recursos.value = res.dependencias
    
    // Autoseleccionar primera dependencia si existe
    if (recursos.value.length > 0) {
      filtros.dependenciaId = recursos.value[0].id
      // El watcher disparará cargarProyeccion()
    }
  } catch (e) {
    console.error("Error cargando recursos:", e)
    errorMsg.value = "No se pudieron cargar las dependencias."
  }
})

// Watcher 1: Limpiar edificios si cambia la dependencia
watch(() => filtros.dependenciaId, () => {
  filtros.edificiosIds = []
})

// Watcher 2: Recargar proyección si cambia CUALQUIER filtro
watch(
  () => [filtros.meses, filtros.dependenciaId, filtros.verTodoHistorial, filtros.edificiosIds], 
  () => { cargarProyeccion() },
  { deep: true } // Importante para detectar cambios dentro del array edificiosIds
)

// ==========================================
// LÓGICA DE API (AXIOS/FETCH)
// ==========================================

async function cargarProyeccion() {
  if (!filtros.dependenciaId) return
  
  loading.value = true
  noData.value = false
  errorMsg.value = null
  analisisIA.value = null // Reseteamos IA al cambiar filtros para evitar inconsistencias

  try {
    const depId = Number(filtros.dependenciaId)
    const meses = Number(filtros.meses)
    
    // Llamada con todos los parámetros nuevos
    const response = await apiFast.getProyeccion(
      depId, 
      meses, 
      filtros.verTodoHistorial, 
      filtros.edificiosIds
    )
    
    historialData.value = response.datos_para_grafica || []
    prediccionData.value = response.detalle_proyeccion || []

  } catch (error: any) {
    console.error("API Error:", error)
    if (error.status === 404) {
      noData.value = true
      historialData.value = []
      prediccionData.value = []
    } else {
      errorMsg.value = "No se pudo conectar con el servicio de predicción."
    }
  } finally {
    loading.value = false
  }
}

async function consultarIA() {
  if (!filtros.dependenciaId) return
  loadingIA.value = true
  try {
    const depId = Number(filtros.dependenciaId)
    const meses = Number(filtros.meses)
    
    const res = await apiFast.getAnalisisIA(
      depId, 
      meses,
      filtros.verTodoHistorial,
      filtros.edificiosIds
    )
    analisisIA.value = res.analisis_ia
    
    // Scroll suave hacia la respuesta
    setTimeout(() => {
      document.getElementById('ia-result')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } catch (error) {
    alert("El servicio de IA no está disponible en este momento.")
  } finally {
    loadingIA.value = false
  }
}

// ==========================================
// CONFIGURACIÓN GRÁFICA (ECHARTS - KWH)
// ==========================================

const xAxisData = computed(() => {
  const real = historialData.value || []
  const pred = prediccionData.value || []
  
  const labelsReal = real.map(d => `${obtenerNombreMes(d.mes)} ${d.anio}`)
  const labelsPred = pred.map(d => `${obtenerNombreMes(d.mes)} ${d.anio}`)
  return [...labelsReal, ...labelsPred]
})

const seriesReal = computed(() => {
  const real = historialData.value || []
  const pred = prediccionData.value || []
  
  // Mapeamos KWH en lugar de costo
  const data = real.map(d => d.total_kwh) 
  
  // Rellenamos con nulls el futuro para que la línea se corte
  return [...data, ...new Array(pred.length).fill(null)]
})

const seriesPrediccion = computed(() => {
  const real = historialData.value || []
  const pred = prediccionData.value || []

  // Calcular espacios vacíos iniciales
  let nullsCount = 0
  if (real.length > 0) {
    nullsCount = real.length - 1
  }
  const nulls = new Array(nullsCount).fill(null)

  // Conectar visualmente: Último punto real es el primer punto de predicción
  const ultimoReal = real.length > 0 ? real[real.length - 1].total_kwh : null
  const future = pred.map(d => d.total_kwh)
  
  // Si no hay histórico, solo mostramos futuro
  if (real.length === 0) return future
  
  return [...nulls, ultimoReal, ...future]
})

const chartOption = computed(() => ({
  animation: true,
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      let res = `<strong>${params[0].axisValue}</strong><br/>`
      params.forEach((item: any) => {
        // Formato numérico para KWH
        if (item.value != null) {
          const val = item.value.toLocaleString('es-MX', { maximumFractionDigits: 0 })
          res += `<span style="color:${item.color}">●</span> ${item.seriesName}: <strong>${val} kWh</strong><br/>`
        }
      })
      return res
    }
  },
  legend: { data: ['Consumo Histórico', 'Predicción'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: xAxisData.value,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#94a3b8' } }
  },
  yAxis: {
    type: 'value',
    name: 'Energía (kWh)',
    axisLabel: { formatter: (val: number) => `${val/1000}k` }, // Formato corto 10k, 20k
    axisLine: { lineStyle: { color: '#94a3b8' } },
    splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
  },
  series: [
    {
      name: 'Consumo Histórico',
      type: 'line',
      data: seriesReal.value,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#f59e0b' }, // Naranja/Ámbar para energía
      lineStyle: { width: 3 }
    },
    {
      name: 'Predicción',
      type: 'line',
      data: seriesPrediccion.value,
      smooth: true,
      symbol: 'emptyCircle',
      symbolSize: 8,
      itemStyle: { color: '#10b981' }, // Verde para futuro/eficiencia
      lineStyle: { width: 3, type: 'dashed' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.2)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]
        }
      }
    }
  ]
}))

// ==========================================
// UTILIDADES Y EXPORTACIÓN
// ==========================================

function obtenerNombreMes(m: number) {
  return ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m-1] || '?'
}

function hexToArgb(hex: string) {
  return 'FF' + hex.replace('#', '').toUpperCase()
}

// Métodos de Configuración
function saveTemplateConfig() {
  localStorage.setItem('excel_template_config', JSON.stringify(templateConfig))
  showConfigModal.value = false
  alert("Plantilla actualizada.")
}

function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) templateConfig.logoBase64 = e.target.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// --- EXPORTAR A PDF (Consumo kWh) ---
async function exportarPDF() {
  try {
    const doc = new jsPDF()
    
    // Logo y Encabezado
    try { doc.addImage(templateConfig.logoBase64, 'PNG', 15, 10, 20, 20) } catch (e) {
      doc.setFillColor(220); doc.rect(15, 10, 20, 20, 'F')
    }

    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(templateConfig.colorPrimario)
    doc.text(templateConfig.titulo, 40, 18)
    
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60)
    doc.text(templateConfig.subtitulo, 40, 24)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 40, 29)
    doc.setDrawColor(200); doc.line(15, 35, 195, 35)

    // Gráfica
    if (chartRef.value) {
      try {
        const img = chartRef.value.getDataURL({ pixelRatio: 2, backgroundColor: '#fff', excludeComponents: ['toolbox'] })
        if (img) {
          doc.addImage(img, 'PNG', 15, 50, 180, 80)
        }
      } catch(e){}
    }

    // Tabla de Datos
    const dataCombinada = [...historialData.value, ...prediccionData.value]
    const body = dataCombinada.map(d => [
      `${obtenerNombreMes(d.mes)} ${d.anio}`,
      d.total_kwh.toLocaleString('es-MX') + ' kWh',
      d.tipo === 'real' ? 'Real' : 'Predicción'
    ])

    autoTable(doc, {
      startY: 140,
      head: [['Periodo', 'Consumo Energía', 'Tipo']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: templateConfig.colorPrimario, textColor: 255, fontStyle: 'bold' }
    })

    doc.save('Reporte_Consumo_Energia.pdf')
  } catch (e) { alert("Error al generar PDF") }
}

// --- EXPORTAR A EXCEL (Consumo kWh) ---
async function exportarExcel() {
  try {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Reporte kWh')
    
    const imgId = workbook.addImage({ base64: templateConfig.logoBase64, extension: 'png' })
    sheet.addImage(imgId, { tl: { col: 0, row: 0 }, ext: { width: 60, height: 60 } })

    sheet.mergeCells('B1:E1')
    const t1 = sheet.getCell('B1')
    t1.value = templateConfig.titulo.toUpperCase()
    t1.font = { name: 'Arial', size: 14, bold: true, color: { argb: hexToArgb(templateConfig.colorPrimario) } }
    
    sheet.mergeCells('B2:E2')
    const t2 = sheet.getCell('B2')
    t2.value = `${templateConfig.subtitulo} - ${new Date().toLocaleDateString()}`
    t2.font = { name: 'Arial', size: 11, italic: true }

    sheet.addRow([]); sheet.addRow([]); sheet.addRow([])

    const headerRow = sheet.getRow(5)
    headerRow.values = ['Periodo', 'Consumo (kWh)', 'Tipo']
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(templateConfig.colorPrimario) } }
      cell.font = { color: { argb: hexToArgb(templateConfig.colorTextoHeader) }, bold: true }
      cell.alignment = { horizontal: 'center' }
    })
    
    sheet.columns = [{width: 25}, {width: 25}, {width: 15}]

    const data = [...historialData.value, ...prediccionData.value]
    data.forEach(d => {
      sheet.addRow([
        `${obtenerNombreMes(d.mes)} ${d.anio}`,
        d.total_kwh,
        d.tipo === 'real' ? 'Real' : 'Predicción'
      ])
    })
    
    // Formato numérico
    sheet.getColumn(2).numFmt = '#,##0 "kWh"'

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'Reporte_Energia.xlsx'; a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert("Error al generar Excel") }
}
</script>

<template>
  <div class="p-8 space-y-8">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Tendencias de Consumo Energético</h2>
        <p class="text-slate-600 dark:text-slate-300">Análisis en kWh e Inteligencia Artificial</p>
      </div>
      <div class="flex gap-2">
        <button @click="showConfigModal = true" class="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm">Configurar</button>
        <button @click="exportarExcel" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">Excel</button>
        <button @click="exportarPDF" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">PDF</button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="col-span-1 lg:col-span-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dependencia</label>
          <select v-model="filtros.dependenciaId" class="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200">
            <option v-for="dep in recursos" :key="dep.id" :value="dep.id">{{ dep.nombre }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Proyección Futura</label>
          <select v-model="filtros.meses" class="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200">
            <option value="6">6 Meses</option>
            <option value="12">12 Meses</option>
            <option value="24">24 Meses</option>
          </select>
        </div>

        <div class="flex items-center h-full pt-6">
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="filtros.verTodoHistorial" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ms-3 text-sm font-medium text-slate-900 dark:text-slate-300">Ver todo el historial</span>
          </label>
        </div>
      </div>

      <div v-if="edificiosDisponibles.length > 0">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Filtrar por Edificios ({{ filtros.edificiosIds.length > 0 ? filtros.edificiosIds.length : 'Todos' }})
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <label v-for="ed in edificiosDisponibles" :key="ed.id" class="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer">
            <input type="checkbox" :value="ed.id" v-model="filtros.edificiosIds" class="rounded text-primary-600 focus:ring-primary-500">
            <span class="text-xs text-slate-700 dark:text-slate-300 truncate" :title="ed.nombre">{{ ed.nombre }}</span>
          </label>
        </div>
        <p class="text-xs text-slate-500 mt-1">* Si no selecciona ninguno, se muestra el total de la dependencia.</p>
      </div>

      <div class="flex justify-end">
        <button @click="consultarIA" :disabled="loadingIA || noData" class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
          <svg v-if="!loadingIA" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          <span v-else>Analizando datos...</span>
          {{ loadingIA ? '' : 'Consultar IA Estratégica' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="h-64 flex flex-col items-center justify-center text-slate-500">
      <svg class="animate-spin h-10 w-10 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p>Procesando datos...</p>
    </div>

    <div v-else-if="noData" class="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
      <h3 class="font-medium text-slate-900 dark:text-slate-100">Sin datos históricos</h3>
      <p class="text-slate-500">No hay consumo registrado para los filtros seleccionados.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4">Proyección de Consumo (kWh)</h3>
        <div class="h-96 w-full">
          <v-chart class="chart" :option="chartOption" autoresize ref="chartRef" />
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col h-[460px]">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4">Datos Mensuales</h3>
        <div class="overflow-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
              <tr>
                <th class="px-4 py-3">Mes</th>
                <th class="px-4 py-3 text-right">kWh</th>
                <th class="px-4 py-3 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in [...historialData, ...prediccionData]" :key="i" class="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td class="px-4 py-2 text-xs">{{ obtenerNombreMes(item.mes) }} {{ item.anio }}</td>
                <td class="px-4 py-2 text-right font-mono text-xs">{{ item.total_kwh.toLocaleString() }}</td>
                <td class="px-4 py-2 text-center">
                  <span :class="['px-1.5 py-0.5 rounded text-[10px] font-semibold', item.tipo === 'real' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800']">
                    {{ item.tipo === 'real' ? 'Real' : 'Pred' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="analisisIA" id="ia-result" class="rounded-xl border border-purple-200 bg-purple-50 dark:bg-slate-800 dark:border-purple-900/50 p-6 shadow-lg animate-fade-in">
      <div class="flex gap-4">
        <div class="p-3 bg-purple-100 text-purple-600 rounded-lg h-fit"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
        <div>
          <h3 class="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">{{ analisisIA.titulo }}</h3>
          <p class="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-line">{{ analisisIA.resumen_ejecutivo }}</p>
          <div class="bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-purple-100 dark:border-slate-700">
            <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-2 text-sm uppercase">Recomendaciones</h4>
            <ul class="space-y-2">
              <li v-for="(acc, i) in analisisIA.acciones_estrategicas" :key="i" class="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span class="text-purple-500 mt-1">●</span> {{ acc }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfigModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="px-6 py-4 border-b dark:border-slate-700 flex justify-between">
          <h3 class="font-bold text-slate-800 dark:text-white">Personalizar Plantilla</h3>
          <button @click="showConfigModal = false" class="text-slate-400 hover:text-red-500">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="block text-sm font-medium mb-1">Título</label><input v-model="templateConfig.titulo" class="w-full rounded-lg border-slate-300 px-3 py-2 dark:bg-slate-700 dark:text-white" /></div>
          <div><label class="block text-sm font-medium mb-1">Subtítulo</label><input v-model="templateConfig.subtitulo" class="w-full rounded-lg border-slate-300 px-3 py-2 dark:bg-slate-700 dark:text-white" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium mb-1">Color Header</label><div class="flex gap-2"><input v-model="templateConfig.colorPrimario" type="color" class="h-10 w-14 rounded border-0" /><span class="text-xs">{{templateConfig.colorPrimario}}</span></div></div>
            <div><label class="block text-sm font-medium mb-1">Color Texto</label><div class="flex gap-2"><input v-model="templateConfig.colorTextoHeader" type="color" class="h-10 w-14 rounded border-0" /><span class="text-xs">{{templateConfig.colorTextoHeader}}</span></div></div>
          </div>
          <div><label class="block text-sm font-medium mb-1">Logo</label><div class="flex items-center gap-4"><div class="h-16 w-16 border rounded bg-slate-100"><img :src="templateConfig.logoBase64" class="h-full w-full object-contain" /></div><input type="file" accept="image/*" @change="handleLogoUpload" class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary-50 file:text-primary-700"/></div></div>
        </div>
        <div class="px-6 py-4 border-t dark:border-slate-700 flex justify-end gap-2">
          <button @click="showConfigModal = false" class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200">Cancelar</button>
          <button @click="saveTemplateConfig" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
  min-height: 300px;
}
</style>