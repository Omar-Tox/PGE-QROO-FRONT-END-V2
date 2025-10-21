<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary.500),transparent_40%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent.500),transparent_40%)]"></div>
    <div class="container py-16 md:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            Plataforma de Gestión Energética · Quintana Roo
          </div>
          <h1 class="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            PGE-QROO
          </h1>
          <p class="mt-4 text-lg text-slate-600 max-w-xl">
            Centraliza, analiza y predice el consumo y gasto eléctrico de las dependencias estatales
            para optimizar la asignación presupuestal y fomentar la transparencia.
          </p>
          <div class="mt-8 flex items-center gap-3">
            <button class="rounded-lg bg-primary-600 px-5 py-3 text-white shadow-soft hover:bg-primary-700" @click="$emit('action','dashboard')">
              Explorar Dashboard
            </button>
            <button class="rounded-lg bg-white px-5 py-3 text-slate-700 border border-slate-200 hover:bg-slate-50" @click="$emit('action','publico')">
              Transparencia pública
            </button>
          </div>
          <ul class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
            <li class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-primary-600"></span> Análisis histórico</li>
            <li class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-primary-600"></span> Predicción de gasto</li>
            <li class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-primary-600"></span> Interoperable con NDG</li>
          </ul>
        </div>
        <div class="relative">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs text-slate-500">Gasto total</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">$3,640,000</p>
                <BarChartMini :values="[12,18,9,22,28,24,30,26]" />
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs text-slate-500">Consumo kWh</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">161,000</p>
                <BarChartMini :values="[24,20,16,18,14,19,22,20]" />
              </div>
              <div class="rounded-xl border border-slate-200 p-4 col-span-2">
                <p class="text-xs text-slate-500">Costo promedio kWh</p>
                <p class="mt-1 text-xl font-semibold text-slate-900">$9.1</p>
                <div class="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div class="h-2 rounded-full bg-accent-500" style="width: 72%"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BarChartMini from './BarChartMini.vue'
</script>
