<script setup lang="ts">
import {Bookstore, UserBook} from "@/types/Book";
import {computed, PropType, ref} from "vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import SeriesCaruselInfoDialog from "@/components/library/SeriesCaruselInfoDialog.vue";
import { useBookstoreStore } from "@/stores/bookstores";

const bookstoreStore = useBookstoreStore();
const props = defineProps({
  userbook: {
    type: Object as PropType<UserBook>,
    required: true,
  },
});

const seriesCal = computed(() => {
  let tempSeries = props.userbook?.book?.series;
  if (tempSeries && tempSeries.title?.length > 21) {
    return tempSeries.title.slice(0, 21) + "...";
  }
  return tempSeries?.title;
});
const titleCal = computed(() => {
  let org = props.userbook?.book?.title;
  if (org && org.length > 20) {
    return org.slice(0, 20) + "...";
  }
  return org;
});
const isRead = computed(() => {
  return props.userbook.readTo.length > 0
      ? props.userbook.readTo
      : "nieskończona";
});
const getAuthors = computed(() => {
  return props.userbook?.book?.authors
      .map((a) => a.firstName + " " + a.lastName)
      .join(", ");
});
const getCategories = computed(() => {
  return props.userbook?.book?.categories
      .map((a) => a.name)
      .join(", ");
});
const getBookstore = computed(():Bookstore => {
  console.log('bookstore:',bookstoreStore.getBookstore(props.userbook.idBookstore))
  return  bookstoreStore.getBookstore(props.userbook.idBookstore)
});

const showSeriesInfoDialog = ref<boolean>(false);
</script>
<template>
  <SeriesCaruselInfoDialog
      v-model:visible="showSeriesInfoDialog"
      :series="props.userbook?.book?.series"
      @cancel="showSeriesInfoDialog = false"
  />
  <Card class="book_large">
    <template #header>
      <div class="flex flex-row justify-between dark:bg-surface-700 bg-surface-100 rounded-t-2xl">
        <h3 class="p-3">{{ userbook.editionType.name }}</h3>

        <div class="flex flex-row items-center ">
          <OfficeIconButton
              v-if="userbook.book?.series?.id != 2"
              v-tooltip.top="{
              value: 'Wyświetl książki w serii',
              showDelay: 500,
              hideDelay: 300,
            }"
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
              v-if="userbook?.book?.cover!= 'https://focikhome.synology.me/covers/'"
              :src="userbook.book?.cover"
              height="375"
              width="250"
              alt="Okładka do książki"
          />
          <img
              v-else
              src="../../assets/images/no_cover.png"
              height="300"
              width="250"
              alt="Okładka do książki"
          />
        </div>
        <div class="pt-4">

            <p class="pb-2"> Tytuł: <span class="text-xl font-semibold pl-2">{{ userbook.book.title }}</span> </p>
            <p class="pb-2"> Autor: <span class="text-xl font-semibold pl-2">{{ getAuthors }}</span> </p>
            <p class="pb-2"> Autor: <span class="text-xl font-bold">{{ getCategories }}</span> </p>
            <p v-if="userbook.book.bookInSeriesNo > 0" class="pb-2"> Cykl: <span class="text-xl font-bold">{{ userbook.book.series.title }}</span> </p>
            <p v-if="userbook.book.bookInSeriesNo > 0" class="pb-2"> Część: <span class="text-xl font-bold">{{ userbook.book.bookInSeriesNo }}</span> </p>
            <p class="pb-2"> Księgarnia: <span class="text-xl font-bold">{{ getBookstore.name }}</span> </p>
            <p class="pb-2"> Stan posiadania: <span class="text-xl font-bold">{{ userbook.ownershipStatus.viewName }}</span> </p>
            <p class="pb-2"> Stan czytania: <span class="text-xl font-bold">{{ userbook.readingStatus.viewName }}</span> </p>
          <p class="pb-2">Czytana/Słuchana: <span class="text-xl font-bold">{{ userbook.readFrom }} do {{ isRead }}</span></p>

        </div>
      </div>

    </template>
    <template #footer>
      <p class="pb-2">Opis:</p>
      <p class="flex-wrap">{{ userbook.book.description }}</p>
    </template>
  </Card>
</template>

<style scoped>
.book_large {
  width: 1000px;
  /*height: 700px;*/
  margin: 15px;
}

.p-dark .book_large {
  color: var(--office-color); /* lub dowolny inny kolor dla ciemnego motywu */
}

.book-series {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0;
}

</style>
