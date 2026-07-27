<script setup lang="ts">
  import type { Author, UserBook } from '@/features/library/shelf/types';
  import { computed, type PropType, ref } from 'vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import SeriesCarouselInfoDialog from '@/features/library/series/SeriesCarouselInfoDialog.vue';
  import { TranslationService } from '@/service/TranslationService.ts';
  import moment from 'moment';

  const props = defineProps({
    userbook: {
      type: Object as PropType<UserBook>,
      required: true,
    },
  });
  const emit = defineEmits<{
    (e: 'edit', userbook: UserBook): void;
    (e: 'delete', userbook: UserBook): void;
  }>();
  const seriesCal = computed(() => {
    const tempSeries = props.userbook?.book?.series;
    if (tempSeries && tempSeries.title?.length > 21) {
      return tempSeries.title.slice(0, 21) + '...';
    }
    return tempSeries?.title;
  });
  const titleCal = computed(() => {
    const org = props.userbook?.book?.title;
    if (org && org.length > 20) {
      return org.slice(0, 20) + '...';
    }
    return org;
  });
  const isRead = computed(() => {
    return props.userbook.readTo ? moment(props.userbook.readTo).format('YYYY.MM.DD') : 'nieskończona';
  });
  const readFrom = computed(() => {
    return props.userbook.readFrom ? moment(props.userbook.readFrom).format('YYYY.MM.DD') : '';
  });
  const getAuthors = computed(() => {
    return props.userbook?.book?.authors.map((a: Author) => a.firstName + ' ' + a.lastName).join(',');
  });

  const showSeriesInfoDialog = ref<boolean>(false);
</script>
<template>
  <SeriesCarouselInfoDialog
    v-if="props.userbook?.book?.series"
    v-model:visible="showSeriesInfoDialog"
    :series="props.userbook?.book?.series"
  />
  <Card
    class="w-[300px] m-4 overflow-hidden shadow-2xl text-color"
    :pt="{
      body: { class: 'p-0 gap-0' },
      content: { class: 'p-0' },
    }"
  >
    <template #header>
      <div class="flex flex-row justify-between dark:bg-surface-700 bg-surface-200 rounded-t-2xl">
        <p class="p-3 text-primary text-2xl font-medium">
          {{ TranslationService.translateEnum('EditionType', userbook.editionType) }}
        </p>

        <div class="flex flex-row items-center gap-2">
          <OfficeIconButton
            v-if="userbook.book?.series"
            title="Wyświetl książki w serii"
            icon="pi pi-list"
            class="pr-0 text-primary-500"
            @click="showSeriesInfoDialog = true"
          />
          <OfficeIconButton
            title="Edycja książki na półce"
            icon="pi pi-file-edit"
            class="pr-0 text-orange-500"
            @click="emit('edit', userbook)"
          />

          <OfficeIconButton
            title="Usunięcie książki z półki"
            icon="pi pi-trash"
            class="mr-2 text-red-500"
            @click="emit('delete', userbook)"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!--      COVER     -->
      <div class="w-full relative">
        <img
          v-if="userbook?.book?.cover && userbook.book.cover.length > 0"
          :src="userbook.book.cover"
          alt="Okładka do książki"
          class="block w-full h-[400px] object-cover"
        />
        <img
          v-else
          src="../../../assets/images/no_cover.png"
          alt="Okładka do książki"
          class="block w-full h-[400px] object-cover"
        />
      </div>

      <div class="px-4 pt-2 pb-1">
        <!--   AUTHORS   -->
        <p class="mt-1 flex justify-center text-sm">
          {{ getAuthors }}
        </p>
        <p class="text-center text-xl text-primary" :title="userbook.book?.title">
          {{ titleCal }}
        </p>

        <!--   SERIES   -->
        <div class="book-series">
          <p class="text-sm" :title="userbook.book?.series?.title">
            Cykl: <strong>{{ seriesCal }}</strong>
          </p>
          <p class="text-2xl">#{{ userbook.book?.bookInSeriesNo }}</p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="mt-0 mb-0 flex flex-col items-center px-4">
        <p class="mt-0 mb-0 text-sm">Czytana/Słuchana</p>
        <p class="mt-0 mb-2">
          <strong>{{ readFrom }}</strong> do
          <strong>{{ isRead }}</strong>
        </p>
      </div>
    </template>
  </Card>
</template>

<style scoped>
  .book-series {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0;
  }
</style>
