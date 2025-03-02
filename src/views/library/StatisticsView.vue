<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import TheMenuLibrary from "@/components/library/TheMenuLibrary.vue";
import type {UserBook} from "@/types/Book.ts";
import {useUserbooksStore} from "@/stores/userbooks.ts";
import moment from "moment";
import {TranslationService} from "@/service/TranslationService.ts";
const userbookStore = useUserbooksStore();

const availableYears = computed(()=>{
  return [...new Set(
      userbookStore.userbooks
          .map((ub: UserBook) => moment(ub.readTo).year())
          .filter(year => !isNaN(year))
  )].sort((a: number, b: number) => b - a);
})
const selectedYear = ref(availableYears.value[availableYears.value.length - 1]);

const filteredData = computed(() => {
  const ub = userbookStore.getUserbooksByDate(selectedYear.value);
  return ub
});

const chartData = computed(() => {
  const months = [...Array(12)].map((_, i) => TranslationService.translateMonth(i + 1));
  const categories = ['BOOK', 'AUDIOBOOK', 'EBOOK'];
  const colors = ['#42A5F5', '#66BB6A', '#FFA726'];

  return {
    labels: months,
    datasets: categories.map((category, index) => ({
      label: category,
      backgroundColor: colors[index],
      data: months.map(month => {
        const books: UserBook[] = filteredData.value.filter((ub:UserBook) => TranslationService.translateMonth(moment(ub.readTo).month()+1) === month && ub.editionType.toString() === category);
        return books ? books.length : 0;
      }),
    })),
  };
});

// Konfiguracja wykresu
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true },
  },
});

function getTotalAudiobook(edition: string): number {
  return filteredData.value.filter((ub: UserBook) => ub.editionType === edition).length
}


//------------------------------------MOUNTED------------------------------
onMounted(() => {
  console.log('onMounted StatisticsView')
  if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb()
})
</script>

<template>
  <TheMenuLibrary/>
  <div class="p-6">
    <div class="grid gap-4">
      <Card class="shadow-lg p-4">
        <template #content>
          <Select
              v-model="selectedYear"
              :options="availableYears"
              placeholder="Wybierz rok"
              class="mb-4 w-full md:w-40"
              :loading="userbookStore.loadingUserbooks"
          />
          <Chart type="bar" :data="chartData" :options="chartOptions" class="w-full h-96"/>
        </template>
      </Card>
    </div>
    <Toolbar class="sticky-toolbar m-6">
      <template #start>
        <div class="flex flex-row text-color gap-3">
          <p class="mb-1">
            <small>Audiobook:</small>
            {{ getTotalAudiobook('AUDIOBOOK') }}
          </p>
          <p class="mb-1">
            <small>Ebooki:</small>
            {{ getTotalAudiobook('EBOOK') }}
          </p>
          <p class="mb-1">
            <small>Książki:</small>
            {{ getTotalAudiobook('BOOK') }}
          </p>
        </div>
      </template>

      <template #end>
        <p class="mb-1 text-color">
          RAZEM:
          {{
            getTotalAudiobook('AUDIOBOOK') + getTotalAudiobook('EBOOK') + getTotalAudiobook('BOOK')
          }}
        </p>
      </template>
    </Toolbar>
  </div>
</template>
