<script setup lang="ts">
import TheMenuLibrary from "@/components/library/TheMenuLibrary.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import {useBooksStore} from "@/stores/books";
import {useUserbooksStore} from "@/stores/userbooks";
import {computed, ref} from "vue";
import {FilterMatchMode, FilterOperator, FilterService} from '@primevue/core/api';
import {Author, Book, Category, UserBook} from "@/types/Book";
import router from "@/router";
import {useToast} from "primevue/usetoast";
import AddBookToShellDialog from "@/components/library/AddEditUserBookDialog.vue";
import IconButton from "@/components/OfficeIconButton.vue";
import {BookDto} from "@/types/Book.ts";
import OfficeButton from "@/components/OfficeButton.vue";


const bookStore = useBooksStore();
const userbookStore = useUserbooksStore();
const toast = useToast();

FilterService.register('filterByAuthor', (authorsFilter: Author[], filterValue: string) => {
  if (!authorsFilter || authorsFilter.length === 0) return false;

  const displayAuthors = authorsFilter.map(author => `${author.lastName} ${author.firstName}`).join(", ");
  return displayAuthors.toLowerCase().includes(filterValue.toLowerCase());
});


//filter
const filters = ref();
const initFilters = () => {
  filters.value = {
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  categories: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // 'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  series: { value: null, matchMode: FilterMatchMode.IN },
  authors: {
    operator: FilterOperator.AND,
    constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.CONTAINS
        }
    ]
  },
};
}
initFilters();
const clearFilter = () => {
  initFilters();
};

const seriesFilter = computed(() => {
  return [...new Set(bookStore.books
      .filter(book => book.series)
      .map(book => book.series.title)
  )].sort((a, b) => a.localeCompare(b));
});

bookStore.getBooks();
const booksDto = computed(() => {
  return bookStore.books
      .map(mapBookToBookDto)
});
const expandedRows = ref([]);
const bookTemp = ref<Book>();
const mapBookToBookDto = (book: Book): BookDto => {
  return {
    id: book.id,
    series: book.series?.title ?? '', // Konwersja obiektu series na string
    authors: displayAuthors(book.authors), // Użycie funkcji do wyświetlenia autorów jako string
    categories: displayCategory(book.categories), // Użycie funkcji do wyświetlenia kategorii jako string
    title: book.title,
    description: book.description,
    cover: book.cover,
    bookInSeriesNo: book.bookInSeriesNo
  };
};
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
    await bookStore.deleteBookDb(bookTemp.value.id)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Usunięto książkę: " + bookTemp.value?.title,
            life: 3000,
          });
        })
        .catch(() => {
          toast.add({
            severity: "error",
            summary: "Błąd",
            detail: "Nie usunięto książki: " + bookTemp.value?.title,
            life: 3000,
          });
        })
  }
};
//
//-------------------------------------------------EDIT -------------------------------------------------
//
const editItem = (item: Book) => {
  const bookItem: Book = JSON.parse(JSON.stringify(item));
  router.push({
    name: "Book",
    params: {isEdit: "true", bookId: bookItem.id},
  });
};

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false);
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
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano książkę na półkę: " + newUserbook.book?.title,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Potwierdzenie",
        detail:
            "Nie udało się dodać książki na półkę: " + newUserbook.book?.title,
        life: 3000,
      });
    }
  }
};
</script>

