<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import SectionHero from './components/SectionHero.vue'
import Dashboard from './components/Dashboard.vue'
import PublicModule from './components/PublicModule.vue'
import LoginModal from './components/LoginModal.vue'
import AuthenticatedLayout from './components/AuthenticatedLayout.vue'
import DashboardPage from './components/pages/DashboardPage.vue'
import AnalysisPage from './components/pages/AnalysisPage.vue'
import DependenciesPage from './components/pages/DependenciesPage.vue'
import PropertiesPage from './components/pages/PropertiesPage.vue'
import ImportPage from './components/pages/ImportPage.vue'
import BudgetsPage from './components/pages/BudgetsPage.vue'
import UsersPage from './components/pages/UsersPage.vue'

const view = ref<'inicio' | 'dashboard' | 'publico'>('inicio')
const loginOpen = ref(false)
const authToken = ref<string | null>(null)
const userEmail = ref('')
const activeAuthPage = ref('dashboard')
const isDarkMode = ref(false)

function navigate(to: 'inicio' | 'dashboard' | 'publico') {
  view.value = to
}

function openLogin() {
  loginOpen.value = true
}

function onLoginSuccess(payload: { token: string; email: string }) {
  authToken.value = payload.token
  userEmail.value = payload.email
  loginOpen.value = false
}

function logout() {
  authToken.value = null
  userEmail.value = ''
  activeAuthPage.value = 'dashboard'
  view.value = 'inicio'
}

function navigateAuth(page: string) {
  activeAuthPage.value = page
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem('dark-mode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

watch(isDarkMode, (newValue) => {
  localStorage.setItem('dark-mode', String(newValue))
  const htmlElement = document.documentElement
  if (newValue) {
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
})
</script>

<template>
  <div>
    <template v-if="authToken">
      <AuthenticatedLayout
        :active="activeAuthPage"
        :userEmail="userEmail"
        :isDarkMode="isDarkMode"
        @logout="logout"
        @navigate="navigateAuth"
        @toggleDarkMode="toggleDarkMode"
      >
        <DashboardPage v-if="activeAuthPage === 'dashboard'" />
        <AnalysisPage v-else-if="activeAuthPage === 'analysis'" />
        <DependenciesPage v-else-if="activeAuthPage === 'dependencies'" />
        <PropertiesPage v-else-if="activeAuthPage === 'properties'" />
        <ImportPage v-else-if="activeAuthPage === 'import'" />
        <BudgetsPage v-else-if="activeAuthPage === 'budgets'" />
        <UsersPage v-else-if="activeAuthPage === 'users'" />
      </AuthenticatedLayout>
    </template>

    <template v-else>
      <div class="min-h-screen flex flex-col bg-slate-25 dark:bg-slate-950">
        <NavBar
          :active="view"
          :isDarkMode="isDarkMode"
          @navigate="navigate"
          @toggleDarkMode="toggleDarkMode"
        >
          <template #actions>
            <button
              type="button"
              @click="openLogin"
              class="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-soft hover:bg-primary-700"
            >
              Acceso servidores públicos
            </button>
          </template>
        </NavBar>

        <main class="flex-1">
          <SectionHero v-if="view === 'inicio'" @action="navigate" />
          <Dashboard v-else-if="view === 'dashboard'" />
          <PublicModule v-else />

          <section class="container py-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                class="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft"
              >
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Objetivo general
                </h2>
                <p class="mt-2 text-slate-600 dark:text-slate-300">
                  Desarrollar una plataforma que se interconecte con los datos de las dependencias
                  para centralizar, analizar y predecir el consumo y gasto energético en Quintana
                  Roo, optimizando la asignación presupuestal y promoviendo la eficiencia.
                </p>
                <h3 class="mt-6 text-base font-semibold text-slate-900 dark:text-slate-100">
                  Objetivos específicos
                </h3>
                <ul
                  class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300 list-disc list-inside"
                >
                  <li>Analítica de datos históricos con reportes y patrones de consumo.</li>
                  <li>Modelo predictivo para estimar gastos futuros por dependencia.</li>
                  <li>Dashboard intuitivo para exploración de datos.</li>
                  <li>Interoperabilidad con el Núcleo Digital de Gobierno.</li>
                </ul>
              </div>
              <div
                class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-soft"
              >
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Interoperabilidad y API
                </h2>
                <p class="mt-2 text-slate-600 dark:text-slate-300">
                  Este sistema está preparado para consumir una API externa. Configure la variable
                  VITE_API_BASE_URL para apuntar al servicio de datos abiertos.
                </p>
                <div
                  class="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-300"
                >
                  GET <span class="text-slate-900 dark:text-slate-100">/dashboard</span> — Resumen,
                  histórico y predicciones
                </div>
                <div
                  class="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-300"
                >
                  GET <span class="text-slate-900 dark:text-slate-100">/departments</span> —
                  Catálogo de dependencias
                </div>
              </div>
            </div>
          </section>
        </main>

        <FooterBar />

        <LoginModal :open="loginOpen" @close="loginOpen = false" @success="onLoginSuccess" />
      </div>
    </template>
  </div>
</template>

<style scoped></style>
