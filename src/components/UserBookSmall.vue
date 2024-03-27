<script setup lang="ts">
import { UserBook } from "@/assets/types/Book";
import { computed, PropType } from "vue";
import EditButton from "@/components/EditButton.vue";
import DeleteButton from "@/components/DeleteButton.vue";
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
</script>
<template>
  <Card class="book_small">
    <template #header>
      <div class="flex flex-row justify-content-between bg-office-dark2">
        <h3 class="p-3 color-orange">{{ userbook.editionType.name }}</h3>

        <div class="flex flex-row">
          <EditButton
            v-tooltip.top="{
              value: 'Edycja książki na mojej półce',
              showDelay: 500,
              hideDelay: 300,
            }"
            class="pr-0"
            @click="emit('edit', userbook)"
          />

          <DeleteButton
            v-tooltip.top="{
              value: 'Usunięcie książki z mojej półki',
              showDelay: 500,
              hideDelay: 300,
            }"
            class="mr-2"
            @click="emit('delete', userbook)"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!--      COVER     -->
      <div class="pt-4 flex justify-content-center">
        <img
          v-if="userbook?.book?.cover.length > 0"
          :src="userbook.book?.cover"
          height="375"
          width="250"
          alt="Okładka do książki"
        />
        <img
          v-else
          src="@/assets/HomeOffice.png"
          height="300"
          width="250"
          alt="Okładka do książki"
        />
      </div>

      <!--   AUTHORS   -->
      <h6 class="mt-1 color-orange flex justify-content-center">
        {{ getAuthors }}
      </h6>
      <h4
        v-tooltip.top="{
          value: userbook.book?.title,
          showDelay: 500,
          hideDelay: 300,
        }"
        class="color-orange flex justify-content-center"
      >
        {{ titleCal }}
      </h4>

      <!--   SERIES   -->
      <div class="book-series color-orange pl-2 pr-2">
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
        class="mt-0 mb-0 color-orange flex flex-column align-items-center bg-office-dark2"
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
  border: black 2px solid;
  margin: 15px;
}

.book-series {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0;
}
.p-card .p-card-footer {
  padding: 0;
}
</style>
