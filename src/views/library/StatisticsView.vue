<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue';
  import { type BookStatistic } from '@/types/Book.ts';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  
  const userbookStore = useUserbooksStore();
  const statistics = ref<BookStatistic[]>([]);

  const chartData = computed(() => {
    if (statistics.value.length === 0) return { labels: [], datasets: [] };
    
    const years = statistics.value.map(stat => stat.year).sort((a, b) => a - b);
    const categories = [
      { key: 'book', label: 'BOOK', color: '#42A5F5' },
      { key: 'audiobook', label: 'AUDIOBOOK', color: '#66BB6A' },
      { key: 'ebook', label: 'EBOOK', color: '#FFA726' }
    ];

    return {
      labels: years,
      datasets: categories.map((category) => ({
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
      x: {
        display: true,
        title: {
          display: true,
          text: 'Rok'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liczba książek'
        }
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

  //------------------------------------MOUNTED------------------------------
  onMounted(async () => {
    console.log('onMounted StatisticsView');
    try {
      statistics.value = await userbookStore.getStatisticsFromDb();
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk:', error);
    }
  });
</script>

<template>
  <TheMenuLibrary />
  <div class="p-6">
    <div class="grid gap-4">
      <Card class="shadow-lg p-4">
        <template #content>
          <Chart type="line" :data="chartData" :options="chartOptions" class="w-full h-96" />
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
</template>
