<script setup lang="ts">
import SeriesCarousel from "@/components/library/SeriesCarusel.vue";
import {PropType} from "vue";
import {Series} from "@/types/Book.ts";

const props = defineProps({
  series: {
    type: Object as PropType<Series>,
    required: true,
  },
});
</script>
<template>
  <Dialog class="w-5/6"  header="Lista książek w cyklu" :modal="true">
    <div class="confirmation-content">
      <SeriesCarousel :series="props.series"/>
    </div>
  </Dialog>
</template>

<style scoped></style>