<template>
  <TheMenuLibrary/>
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

  <Panel class="mt-5 ml-2 mr-2">
    <template #header>
      <div class="w-full flex justify-center gap-3">
        <h2>LISTA KSIĄŻEK</h2>
        <div v-if="bookStore.loadingBooks" class="flex">
          <ProgressSpinner
              class="ml-3"
              style="width: 35px; height: 35px"
              stroke-width="5"
          />
        </div>
      </div>
    </template>
    <DataTable
        v-if="!bookStore.loadingBooks"
        ref="dataTableRef"
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="booksDto"
        :loading="bookStore.loadingBooks"
        striped-rows
        removable-sort
        paginator
        :rows="20"
        :rows-per-page-options="[5, 10, 20, 50]"
        table-style="min-width: 50rem"
        filter-display="menu"
        :global-filter-fields="['authors', 'series', 'categories', 'title']"
        sort-field="date"
        :sort-order="-1"
        row-hover
    >
      <template #header>
        <div class="flex justify-between">
                    <router-link
                      :to="{ name: 'Book', params: { isEdit: 'false', bookId: 0 } }"
                      style="text-decoration: none"
                    >
                      <OfficeButton text="Nowa książka" btn-type="office-regular" />
                    </router-link>
          <Button type="button" icon="pi pi-filter-slash" label="Wyczyść" outlined @click="clearFilter()"/>
          <IconField icon-position="left">
            <InputIcon>
              <i class="pi pi-search"/>
            </InputIcon>
            <InputText
                v-model="filters['global'].value"
                placeholder="wpisz tutaj..."
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        <h4 v-if="!bookStore.loadingBooks" class="color-red">
          Nie znaleziono książek...
        </h4>
      </template>

<!--      AUTHOR        -->
      <Column expander style="width: 5rem"/>
      <Column
          field="authors"
          header="Autor"
          style="max-width: 120px"
          :sortable="true"
          :show-filter-match-modes="false">
        <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

<!--      TITLE     -->
      <Column field="title" header="Tytuł" sortable >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

<!--  CATEGORY  -->
      <Column
          field="categories"
          header="Kategoria"
          style="max-width: 120px"
          :sortable="true"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

<!--      SERIES    -->
      <Column field="series"  filter-field="series" header="Cykl" sortable  :show-filter-match-modes="false">
        <template #body="slotProps">
          {{ slotProps.data[slotProps.field] }}
        </template>
        <template #filter="{ filterModel }">
          <MultiSelect
              v-model="filterModel.value"
              :options="seriesFilter"
              placeholder="Wybierz..."
              class="p-column-filter"
              :max-selected-labels="2"
          />
        </template>
      </Column>

<!--      BOOK IN SERIES  -->
      <Column
          field="bookInSeriesNo"
          header="Część"
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
      <Column header="Akcja" :exportable="false" style="max-width: 70px">
        <template #body="slotProps">
          <div class="flex flex-row justify-between">
            <IconButton
                v-tooltip.top="{
                value: 'Dodaj książkę na półkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
                icon="pi pi-file-plus"
                @click="addUserbook(slotProps.data.id)"
            />
            <IconButton
                v-tooltip.top="{
                value: 'Edytuj książkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
                icon="pi pi-file-edit"
                @click="editItem(slotProps.data)"
            />
            <IconButton
                v-tooltip.top="{
                value: 'Usuń książkę',
                showDelay: 1000,
                hideDelay: 300,
              }"
                icon="pi pi-trash"
                severity="danger"
                class=""
                @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="flex ">
          <div class="flex flex-col p-3 col-9 w-full">
            <label class="text-left">Opis:</label>
            <Textarea
                v-model="slotProps.data.description"
                rows="13"
                auto-resize fluid
                readonly
            />
          </div>
          <Image
              v-if="slotProps.data.cover"
              class="col-3 mt-2"
              :src="slotProps.data.cover"
              alt="Okładka do książki"
              width="250"
          />
          <Image
              v-else
              class="col-4"
              src="../../assets/HomeOffice.png"
              height="250"
              width="250"
              alt="Okładka do książki"
          />
        </div>
      </template>
    </DataTable>
  </Panel>

  <Toolbar class="sticky-toolbar p-2 m-2">
    <template #start>
      <OfficeIconButton
          v-tooltip.right="{
          value: 'Odświerz listę książek',
          showDelay: 500,
          hideDelay: 300,
        }"
          :icon="bookStore.loadingBooks ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          class="mr-2"
          @click="bookStore.refreshBooks()"
      />
    </template>
    <template #end>
      <div class="flex flex-col">
        <p class="">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ selectedBooks }}</span>
        </p>
        <p class="">
          <span class="">RAZEM:</span>
          <span class="ml-3">{{ bookStore.books.length }} książek</span>
        </p>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped></style>
