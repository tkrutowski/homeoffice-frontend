<script setup lang="ts">
import TheMenuLibrary from "@/components/TheMenuLibrary.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import DeleteButton from "@/components/DeleteButton.vue";
import OfficeButton from "@/components/OfficeButton.vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import EditButton from "@/components/EditButton.vue";
import { useBooksStore } from "@/stores/books";
import { useUserbooksStore } from "@/stores/userbooks";
import { computed, ref } from "vue";
import { FilterMatchMode } from "primevue/api";
import { Author, Book, Category, UserBook } from "@/assets/types/Book";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import AddBookToShellDialog from "@/components/AddEditUserBookDialog.vue";
import IconButton from "@/components/IconButton.vue";
const bookStore = useBooksStore();
const userbookStore = useUserbooksStore();
const toast = useToast();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  // 'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  // representative: { value: null, matchMode: FilterMatchMode.IN },
  // status: { value: null, matchMode: FilterMatchMode.EQUALS },
  // verified: { value: null, matchMode: FilterMatchMode.EQUALS }
});

bookStore.getBooks();
const expandedRows = ref([]);
const bookTemp = ref<Book>();
const displayAuthors = (authors: Author[]) => {
  return authors
    .map((author) => author.lastName + " " + author.firstName)
    .join(", ");
};
const displayCategory = (categories: Category[]) => {
  return categories.map((category) => category.name).join(", ");
};

const dataTableRef = ref(null);
const selectedBooks = computed(() => {
  const processedData = dataTableRef.value?.processedData;
  if (processedData) {
    return processedData.length;
  }
  return 0;
});
//
//-------------------------------------------------DELETE -------------------------------------------------
//
const showDeleteConfirmationDialog = ref<boolean>(false);
const confirmDelete = (book: Book) => {
  bookTemp.value = book;
  showDeleteConfirmationDialog.value = true;
};
const deleteConfirmationMessage = computed(() => {
  if (bookTemp.value)
    return `Czy chcesz usunąc książkę: <b>${bookTemp.value?.title}</b>?`;
  return "No message";
});
const submitDelete = async () => {
  console.log("submitDelete()");
  showDeleteConfirmationDialog.value = false;
  if (bookTemp.value) {
    const result = await bookStore.deleteBookDb(bookTemp.value.id);
    if (result) {
      //update payment
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Usunięto książkę: " + bookTemp.value?.title,
        life: 3000,
      });
    }
  }
};
//
//-------------------------------------------------EDIT -------------------------------------------------
//
const editItem = (item: Book) => {
  const bookItem: Book = JSON.parse(JSON.stringify(item));
  router.push({
    name: "Book",
    params: { isEdit: "true", bookId: bookItem.id },
  });
};

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false);
// const addUserbook = (: Book) => {
const tempIdBook = ref<number>(0);
const addUserbook = (idBook: number) => {
  tempIdBook.value = idBook;
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
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel class="mt-5 mt-3 ml-2 mr-2">
    <template #header>
      <div class="w-full flex justify-content-center">
        <h3 class="color-green">LISTA KSIĄŻEK</h3>
        <div v-if="bookStore.loadingBooks">
          <ProgressSpinner
            class="ml-3"
            style="width: 40px; height: 40px"
            stroke-width="5"
          />
        </div>
      </div>
    </template>
    <DataTable
      v-if="!bookStore.loadingBooks"
      ref="dataTableRef"
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="bookStore.books"
      :loading="bookStore.loadingBooks"
      striped-rows
      removable-sort
      paginator
      :rows="20"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="row"
      :global-filter-fields="['authors', 'series.title', 'categories', 'title']"
      sort-field="date"
      :sort-order="-1"
      row-hover
    >
      <template #header>
        <div class="flex justify-content-sm-between">
          <router-link
            :to="{ name: 'Book', params: { isEdit: 'false', bookId: 0 } }"
            style="text-decoration: none"
          >
            <OfficeButton text="Nowa książka" btn-type="office" />
          </router-link>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </span>
        </div>
      </template>

      <template #empty>
        <h4 class="color-red" v-if="!bookStore.loadingBooks">
          Nie znaleziono książek...
        </h4>
      </template>

      <Column expander style="width: 5rem" />
      <Column
        field="authors"
        header="Autor"
        style="max-width: 120px"
        class="color-orange"
        sortable
      >
        <template #body="slotProps">
          {{ displayAuthors(slotProps.data[slotProps.field]) }}
        </template>
      </Column>
      <Column field="title" header="Tytuł" sortable class="color-orange" />
      <Column
        field="categories"
        header="Kategoria"
        style="max-width: 120px"
        class="color-orange"
        sortable
      >
        <template #body="slotProps">
          {{ displayCategory(slotProps.data[slotProps.field]) }}
        </template>
      </Column>
      <Column field="series" header="Cykl" sortable class="color-orange">
        <template #body="slotProps">
          {{ slotProps.data[slotProps.field].title }}
        </template>
      </Column>
      <Column
        field="bookInSeriesNo"
        header="Część"
        class="color-orange"
        style="max-width: 20px"
      >
        <template #body="slotProps">
          {{
            slotProps.data[slotProps.field] === 0
              ? "-"
              : slotProps.data[slotProps.field]
          }}
        </template>
      </Column>

      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="max-width: 60px">
        <template #body="slotProps">
          <div class="flex flex-row justify-content-between">
            <IconButton
              v-tooltip.top="{
                value: 'Dodaj książkę na półkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
              @click="addUserbook(slotProps.data.id)"
            />
            <EditButton
              v-tooltip.top="{
                value: 'Edytuj książkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
              @click="editItem(slotProps.data)"
            />
            <DeleteButton
              v-tooltip.top="{
                value: 'Usuń książkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
              class=""
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="flex grid">
          <div class="flex flex-column p-3 col-9">
            <label class="color-orange text-left">Opis:</label>
            <Textarea
              v-model="slotProps.data.description"
              rows="13"
              cols="30"
              readonly
            />
          </div>
          <Image
            class="col-3 mt-2"
            v-if="slotProps.data.cover"
            :src="slotProps.data.cover"
            alt="Okładka do książki"
            width="250"
          />
          <Image
            class="col-4"
            v-else
            src="../../assets/HomeOffice.png"
            height="250"
            width="250"
            alt="Okładka do książki"
          />
        </div>
      </template>
    </DataTable>
  </Panel>

  <Toolbar class="sticky-toolbar">
    <template #start>
      <OfficeIconButton
        v-tooltip.right="{
          value: 'Odświerz listę książek',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="bookStore.loadingBooks ? 'pi-spin pi-spinner' : 'pi-refresh'"
        class="mr-2"
        @click="bookStore.refreshBooks()"
      />
    </template>
    <template #end>
      <div class="flex flex-column">
        <p class="color-orange">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ selectedBooks }}</span>
        </p>
        <p class="color-orange">
          <span class="">RAZEM:</span>
          <span class="ml-3">{{ bookStore.books.length }} książek</span>
        </p>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped></style>
