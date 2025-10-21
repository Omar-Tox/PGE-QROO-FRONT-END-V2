<template>
  <div class="h-20 w-full">
    <svg :viewBox="`0 0 ${width} ${height}`" class="h-full w-full">
      <g>
        <rect
          v-for="(v,i) in normalized"
          :key="i"
          :x="i * (barWidth + gap)"
          :y="height - v"
          :width="barWidth"
          :height="v"
          class="fill-accent-500/70"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ values: number[] }>()

const width = 100
const height = 60
const gap = 4
const count = computed(() => props.values.length)
const barWidth = computed(() => (width - (count.value - 1) * gap) / count.value)
const max = computed(() => Math.max(1, ...props.values))
const normalized = computed(() => props.values.map((v) => Math.max(2, Math.round((v / max.value) * (height - 4)))))
</script>
