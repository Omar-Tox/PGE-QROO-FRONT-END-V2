<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')" />
    <div class="absolute inset-0 grid place-items-center p-4">
      <div class="w-full max-w-md rounded-2xl bg-white shadow-soft border border-slate-200">
        <div class="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">Acceso para servidores públicos</h2>
            <p class="mt-1 text-sm text-slate-600">Inicia sesión con tu correo institucional.</p>
          </div>
          <button type="button" @click="emit('close')" class="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-6 w-6"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          </button>
        </div>
        <div class="p-6">
          <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input id="email" v-model.trim="email" type="email" required
                class="mt-1 block w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="password" v-model="password" type="password" required minlength="6"
                class="mt-1 block w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            <button type="submit" :disabled="loading || !valid" class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-white font-medium hover:bg-primary-700 disabled:opacity-60">
              <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
              <span>Entrar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '../services/api'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', payload: { token: string; email: string }): void
}>()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const valid = computed(() => /.+@.+\..+/.test(email.value) && password.value.length >= 6)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.login(email.value, password.value)
    emit('success', { token: res.token, email: email.value })
    emit('close')
  } catch (e: any) {
    error.value = 'Credenciales inválidas o servicio no disponible.'
  } finally {
    loading.value = false
  }
}
</script>
