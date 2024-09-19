<script setup lang="ts">
import { UserBook } from "@/types/Book";
import {computed, PropType, ref} from "vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import SeriesCaruselInfoDialog from "@/components/library/SeriesCaruselInfoDialog.vue";

const props = defineProps({
  userbook: {
    type: Object as PropType<UserBook>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: "edit", userbook: UserBook): void;
  (e: "delete", userbook: UserBook): void;
}>();
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
    .join(",");
});

const showSeriesInfoDialog = ref<boolean>(false);
</script>
<template>
  <SeriesCaruselInfoDialog
      v-model:visible="showSeriesInfoDialog"
      :series="props.userbook?.book?.series"
      @cancel="showSeriesInfoDialog = false"
  />
  <Card class="book_small">
    <template #header>
      <div class="flex flex-row justify-between dark:bg-surface-700 bg-surface-100 rounded-t-2xl">
        <h3 class="p-3">{{ userbook.editionType.name }}</h3>

        <div class="flex flex-row items-center gap-2">
          <OfficeIconButton
              v-if="userbook.book?.series?.id != 2"
              v-tooltip.top="{
              value: 'Wyświetl książki w serii',
              showDelay: 500,
              hideDelay: 300,
            }"
              icon="pi pi-list"
              class="pr-0"
              @click="showSeriesInfoDialog = true"
          />
          <OfficeIconButton
            v-tooltip.top="{
              value: 'Edycja książki na półce',
              showDelay: 500,
              hideDelay: 300,
            }"
            icon="pi pi-file-edit"
            class="pr-0"
            @click="emit('edit', userbook)"
          />

          <OfficeIconButton
            v-tooltip.top="{
              value: 'Usunięcie książki z półki',
              showDelay: 500,
              hideDelay: 300,
            }"
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

      <!--   AUTHORS   -->
      <h5 class="mt-1 flex justify-center">
        {{ getAuthors }}
      </h5>
      <h4
        v-tooltip.top="{
          value: userbook.book?.title,
          showDelay: 500,
          hideDelay: 300,
        }"
        class="flex justify-center"
      >
        {{ titleCal }}
      </h4>

      <!--   SERIES   -->
      <div class="book-series pl-2 pr-2">
        <p
          v-tooltip.top="{
            value: userbook.book?.series?.title,
            showDelay: 500,
            hideDelay: 300,
          }"
          class="book__large-subtitle-sub"
        >
          Cykl: <strong>{{ seriesCal }}</strong>
        </p>
        <h3 class="book__large-subtitle-sub book__large-subtitle-bold">
          #{{ userbook.book.bookInSeriesNo }}
        </h3>
      </div>
    </template>
    <template #footer>
      <div
        class="mt-0 mb-0 flex flex-col  items-center bg-office-dark2"
      >
        <p class="mt-0 mb-0">Czytana/Słuchana</p>
        <p class="mt-0 mb-2">
          <strong>{{ userbook.readFrom }}</strong> do
          <strong>{{ isRead }}</strong>
        </p>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.book_small {
  width: 300px;
  /*height: 700px;*/
  margin: 15px;
}
.p-dark .book_small {
  color: var( --office-color); /* lub dowolny inny kolor dla ciemnego motywu */
}

.book-series {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0;
}

</style>
