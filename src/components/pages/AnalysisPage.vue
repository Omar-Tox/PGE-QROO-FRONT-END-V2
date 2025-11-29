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

// --- 3. API (Usando el nuevo archivo apiFast) ---
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

// Filtros
const filtros = reactive({
  meses: '6',
  dependenciaId: '' as string | number
})

// ==========================================
// CONFIGURACIÓN DE PLANTILLA (PERSISTENCIA)
// ==========================================
const showConfigModal = ref(false)

const defaultConfig = {
  titulo: 'GOBIERNO DEL ESTADO DE QUINTANA ROO',
  subtitulo: 'Reporte de Consumo Energético',
  colorPrimario: '#059669', // Verde
  colorTextoHeader: '#FFFFFF',
  // Logo placeholder seguro (cuadrado verde)
  logoBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAlSURBVFhH7cExAQAAAMKg9U9tDQ8gAAAAAAAAAAAAAAAAAAAAPwY7DwABs7671gAAAABJRU5ErkJggg=='
}

const templateConfig = reactive({ ...defaultConfig })

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
    if (recursos.value.length > 0) {
      filtros.dependenciaId = recursos.value[0].id
      // Watch se encargará de cargar la proyección
    }
  } catch (e) {
    console.error("Error cargando recursos:", e)
  }
})

