export interface Department {
  id: string
  name: string
  building: string
  city: string
}

export interface HistoricalRecord {
  departmentId: string
  month: string // YYYY-MM
  kwh: number
  cost: number
}

export interface Prediction {
  departmentId: string
  month: string // YYYY-MM
  predictedCost: number
}

export interface BudgetSummary {
  totalDepartments: number
  totalKwh: number
  totalCost: number
  avgCostPerKwh: number
}

export interface DashboardPayload {
  departments: Department[]
  history: HistoricalRecord[]
  predictions: Prediction[]
  summary: BudgetSummary
}

const DEFAULT_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api'

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${DEFAULT_BASE_URL}${path}`)
    if (!res.ok) return fallback
    const data = (await res.json()) as T
    return data
  } catch {
    return fallback
  }
}

async function safePost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export type LoginResponse = { token: string }

export const api = {
  async getDashboard(): Promise<DashboardPayload> {
    const fallback: DashboardPayload = mockDashboard()
    return safeFetch<DashboardPayload>('/dashboard', fallback)
  },
  async getDepartments(): Promise<Department[]> {
    const fallback = mockDashboard().departments
    return safeFetch<Department[]>('/departments', fallback)
  },
  async getHistory(params?: { departmentId?: string }): Promise<HistoricalRecord[]> {
    const q = params?.departmentId ? `?departmentId=${encodeURIComponent(params.departmentId)}` : ''
    const fallback = mockDashboard().history
    return safeFetch<HistoricalRecord[]>(`/history${q}`, fallback)
  },
  async getPredictions(params?: { departmentId?: string }): Promise<Prediction[]> {
    const q = params?.departmentId ? `?departmentId=${encodeURIComponent(params.departmentId)}` : ''
    const fallback = mockDashboard().predictions
    return safeFetch<Prediction[]>(`/predictions${q}`, fallback)
  },
  async login(email: string, password: string): Promise<LoginResponse> {
    const fallback: LoginResponse = { token: 'demo-token' }
    return safePost<LoginResponse>('/auth/login', { email, password }, fallback)
  },
}

function mockDashboard(): DashboardPayload {
  const departments: Department[] = [
    { id: 'fin', name: 'Secretaría de Finanzas', building: 'Edificio Central', city: 'Chetumal' },
    { id: 'sal', name: 'Secretaría de Salud', building: 'Hospital General', city: 'Cancún' },
    { id: 'edu', name: 'Secretaría de Educación', building: 'Complejo Administrativo', city: 'Playa del Carmen' },
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
