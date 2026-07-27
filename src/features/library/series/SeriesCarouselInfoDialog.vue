<script setup lang="ts">
  import SeriesCarousel from '@/features/library/series/SeriesCarusel.vue';
  import type { PropType } from 'vue';
  import type { Series } from '@/features/library/shelf/types';

  const props = defineProps({
    series: {
      type: Object as PropType<Series>,
      required: true,
    },
  });
</script>
<template>
  <Dialog class="max-w-screen-xl" header="Lista książek w cyklu" :modal="true">
    <div class="confirmation-content" style="overflow: hidden">
      <SeriesCarousel :series="props.series" />
    </div>
  </Dialog>
</template>

<style scoped></style>
