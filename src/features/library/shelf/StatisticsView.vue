<script setup lang="ts">
  import { computed, ref } from 'vue';
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { type BookStatistic } from '@/features/library/shelf/types';
  import {
    useBookStatisticsQuery,
    useBookstoreStatisticsQuery,
  } from '@/features/library/shelf/queries/useUserbooksQueries';

  const { data: statisticsData } = useBookStatisticsQuery();
  const { data: bookstoreStatisticsData } = useBookstoreStatisticsQuery();
  const statistics = computed<BookStatistic[]>(() => statisticsData.value ?? []);
  const bookstoreStatistics = computed<Map<string, number>>(() => bookstoreStatisticsData.value ?? new Map());

  const chartData = computed(() => {
    if (statistics.value.length === 0) return { labels: [], datasets: [] };

    const years = statistics.value.map(stat => stat.year).sort((a, b) => a - b);
    const categories = [
      { key: 'book', label: 'BOOK', color: '#42A5F5' },
      { key: 'audiobook', label: 'AUDIOBOOK', color: '#66BB6A' },
      { key: 'ebook', label: 'EBOOK', color: '#FFA726' },
    ];

    return {
      labels: years,
      datasets: categories.map(category => ({
        label: category.label,
        borderColor: category.color,
        backgroundColor: category.color + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        data: years.map(year => {
          const stat = statistics.value.find(s => s.year === year);
          return stat ? (stat[category.key as keyof BookStatistic] as number) : 0;
        }),
      })),
    };
  });

  // Konfiguracja wykresu liniowego
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Rok',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liczba książek',
        },
      },
    },
  });

  // Dane dla wykresu Doughnut - statystyki księgarni
  const bookstoreChartData = computed(() => {
    if (bookstoreStatistics.value.size === 0) return { labels: [], datasets: [] };

    const labels = Array.from(bookstoreStatistics.value.keys());
    const data = Array.from(bookstoreStatistics.value.values());

    const colors = [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#EF5350',
      '#AB47BC',
      '#26A69A',
      '#FF7043',
      '#8D6E63',
      '#78909C',
      '#26C6DA',
    ];

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 2,
        },
      ],
    };
  });

  // Konfiguracja wykresu Doughnut
  const bookstoreChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Książki według księgarni',
        font: {
          size: 16,
        },
      },
    },
  });

  function getTotalAudiobook(edition: string): number {
    return statistics.value.reduce((total, stat) => {
      switch (edition) {
        case 'AUDIOBOOK':
          return total + stat.audiobook;
        case 'EBOOK':
          return total + stat.ebook;
        case 'BOOK':
          return total + stat.book;
        default:
          return total;
      }
    }, 0);
  }
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuLibrary />
    </template>

    <div class="p-6">
      <div class="grid gap-4 grid-cols-3">
        <Card class="shadow-lg p-4 col-span-2">
          <template #content>
            <Chart type="line" :data="chartData" :options="chartOptions" class="w-full h-96" />
          </template>
        </Card>
        <Card class="shadow-lg p-4">
          <template #content>
            <Chart type="doughnut" :data="bookstoreChartData" :options="bookstoreChartOptions" class="w-full h-96" />
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
            {{ getTotalAudiobook('AUDIOBOOK') + getTotalAudiobook('EBOOK') + getTotalAudiobook('BOOK') }}
          </p>
        </template>
      </Toolbar>
    </div>
  </MainPageShell>
</template>
