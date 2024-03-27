<script setup lang="ts">
import OfficeButton from "@/components/OfficeButton.vue";
import { onMounted, ref } from "vue";
import { useUserbooksStore } from "@/stores/userbooks";
import TheMenuLibrary from "@/components/TheMenuLibrary.vue";
import { Book, Series, UserBook } from "@/assets/types/Book";
import { useBooksStore } from "@/stores/books";
import SeriesBook from "@/components/SeriesBook.vue";
import { useToast } from "primevue/usetoast";
import AddBookToShellDialog from "@/components/AddEditUserBookDialog.vue";
const booksStore = useBooksStore();
const userbookStore = useUserbooksStore();
const toast = useToast();

async function getSeries() {
  if (selectedSeries.value)
    await booksStore.getBooksInSeriesFromDb(selectedSeries.value?.id);
}

onMounted(async () => {
  if (booksStore.series.length === 0) await booksStore.getSeriesFromDb();
});

const selectedSeries = ref<Series | undefined>();
const filteredSeries = ref<Series[]>();
const searchSeries = (event: { query: string }) => {
  filteredSeries.value = booksStore.series.filter((series) => {
    return series.title.toLowerCase().includes(event.query.toLowerCase());
  });
};

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false);
// const addUserbook = (: Book) => {
const tempIdBook = ref<number>(0);
const addUserbook = (book: Book) => {
  console.log("ddUserbook()", book);
  tempIdBook.value = book.id;
  showUserbookDialog.value = true;
};
const submitAddUserbook = async (newUserbook: UserBook) => {
  console.log("submitAddUserbook()", newUserbook);
  showUserbookDialog.value = false;
  if (newUserbook) {
    const result = await userbookStore.addUserbookDb(newUserbook);
    if (result) {
      //update payment
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano książkę na półkę: " + newUserbook.book?.title,
        life: 3000,
      });
    }
  }
};
</script>

<template>
  <TheMenuLibrary />
  <AddBookToShellDialog
    v-model:visible="showUserbookDialog"
    :id-book="tempIdBook"
    @save="submitAddUserbook"
    @cancel="showUserbookDialog = false"
  />
  <Toolbar class="m-6">
    <template #start> {{ booksStore.booksInSeries.length }}</template>

    <template #center>
      <div class="flex flex-column">
        <label class="color-orange" for="series">Wybierz cykl:</label>
        <AutoComplete
          id="input-customer"
          v-model="selectedSeries"
          dropdown
          force-selection
          :suggestions="filteredSeries"
          field="title"
          @complete="searchSeries"
        />
      </div>
      <div v-if="booksStore.loadingSeries" class="mt-4">
        <ProgressSpinner
          class="ml-2 mt-1"
          style="width: 40px; height: 40px"
          stroke-width="5"
        />
      </div>
    </template>

    <template #end>
      <OfficeButton
        text="wyszukaj"
        btn-type="office"
        :btn-disabled="booksStore.loadingBooksInSeries || !selectedSeries"
        :is-busy-icon="booksStore.loadingBooksInSeries"
        @click="getSeries"
      />
    </template>
  </Toolbar>
  <div class="ml-2 mr-2">
    <div v-for="book in booksStore.booksInSeries" :key="book.id">
      <SeriesBook :book="book" @new-userbook="addUserbook" />
      <!--      <UserPayments-->
      <!--        :id-user="+userId"-->
      <!--        :year="+paymentStore.paymentSelectedYear"-->
      <!--      />-->
    </div>
  </div>
</template>

<style scoped></style>
