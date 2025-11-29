export interface Sector {
  id_sector: number
  nombre_sector: string
  descripcion: string
}

export interface Dependencia {
  id_dependencia: number
  nombre_dependencia: string
  sector_id: number
  fecha_alta: string
  edificios_count: number 
  edificios: any[] 
  sector?: Sector
}

export interface Edificio {
  id_edificio: number
  dependencia_id: number
  nombre_edificio: string
  direccion: string
  latitud?: number
  longitud?: number
  caracteristicas?: string
  fecha_alta: string
}

export interface Presupuesto {
  id_presupuesto: number
  dependencia_id: number
  año: string
  trimestre: number
  monto_asignado: string | number
}

export interface Rol {
  id_rol: number
  nombre_rol: string
}

export interface HistoricalRecord {
  departmentId: string | number
  month: string
  kwh: number
  cost: number
}

export interface Prediction {
  departmentId: string | number
  month: string
  predictedCost: number
}

export interface BudgetSummary {
  totalDepartments: number
  totalKwh: number
  totalCost: number
  avgCostPerKwh: number
}

export interface DashboardPayload {
  departments: Dependencia[]
  history: HistoricalRecord[]
  predictions: Prediction[]
  summary: BudgetSummary
}

export interface LoginResponse {
  message: string
  acces_token: string
  token_type: string
  user: {
    id: number
    nombre: string
    nombre_usuario: string
    email: string
  }
}

export interface User {
  id: number
  nombre: string
  nombre_usuario: string
  email: string
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const API_BASE_URL_FASTAPI = 'http://127.0.0.1:8000/api'

let authToken: string | null = null

function getAuthHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

function setAuthToken(token: string) {
  authToken = token
  localStorage.setItem('auth_token', token)
}

function getStoredToken() {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token')
  }
  return authToken
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    // Intentamos leer la respuesta como JSON primero
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorJson = await response.json();
      // Lanzamos un objeto personalizado en lugar de un Error estándar
      throw { status: response.status, data: errorJson };
    }
    
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json()
  return data as T
}

async function safeApiFetch<T>(path: string, fallback: T, options: RequestInit = {}): Promise<T> {
  try {
    return await apiFetch<T>(path, options)
  } catch (error) {
    console.error(`API request failed for ${path}:`, error)
    return fallback
  }
}

