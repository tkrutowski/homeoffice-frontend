<script setup lang="ts">
import {onMounted, ref} from "vue";
import TheMenuLibrary from "@/components/library/TheMenuLibrary.vue";
import {Series} from "@/types/Book";
import {useBooksStore} from "@/stores/books";
import SeriesCarusel from "@/components/library/SeriesCarusel.vue";

const booksStore = useBooksStore();

onMounted(async () => {
  if (booksStore.series.length === 0) await booksStore.getSeriesFromDb();
});

const selectedSeries = ref<Series[]>([]);
</script>

<template>
  <TheMenuLibrary/>
  <Toolbar class="m-6">
    <template #start>
      <span>Wybrano  {{ selectedSeries.length }} z {{ booksStore.getSortedSeries.length }} cykli</span>
    </template>

    <template #center>
      <div class="flex flex-col">
        <label class="ml-2" for="series">Wybierz cykl:</label>
        <MultiSelect
            v-model="selectedSeries"
            filter
            display="chip"
            :options="booksStore.getSortedSeries"
            option-label="title"
            placeholder="Wybierz..."
            :max-selected-labels="3"
            class="w-full md:w-80"
        />
      </div>
      <div v-if="booksStore.loadingBooksInSeries" class="ml-4 mt-4">
        <ProgressSpinner
            style="width: 35px; height: 35px"
            stroke-width="5"
        />
      </div>

    </template>

    <template #end>
    </template>
  </Toolbar>

  <div v-for="series in selectedSeries" :key="series.id" class="m-6">
    <SeriesCarusel :series="series" class="mb-10"/>
  </div>
</template>

<style scoped></style>
