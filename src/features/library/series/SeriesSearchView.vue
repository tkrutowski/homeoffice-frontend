<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import type { Series } from '@/features/library/shelf/types';
  import { useSeriesStore } from '@/features/library/series/series.store';
  import SeriesCarousel from '@/features/library/series/SeriesCarusel.vue';

  const seriesStore = useSeriesStore();

  onMounted(() => {
    if (seriesStore.series.length === 0) seriesStore.getSeriesFromDb();
  });
  //---------------------------------------------MOUNTED--------------------------------------------

  const selectedSeries = ref<Series[]>([]);
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuLibrary />
    </template>

    <Toolbar class="m-6 text-color">
      <template #start>
        <span>Wybrano {{ selectedSeries.length }} z {{ seriesStore.getSortedSeries.length }} cykli</span>
      </template>

      <template #center>
        <div class="flex flex-col">
          <label class="ml-2" for="series">Wybierz cykl:</label>
          <MultiSelect
            v-model="selectedSeries"
            filter
            display="chip"
            :options="seriesStore.getSortedSeries"
            option-label="title"
            placeholder="Wybierz..."
            :max-selected-labels="3"
            class="w-full md:w-80"
            :loading="seriesStore.loadingBooksInSeries"
          />
        </div>
      </template>

      <template #end></template>
    </Toolbar>

    <div v-for="series in selectedSeries" :key="series.id" class="m-6">
      <SeriesCarousel :series="series" class="mb-10" />
    </div>
  </MainPageShell>
</template>

<style scoped></style>