export const api = {
  setToken(token: string) {
    setAuthToken(token)
  },

  clearToken() {
    authToken = null
    localStorage.removeItem('auth_token')
  },

  /**
   * Login Methods
   * @param email 
   * @param contrasena 
   * @returns 
   */
  async login(email: string, contrasena: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, contrasena }),
    })
    setAuthToken(response.acces_token)
    return response
  },
  async logout(): Promise<void> {
    try {
      await apiFetch('/logout', { method: 'POST' })
    } finally {
      clearToken()
    }
  },

  async getMe(): Promise<User> {
    const fallback: User = { id: 0, nombre: '', nombre_usuario: '', email: '' }
    return safeApiFetch<User>('/auth/me', fallback)
  },

  /**
   * Dependencies Methods
   */
  async getDependencias(): Promise<Dependencia[]> {
    const fallback: Dependencia[] = []
    return safeApiFetch<Dependencia[]>('/dependencias', fallback)
  },

  async createDependencia(data: any): Promise<Dependencia> {
    return apiFetch<Dependencia>('/dependencias', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getDependenciaById(id: string | number): Promise<Dependencia> {
    const fallback: Dependencia = { id_dependencia: id, nombre_dependencia: '' }
    return safeApiFetch<Dependencia>(`/dependencias/${id}`, fallback)
  },

  async updateDependencia(id: string | number, data: any): Promise<Dependencia> {
    return apiFetch<Dependencia>(`/dependencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async patchDependencia(id: string | number, data: any): Promise<Dependencia> {
    return apiFetch<Dependencia>(`/dependencias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteDependencia(id: string | number): Promise<void> {
    await apiFetch(`/dependencias/${id}`, { method: 'DELETE' })
  },

  /**
   * Sectors Methods
   */

  async getSectores(): Promise<Sector[]> {
    const fallback: Sector[] = []
    return safeApiFetch<Sector[]>('/sectores', fallback)
  },

  /**
   * Edificios Methods
   */
  async getEdificiosByDependencia(dependenciaId: string | number): Promise<Edificio[]> {
    const fallback: Edificio[] = []
    return safeApiFetch<Edificio[]>(`/dependencias/${dependenciaId}/edificios`, fallback)
  },

  async createEdificio(dependenciaId: string | number, data: any): Promise<any> {
    return apiFetch(`/dependencias/${dependenciaId}/edificios`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateEdificio(id: number, data: Partial<Edificio>): Promise<Edificio> {
    return apiFetch<Edificio>(`/edificios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // DELETE: Eliminar edificio
  async deleteEdificio(id: number): Promise<void> {
    await apiFetch(`/edificios/${id}`, { method: 'DELETE' })
  },


  async getPresupuestosByDependencia(dependenciaId: string | number): Promise<any[]> {
    const fallback: any[] = []
    return safeApiFetch<any[]>(`/dependencias/${dependenciaId}/presupuestos`, fallback)
  },

  async createPresupuesto(dependenciaId: string | number, data: any): Promise<any> {
    return apiFetch(`/dependencias/${dependenciaId}/presupuestos`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Consumos Methods
   */
  async uploadConsumosMasiva(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('archivo', file) // Cambiado de 'file' a 'archivo' según tu backend

    const headers = getAuthHeaders()
    // Borramos Content-Type para que el navegador lo detecte como multipart/form-data
    delete headers['Content-Type']
    delete headers['Accept'] // A veces ayuda dejar que el navegador maneje esto, o forzar application/json

    const response = await fetch(`${API_BASE_URL}/consumos/carga-masiva`, {
      method: 'POST',
      headers: {
        ...headers,
        'Accept': 'application/json' // Importante para recibir el JSON de error de Laravel
      },
      body: formData,
    })

    // Manejo de respuesta
    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorJson = await response.json()
        // Lanzamos el objeto con status y data para que el componente lo procese
        throw { status: response.status, data: errorJson }
      }
      throw new Error(`Error en la carga: ${response.statusText}`)
    }

    return response.json()
  },

  async getDashboard(): Promise<any> {
    const fallback = mockDashboard()
    return safeApiFetch<any>('/dashboard', fallback)
  },

  async getRankingDependencias(): Promise<any[]> {
    const fallback: any[] = []
    return safeApiFetch<any[]>('/analisis/ranking-dependencias', fallback)
  },

  async getUsuarios(): Promise<User[]> {
    const fallback: User[] = []
    return safeApiFetch<User[]>('/usuarios', fallback)
  },

  async createUsuario(data: any): Promise<User> {
    return apiFetch<User>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateUsuario(id: number, data: any): Promise<User> {
    return apiFetch<User>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteUsuario(id: string | number): Promise<void> {
    await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
  },

  async getRoles(): Promise<Rol[]> {
    const fallback: Rol[] = []
    // Asumimos que existe este endpoint. Si se llama diferente, avísame.
    return safeApiFetch<Rol[]>('/roles', fallback)
  },

  async getUsuarioById(id: string | number): Promise<User> {
    const fallback: User = { id: 0, nombre: '', nombre_usuario: '', email: '' }
    return safeApiFetch<User>(`/usuarios/${id}`, fallback)
  },

  async patchUsuario(id: string | number, data: any): Promise<User> {
    return apiFetch<User>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },



  async getIntegracionGobierno(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/integracion/gobierno', fallback)
  },

  async getKPIs(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/dashboard/kpis', fallback)
  },

  async getEvolucion(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/dashboard/evolucion', fallback)
  },

  async getTendencia(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/dashboard/tendencia', fallback)
  },

  async getRanking(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/dashboard/ranking', fallback)
  },

  async getProyeccionMatematica(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/prediccion/proyeccion-matematica', fallback)
  },

  async getIAAnalisisEstrategico(): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/prediccion/ia-analisis-estrategico', fallback)
  },

  async getCatalogos(type: string, parentId?: string | number): Promise<any[]> {
    const fallback: any[] = []
    let path = `/catalogos/${type}`
    if (parentId) {
      path = `/catalogos/${type}/${parentId}`
    }
    return safeApiFetch<any[]>(path, fallback)
  },

  async getPublicoComparativaConsumo(params?: any): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/publico/comparativa-consumo', fallback)
  },

  async getPublicoComparativaCostos(params?: any): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/publico/comparativa-costos', fallback)
  },

  async getPublicoRanking(params?: any): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/publico/ranking', fallback)
  },

  async getPublicoPresupuestoVsGasto(params?: any): Promise<any> {
    const fallback: any = {}
    return safeApiFetch<any>('/analisis/publico/presupuesto-vs-gasto', fallback)
  },
}

function mockDashboard(): DashboardPayload {
  const departments: Department[] = [
    { id: 'fin', name: 'Secretaría de Finanzas', building: 'Edificio Central', city: 'Chetumal' },
    { id: 'sal', name: 'Secretaría de Salud', building: 'Hospital General', city: 'Cancún' },
    {
      id: 'edu',
      name: 'Secretaría de Educación',
      building: 'Complejo Administrativo',
      city: 'Playa del Carmen',
    },
  ]
  const months = ['2025-06', '2025-07', '2025-08', '2025-09']
  const history: HistoricalRecord[] = []
  for (const m of months) {
    history.push(
      { departmentId: 'fin', month: m, kwh: 42000, cost: 980000 },
      { departmentId: 'sal', month: m, kwh: 68000, cost: 1520000 },
      { departmentId: 'edu', month: m, kwh: 51000, cost: 1100000 },
    )
  }
  const predictions: Prediction[] = [
    { departmentId: 'fin', month: '2025-10', predictedCost: 1005000 },
    { departmentId: 'sal', month: '2025-10', predictedCost: 1548000 },
    { departmentId: 'edu', month: '2025-10', predictedCost: 1134000 },
  ]
  const totalKwh = history.reduce((a, b) => a + b.kwh, 0)
  const totalCost = history.reduce((a, b) => a + b.cost, 0)
  const summary: BudgetSummary = {
    totalDepartments: departments.length,
    totalKwh,
    totalCost,
    avgCostPerKwh: totalCost / totalKwh,
  }
  return { departments, history, predictions, summary }
}
