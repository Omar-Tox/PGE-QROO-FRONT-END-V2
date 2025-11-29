// src/services/apiFast.ts
import { getAuthHeaders } from './api' // Importamos el token del otro archivo

// --- INTERFACES (Movidas desde api.ts) ---

export interface RecursoEdificio {
  id: number
  nombre: string
}

export interface RecursoDependencia {
  id: number
  nombre: string
  edificios: RecursoEdificio[]
}

export interface RespuestaRecursos {
  usuario_id: number
  dependencias: RecursoDependencia[]
}

export interface DataPunto {
  anio: number
  mes: number
  total_kwh?: number
  total_costo?: number
  tipo: 'real' | 'prediccion'
  rango_costo_min?: number
  rango_costo_max?: number
}

export interface ProyeccionResponse {
  status: string
  metodo: string
  resumen_proyeccion: {
    tendencia_detectada: string
    rango_precios_estimado: {
      minimo: number
      maximo: number
    }
  }
  detalle_proyeccion: DataPunto[]
  datos_para_grafica: DataPunto[]
}

export interface AnalisisIAResponse {
  status: string
  analisis_ia: {
    titulo: string
    resumen_ejecutivo: string
    acciones_estrategicas: string[]
  }
}

// --- CONFIGURACIÓN ---
const API_FAST_URL = 'http://localhost:8001' // URL exclusiva de FastAPI

// --- CLIENTE API FAST ---
export const apiFast = {
  
  /**
   * 1. Obtener Jerarquía de Recursos
   */
  async getMisRecursos(): Promise<RespuestaRecursos> {
    const headers = getAuthHeaders() // Reusamos el token del login principal
    const response = await fetch(`${API_FAST_URL}/analisis/dashboard/mis-recursos`, { headers })
    if (!response.ok) throw new Error('Error cargando recursos de FastAPI')
    return response.json()
  },

  /**
   * 2. Proyección Matemática
   */
  async getProyeccion(dependenciaId: number | null, meses: number = 6): Promise<ProyeccionResponse> {
    const headers = getAuthHeaders()
    const params = new URLSearchParams({
      meses: meses.toString(),
      ver_todo_historial: 'true'
    })
    if (dependenciaId) params.append('dependencia_id', dependenciaId.toString())

    const response = await fetch(`${API_FAST_URL}/prediccion/proyeccion-matematica?${params}`, { headers })
    
    if (response.status === 404) {
      throw { status: 404, message: 'No hay datos históricos suficientes.' }
    }
    if (!response.ok) throw new Error('Error en proyección matemática')
    
    return response.json()
  },

  /**
   * 3. Consultoría IA
   */
  async getAnalisisIA(dependenciaId: number | null, meses: number = 6): Promise<AnalisisIAResponse> {
    const headers = getAuthHeaders()
    const params = new URLSearchParams({
      meses: meses.toString(),
      ver_todo_historial: 'true'
    })
    if (dependenciaId) params.append('dependencia_id', dependenciaId.toString())

    const response = await fetch(`${API_FAST_URL}/prediccion/ia-analisis-estrategico?${params}`, { headers })
    
    if (!response.ok) throw new Error('Error al consultar a la IA')
    return response.json()
  }
}