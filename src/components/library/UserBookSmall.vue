<script setup lang="ts">
  import type { Author, UserBook } from '@/types/Book.ts';
  import { computed, type PropType, ref } from 'vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import SeriesCarouselInfoDialog from '@/components/library/SeriesCarouselInfoDialog.vue';
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
  <Card class="w-[300px] m-4 shadow-2xl text-color">
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
            class="pr-0"
            @click="showSeriesInfoDialog = true"
          />
          <OfficeIconButton
            title="Edycja książki na półce"
            icon="pi pi-file-edit"
            class="pr-0"
            @click="emit('edit', userbook)"
          />

          <OfficeIconButton
            title="Usunięcie książki z półki"
            icon="pi pi-trash"
            severity="danger"
            class="mr-2"
            @click="emit('delete', userbook)"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!--      COVER     -->
      <div class="pt-4 flex justify-center">
        <img
          v-if="userbook?.book?.cover.startsWith('https://focik-home.s3.eu-central-1.amazonaws.com')"
          :src="userbook.book?.cover"
          height="375"
          width="250"
          alt="Okładka do książki"
          class="max-h-[355px] max-w-64"
        />
        <img
          v-else
          src="../../assets/images/no_cover.png"
          height="300"
          width="250"
          alt="Okładka do książki"
          class="max-h-[355px] max-w-64"
        />
      </div>

      <!--   AUTHORS   -->
      <p class="mt-1 flex justify-center text-sm">
        {{ getAuthors }}
      </p>
      <p class="text-center text-xl text-primary" :title="userbook.book?.title">
        {{ titleCal }}
      </p>

      <!--   SERIES   -->
      <div class="book-series pl-2 pr-2">
        <p class="text-sm" :title="userbook.book?.series?.title">
          Cykl: <strong>{{ seriesCal }}</strong>
        </p>
        <p class="text-2xl">#{{ userbook.book?.bookInSeriesNo }}</p>
      </div>
    </template>
    <template #footer>
      <div class="mt-0 mb-0 flex flex-col items-center">
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
