<script setup lang="ts">
import SeriesCarousel from '@/components/library/SeriesCarusel.vue'
import type {PropType} from 'vue'
import type {Series} from '@/types/Book.ts'

const props = defineProps({
  series: {
    type: Object as PropType<Series>,
    required: true,
  },
})
</script>
<template>
  <Dialog class="max-w-screen-xl" header="Lista książek w cyklu" :modal="true">
    <div class="confirmation-content">
      <SeriesCarousel :series="props.series"/>
    </div>
  </Dialog>
</template>

<style scoped></style>
