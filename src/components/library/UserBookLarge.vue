<script setup lang="ts">
  import type { Author, Category, UserBook } from '@/types/Book.ts';
  import { computed, ref } from 'vue';
  import type { PropType } from 'vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import SeriesCarouselInfoDialog from '@/components/library/SeriesCarouselInfoDialog.vue';
  import { useBookstoreStore } from '@/stores/bookstores.ts';
  import { TranslationService } from '@/service/TranslationService.ts';

  const bookstoreStore = useBookstoreStore();
  const props = defineProps({
    userbook: {
      type: Object as PropType<UserBook>,
      required: true,
    },
  });

  const isRead = computed(() => {
    return props.userbook.readTo ? props.userbook.readTo : 'nieskończona';
  });
  const getAuthors = computed(() => {
    return props.userbook?.book?.authors.map((a: Author) => a.firstName + ' ' + a.lastName).join(', ');
  });
  const getCategories = computed(() => {
    return props.userbook?.book?.categories.map((cat: Category) => cat.name).join(', ');
  });
  const getBookstoreName = computed((): string => {
    const bookstore = bookstoreStore.getBookstore(props.userbook.idBookstore);
    if (bookstore) {
      return bookstore.name;
    }
    return '';
  });

  const showSeriesInfoDialog = ref<boolean>(false);
</script>
<template>
  <SeriesCarouselInfoDialog
    v-if="props.userbook?.book?.series"
    v-model:visible="showSeriesInfoDialog"
    :series="props.userbook?.book?.series"
  />
  <Card class="book_large">
    <template #header>
      <div class="flex flex-row justify-between dark:bg-surface-700 bg-surface-100 rounded-t-2xl">
        <h3 class="p-3">
          {{ TranslationService.translateEnum('EditionType', userbook.editionType) }}
        </h3>

        <div class="flex flex-row items-center">
          <OfficeIconButton
            v-if="userbook.book?.series?.id != 2"
            title="Wyświetl książki w serii"
            icon="pi pi-list"
            class="mr-2"
            @click="showSeriesInfoDialog = true"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-row gap-4">
        <!--      COVER     -->
        <div class="pt-4 flex justify-center">
          <img
            v-if="userbook?.book?.cover != 'https://focikhome.synology.me/covers/'"
            :src="userbook.book?.cover"
            height="375"
            width="250"
            alt="Okładka do książki"
          />
          <img v-else src="../../assets/images/no_cover.png" height="320" width="222" alt="Okładka do książki" />
        </div>
        <div class="pt-4">
          <p class="pb-2">
            Tytuł:
            <span class="text-xl font-semibold pl-2">{{ userbook.book?.title }}</span>
          </p>
          <p class="pb-2">
            Autor:
            <span class="text-xl font-semibold pl-2">{{ getAuthors }}</span>
          </p>
          <p class="pb-2">
            Autor: <span class="text-xl font-bold">{{ getCategories }}</span>
          </p>
          <p v-if="userbook.book?.series != null" class="pb-2">
            Cykl:
            <span class="text-xl font-bold">{{ userbook.book.series.title }}</span>
          </p>
          <p v-if="userbook.book?.series != null" class="pb-2">
            Część:
            <span class="text-xl font-bold">{{ userbook.book.bookInSeriesNo }}</span>
          </p>
          <p class="pb-2">
            Księgarnia:
            <span class="text-xl font-bold">{{ getBookstoreName }}</span>
          </p>
          <p class="pb-2">
            Stan posiadania:
            <span class="text-xl font-bold">{{
              TranslationService.translateEnum('OwnershipStatus', userbook.ownershipStatus)
            }}</span>
          </p>
          <p class="pb-2">
            Stan czytania:
            <span class="text-xl font-bold">{{
              TranslationService.translateEnum('ReadingStatus', userbook.readingStatus)
            }}</span>
          </p>
          <p class="pb-2">
            Czytana/Słuchana:
            <span class="text-xl font-bold">{{ userbook.readFrom }} do {{ isRead }}</span>
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <p class="pb-2">Opis:</p>
      <p class="flex-wrap">{{ userbook.book?.description }}</p>
    </template>
  </Card>
</template>

<style scoped>
  .book_large {
    width: 1000px;
    /*height: 700px;*/
    margin: 15px;
  }
</style>