// Guardar Configuración
function saveTemplateConfig() {
  localStorage.setItem('excel_template_config', JSON.stringify(templateConfig))
  showConfigModal.value = false
  alert("Plantilla actualizada correctamente.")
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

// ==========================================
// LÓGICA DE API
// ==========================================

// Observador para recargar datos
watch(() => [filtros.meses, filtros.dependenciaId], () => {
  cargarProyeccion()
})

async function cargarProyeccion() {
  if (!filtros.dependenciaId) return
  
  loading.value = true
  noData.value = false
  errorMsg.value = null
  analisisIA.value = null // Reseteamos IA al cambiar filtros

  try {
    const depId = Number(filtros.dependenciaId)
    const meses = Number(filtros.meses)
    
    const response = await apiFast.getProyeccion(depId, meses)
    
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
    const res = await apiFast.getAnalisisIA(depId, meses)
    analisisIA.value = res.analisis_ia
    
    // Scroll automático hacia la respuesta
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
// CONFIGURACIÓN GRÁFICA (ECHARTS)
// ==========================================

const xAxisData = computed(() => {
  // Protección contra datos nulos
  const real = historialData.value || []
  const pred = prediccionData.value || []
  
  const labelsReal = real.map(d => `${obtenerNombreMes(d.mes)} ${d.anio}`)
  const labelsPred = pred.map(d => `${obtenerNombreMes(d.mes)} ${d.anio}`)
  return [...labelsReal, ...labelsPred]
})

const seriesReal = computed(() => {
  const real = historialData.value || []
  const pred = prediccionData.value || []
  
  const data = real.map(d => d.total_costo)
  // Rellenamos con nulls el futuro
  return [...data, ...new Array(pred.length).fill(null)]
})

const seriesPrediccion = computed(() => {
  const real = historialData.value || []
  const pred = prediccionData.value || []

  // --- CORRECCIÓN DEL ERROR RangeError ---
  // Si no hay datos históricos, no restamos 1.
  let nullsCount = 0
  if (real.length > 0) {
    nullsCount = real.length - 1
  }
  const nulls = new Array(nullsCount).fill(null)
  // ---------------------------------------

  const ultimoReal = real.length > 0 ? real[real.length - 1].total_costo : null
  const future = pred.map(d => d.total_costo)
  
  // Si no hay histórico, la predicción empieza desde el principio sin conectar
  if (real.length === 0) {
    return future
  }
  
  return [...nulls, ultimoReal, ...future]
})

const chartOption = computed(() => ({
  animation: true,
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      let res = `<strong>${params[0].axisValue}</strong><br/>`
      params.forEach((item: any) => {
        if (item.value !== null && item.value !== undefined) {
          res += `<span style="color:${item.color}">●</span> ${item.seriesName}: ${formatCurrency(item.value)}<br/>`
        }
      })
      return res
    }
  },
  legend: { data: ['Gasto Real', 'Predicción'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: xAxisData.value,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#94a3b8' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: (val: number) => `$${val/1000}k` },
    axisLine: { lineStyle: { color: '#94a3b8' } },
    splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
  },
  series: [
    {
      name: 'Gasto Real',
      type: 'line',
      data: seriesReal.value,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#1d4ed8' }, // Azul
      lineStyle: { width: 3 }
    },
    {
      name: 'Predicción',
      type: 'line',
      data: seriesPrediccion.value,
      smooth: true,
      symbol: 'emptyCircle',
      symbolSize: 8,
      itemStyle: { color: '#10b981' }, // Verde
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

function formatCurrency(val: number | undefined) {
  if (val === undefined) return '-'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
}

function hexToArgb(hex: string) {
  return 'FF' + hex.replace('#', '').toUpperCase()
}

// --- EXPORTAR A PDF ---
async function exportarPDF() {
  try {
    const doc = new jsPDF()
    
    // Logo
    try {
      doc.addImage(templateConfig.logoBase64, 'PNG', 15, 10, 20, 20)
    } catch (e) {
      doc.setFillColor(220, 220, 220); doc.rect(15, 10, 20, 20, 'F')
    }

    // Cabecera
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(templateConfig.colorPrimario)
    doc.text(templateConfig.titulo, 40, 18)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(templateConfig.subtitulo, 40, 24)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 40, 29)
    doc.setDrawColor(200); doc.line(15, 35, 195, 35)

    // Gráfica
    if (chartRef.value) {
      try {
        const img = chartRef.value.getDataURL({ pixelRatio: 2, backgroundColor: '#fff', excludeComponents: ['toolbox'] })
        if (img) {
          doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(0)
          doc.text('Análisis Gráfico', 15, 45)
          doc.addImage(img, 'PNG', 15, 50, 180, 80)
        }
      } catch(e) {}
    }

    // Tabla
    const dataCombinada = [...historialData.value, ...prediccionData.value]
    const body = dataCombinada.map(d => [
      `${obtenerNombreMes(d.mes)} ${d.anio}`,
      d.total_kwh?.toLocaleString() || '-',
      formatCurrency(d.total_costo),
      d.tipo === 'real' ? 'Real' : 'Predicción'
    ])

    autoTable(doc, {
      startY: 140,
      head: [['Periodo', 'Consumo (kWh)', 'Costo', 'Tipo']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: templateConfig.colorPrimario, textColor: 255, fontStyle: 'bold' }
    })

    doc.save('Reporte_Energia.pdf')
  } catch (e) { alert("Error al generar PDF") }
}

// --- EXPORTAR A EXCEL ---
async function exportarExcel() {
  try {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Reporte')
    
    // Logo
    const imgId = workbook.addImage({ base64: templateConfig.logoBase64, extension: 'png' })
    sheet.addImage(imgId, { tl: { col: 0, row: 0 }, ext: { width: 60, height: 60 } })

    // Títulos
    sheet.mergeCells('B1:E1')
    const t1 = sheet.getCell('B1')
    t1.value = templateConfig.titulo.toUpperCase()
    t1.font = { name: 'Arial', size: 14, bold: true, color: { argb: hexToArgb(templateConfig.colorPrimario) } }
    
    sheet.mergeCells('B2:E2')
    const t2 = sheet.getCell('B2')
    t2.value = `${templateConfig.subtitulo} - ${new Date().toLocaleDateString()}`
    t2.font = { name: 'Arial', size: 11, italic: true }

    sheet.addRow([]); sheet.addRow([]); sheet.addRow([])

    // Headers
    const headerRow = sheet.getRow(5)
    headerRow.values = ['Periodo', 'Consumo (kWh)', 'Costo', 'Tipo']
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(templateConfig.colorPrimario) } }
      cell.font = { color: { argb: hexToArgb(templateConfig.colorTextoHeader) }, bold: true }
      cell.alignment = { horizontal: 'center' }
    })
    
    sheet.columns = [{width: 25}, {width: 20}, {width: 20}, {width: 15}]

    // Datos
    const dataCombinada = [...historialData.value, ...prediccionData.value]
    dataCombinada.forEach(d => {
      sheet.addRow([
        `${obtenerNombreMes(d.mes)} ${d.anio}`,
        d.total_kwh,
        d.total_costo,
        d.tipo === 'real' ? 'Real' : 'Predicción'
      ])
    })
    
    // Formatos numéricos
    sheet.getColumn(2).numFmt = '#,##0'
    sheet.getColumn(3).numFmt = '"$"#,##0.00'

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'Reporte.xlsx'; a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert("Error al generar Excel") }
}
</script>

<template>
  <div class="p-8 space-y-8">
    
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Análisis y Predicción Energética
        </h2>
        <p class="text-slate-600 dark:text-slate-300">
          Visualización de histórico y proyección financiera basada en IA.
        </p>
      </div>
      
      <div class="flex gap-2">
        <button @click="showConfigModal = true" class="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Configurar
        </button>
        <button @click="exportarExcel" class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Excel
        </button>
        <button @click="exportarPDF" class="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          PDF
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Dependencia / Recurso</label>
          <select v-model="filtros.dependenciaId" class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200">
            <option v-for="dep in recursos" :key="dep.id" :value="dep.id">{{ dep.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Horizonte de Proyección</label>
          <select v-model="filtros.meses" class="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200">
            <option value="6">Próximos 6 meses</option>
            <option value="12">Próximos 12 meses</option>
            <option value="24">Próximos 24 meses</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="consultarIA" :disabled="loadingIA || noData" class="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            <svg v-if="!loadingIA" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <span v-else>Analizando...</span>
            {{ loadingIA ? '' : 'Consultar Análisis IA' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="h-64 flex flex-col items-center justify-center text-slate-500">
      <svg class="animate-spin h-10 w-10 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p>Procesando proyección matemática...</p>
    </div>

    <div v-else-if="noData" class="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
      <div class="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h3 class="font-medium text-slate-900 dark:text-slate-100">Sin datos históricos suficientes</h3>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4">Proyección de Gasto</h3>
        <div class="h-80 w-full">
          <v-chart class="chart" :option="chartOption" autoresize ref="chartRef" />
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-4">Detalle Mensual</h3>
        <div class="overflow-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
              <tr>
                <th class="px-4 py-3">Periodo</th>
                <th class="px-4 py-3 text-right">Consumo</th>
                <th class="px-4 py-3 text-right">Costo</th>
                <th class="px-4 py-3 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in [...historialData, ...prediccionData]" :key="i" class="border-b dark:border-slate-700">
                <td class="px-4 py-3">{{ obtenerNombreMes(item.mes) }} {{ item.anio }}</td>
                <td class="px-4 py-3 text-right">{{ item.total_kwh?.toLocaleString() }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(item.total_costo) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['px-2 py-1 rounded text-xs font-semibold', item.tipo === 'real' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800']">
                    {{ item.tipo === 'real' ? 'Real' : 'Predicción' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="analisisIA" id="ia-result" class="rounded-xl border border-purple-200 bg-purple-50 dark:bg-slate-800 dark:border-purple-900/50 p-6 shadow-lg">
      <div class="flex gap-4">
        <div class="p-3 bg-purple-100 text-purple-600 rounded-lg h-fit"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
        <div>
          <h3 class="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">{{ analisisIA.titulo }}</h3>
          <p class="text-slate-700 dark:text-slate-300 mb-4">{{ analisisIA.resumen_ejecutivo }}</p>
          <div class="bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-purple-100 dark:border-slate-700">
            <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-2 text-sm">ACCIONES ESTRATÉGICAS</h4>
            <ul>
              <li v-for="(acc, i) in analisisIA.acciones_estrategicas" :key="i" class="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span class="text-purple-500">●</span> {{ acc }}
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