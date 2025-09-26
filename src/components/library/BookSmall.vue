<script setup lang="ts">
  import type { Author, Book } from '@/types/Book.ts';
  import { computed, type PropType } from 'vue';

  const props = defineProps({
    book: {
      type: Object as PropType<Book>,
      required: true,
    },
  });

  const seriesCal = computed(() => {
    const tempSeries = props.book?.series;
    if (tempSeries && tempSeries.title?.length > 21) {
      return tempSeries.title.slice(0, 21) + '...';
    }
    return tempSeries?.title;
  });

  const titleCal = computed(() => {
    const org = props.book?.title;
    if (org && org.length > 20) {
      return org.slice(0, 20) + '...';
    }
    return org;
  });

  const getAuthors = computed(() => {
    return props.book?.authors.map((a: Author) => a.firstName + ' ' + a.lastName).join(',');
  });
</script>

<template>
  <div class="book-card w-[300px] m-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
    <!-- COVER -->
    <div class="w-full">
      <img
        v-if="book?.cover != 'https://focikhome.synology.me/covers/'"
        :src="book.cover"
        alt="Okładka do książki"
        class="w-full h-[400px] object-cover"
      />
      <img
        v-else
        src="../../assets/images/no_cover.png"
        alt="Okładka do książki"
        class="w-full h-[400px] object-cover"
      />
    </div>

    <div class="p-4">
      <!-- AUTHORS -->
      <p class="text-sm text-center text-gray-600 dark:text-gray-400">
        {{ getAuthors }}
      </p>
      <p class="text-center text-xl font-semibold text-primary mt-1" :title="book?.title">
        {{ titleCal }}
      </p>

      <!-- SERIES -->
      <div class="book-series mt-2" v-if="book?.series">
        <p class="text-sm text-gray-600 dark:text-gray-400" :title="book?.series?.title">
          Cykl: <strong class="text-gray-800 dark:text-gray-300">{{ seriesCal }}</strong>
        </p>
        <p class="text-2xl font-bold text-gray-800 dark:text-gray-300">#{{ book?.bookInSeriesNo }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .book-series {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0;
  }
</style>
