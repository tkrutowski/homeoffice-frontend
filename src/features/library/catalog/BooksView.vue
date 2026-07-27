<script setup lang="ts">
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { computed, type DefineComponent, ref, watch } from 'vue';
  import { FilterMatchMode, FilterOperator, FilterService } from '@primevue/core/api';
  import type { Author, Book, Category, UserBook } from '@/features/library/shelf/types';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import AddBookToShellDialog from '@/features/library/shelf/AddEditUserBookDialog.vue';
  import type { BookDto } from '@/features/library/catalog/types';
  import type { AxiosError } from 'axios';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';
  import type { BookPageParams } from '@/features/library/_shared/queryKeys';
  import { useBooksPageQuery, useCategoriesQuery } from '@/features/library/catalog/queries/useBooksQueries';
  import { useDeleteBookMutation } from '@/features/library/catalog/queries/useBooksMutations';
  import { useSeriesListQuery } from '@/features/library/series/queries/useSeriesQueries';
  import { useCreateUserbookMutation } from '@/features/library/shelf/queries/useUserbooksMutations';

  // Typy dla DataTable events
  interface DataTablePageEvent {
    page: number;
    rows: number;
    first: number;
  }

  interface AppliedBookFilters {
    global: string | null;
    title: string | null;
    author: string | null;
    categories: string[] | null;
    series: string[] | null;
  }

  const toast = useToast();

  FilterService.register('filterByAuthor', (authorsFilter: Author[], filterValue: string) => {
    if (!authorsFilter || authorsFilter.length === 0) return false;

    const displayAuthors = authorsFilter.map(author => `${author.lastName} ${author.firstName}`).join(', ');
    return displayAuthors.toLowerCase().includes(filterValue.toLowerCase());
  });

  //
  //-------------------------------------------------PAGINACJA / SORTOWANIE-------------------------------------------------
  //
  const page = ref<number>(0);
  const rowsPerPage = ref<number>(parseInt(localStorage.getItem('rowsPerPageBooks') || '20', 10));
  const sortField = ref<string>('id');
  const sortOrder = ref<number>(-1); // 1 = ASC, -1 = DESC - domyślnie sortujemy po ID malejąco

  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      categories: { value: null, matchMode: FilterMatchMode.IN },
      // 'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      series: { value: null, matchMode: FilterMatchMode.IN },
      authors: {
        operator: FilterOperator.AND,
        constraints: [
          {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
          },
        ],
      },
    };
  };
  initFilters();

  const appliedFilters = ref<AppliedBookFilters>({
    global: null,
    title: null,
    author: null,
    categories: null,
    series: null,
  });

  function applyFilters() {
    appliedFilters.value = {
      global: filters.value.global?.value || null,
      title: filters.value.title?.value || null,
      author: filters.value.authors?.constraints?.[0]?.value || null,
      categories: filters.value.categories?.value?.length ? filters.value.categories.value : null,
      series: filters.value.series?.value?.length ? filters.value.series.value : null,
    };
    page.value = 0;
  }

  const clearFilter = () => {
    initFilters();
    applyFilters();
  };

  const bookPageParams = computed<BookPageParams>(() => ({
    page: page.value,
    size: rowsPerPage.value,
    sort: sortField.value,
    direction: sortOrder.value > 0 ? 'ASC' : 'DESC',
    globalFilter: appliedFilters.value.global,
    title: appliedFilters.value.title,
    author: appliedFilters.value.author,
    category: appliedFilters.value.categories?.length ? appliedFilters.value.categories.join(',') : null,
    series: appliedFilters.value.series?.length ? appliedFilters.value.series.join(',') : null,
  }));

  const { data: booksPageData, isFetching: loadingBooks } = useBooksPageQuery(bookPageParams);
  const { data: categoriesData } = useCategoriesQuery();
  const { data: seriesData } = useSeriesListQuery();

  const books = computed<Book[]>(() => booksPageData.value?.content ?? []);
  const totalBooks = computed<number>(() => booksPageData.value?.totalElements ?? 0);

  const deleteBookMutation = useDeleteBookMutation();
  const createUserbookMutation = useCreateUserbookMutation();

  const seriesFilter = computed(() => {
    return (seriesData.value ?? []).map(series => series.title).sort((a: string, b: string) => a.localeCompare(b));
  });

  const categoriesFilter = computed(() => {
    return (categoriesData.value ?? [])
      .map(category => category.name)
      .sort((a: string, b: string) => a.localeCompare(b));
  });

  const booksDto = computed(() => {
    return books.value.map(mapBookToBookDto);
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
      bookInSeriesNo: book.bookInSeriesNo,
    };
  };
  const displayAuthors = (authors: Author[]) => {
    return authors.map(author => author.lastName + ' ' + author.firstName).join(', ');
  };
  const displayCategory = (categories: Category[]) => {
    return categories.map(category => category.name).join(', ');
  };

  const dataTableRef = ref<DefineComponent | null>(null);

  //
  //-------------------------------------------------DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (book: Book) => {
    bookTemp.value = book;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (bookTemp.value) return `Czy chcesz usunąc książkę: <b>${bookTemp.value?.title}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    showDeleteConfirmationDialog.value = false;
    if (bookTemp.value) {
      await deleteBookMutation
        .mutateAsync(bookTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto książkę: ' + bookTemp.value?.title,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Nie usunięto książki: ' + bookTemp.value?.title,
            life: 3000,
          });
        });
    }
  };
  //
  //-------------------------------------------------EDIT -------------------------------------------------
  //
  const editItem = (item: Book) => {
    const bookItem: Book = JSON.parse(JSON.stringify(item));
    router.push({
      name: 'Book',
      params: { isEdit: 'true', bookId: bookItem.id },
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
    showUserbookDialog.value = false;
    if (newUserbook) {
      await createUserbookMutation
        .mutateAsync(newUserbook)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano książkę na półkę: ' + newUserbook.book?.title,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Nie udało się dodać książki na półkę: ' + newUserbook.book?.title,
            life: 3000,
          });
        });
    }
  };

  const handlePageChange = (event: DataTablePageEvent) => {
    localStorage.setItem('rowsPerPageBooks', event.rows.toString());
    rowsPerPage.value = event.rows;
    page.value = event.page;
  };

  const handleSort = (event: any) => {
    sortField.value = event.sortField ?? 'id';
    sortOrder.value = typeof event.sortOrder === 'number' ? event.sortOrder : -1;
    page.value = 0;
  };

  const handleFilter = () => {
    applyFilters();
  };

  // Obsługa wyszukiwania globalnego z debounce
  let searchTimeout: NodeJS.Timeout | null = null;

  watch(
    () => filters.value.global.value,
    newValue => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Search when value has more than 3 letters or is empty
      if (!newValue || newValue.length >= 3) {
        searchTimeout = setTimeout(() => {
          applyFilters();
        }, 500); // 500ms debounce
      }
    }
  );
</script>

<template>
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

  <MainPageShell>
    <template #top>
      <TheMenuLibrary />
    </template>

    <Panel class="my-3 mx-2">
      <DataTable
        ref="dataTableRef"
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="booksDto"
        removable-sort
        paginator
        lazy
        :sort-mode="'single'"
        :rows="rowsPerPage"
        :total-records="totalBooks"
        :rows-per-page-options="[5, 10, 20, 50]"
        table-style="min-width: 50rem"
        filter-display="menu"
        :global-filter-fields="['authors', 'series', 'categories', 'title']"
        row-hover
        size="small"
        @page="handlePageChange"
        @sort="handleSort"
        @filter="handleFilter"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="Od {first} do {last} (Wszystkich książek: {totalRecords})"
      >
        <template #header>
          <div class="flex justify-between">
            <router-link :to="{ name: 'Book', params: { isEdit: 'false', bookId: 0 } }" style="text-decoration: none">
              <ButtonOutlined text="Dodaj" icon="pi pi-plus" title="Dodaj nową książkę" />
            </router-link>
            <div v-if="loadingBooks">
              <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
            </div>
            <div class="flex gap-4">
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText class="!max-w-32" v-model="filters['global'].value" placeholder="wyszukaj..." />
              </IconField>
              <Button
                type="button"
                icon="pi pi-filter-slash"
                outlined
                size="small"
                title="Wyczyść filtry"
                @click="clearFilter()"
              />
            </div>
          </div>
        </template>

        <template #empty>
          <p v-if="!loadingBooks" class="text-red-500">Nie znaleziono książek...</p>
        </template>

        <!--      AUTHOR        -->
        <Column expander style="width: 5rem" />
        <Column
          field="authors"
          header="Autor"
          style="max-width: 120px"
          :sortable="true"
          :show-filter-match-modes="false"
        >
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
          </template>
        </Column>

        <!--      TITLE     -->
        <Column field="title" header="Tytuł" sortable>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
          </template>
        </Column>

        <!--  CATEGORY  -->
        <Column
          field="categories"
          filter-field="categories"
          header="Kategoria"
          style="max-width: 120px"
          :sortable="true"
          :show-filter-match-modes="false"
        >
          <template #body="slotProps">
            {{ slotProps.data[slotProps.field] }}
          </template>
          <template #filter="{ filterModel }">
            <MultiSelect
              v-model="filterModel.value"
              :options="categoriesFilter"
              placeholder="Wybierz..."
              class="p-column-filter"
              :max-selected-labels="2"
            />
          </template>
        </Column>

        <!--      SERIES    -->
        <Column field="series" filter-field="series" header="Cykl" sortable :show-filter-match-modes="false">
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
        <Column field="bookInSeriesNo" header="Część" style="max-width: 20px">
          <template #body="slotProps">
            {{ slotProps.data[slotProps.field] === 0 ? '-' : slotProps.data[slotProps.field] }}
          </template>
        </Column>

        <!--                EDIT, DELETE-->
        <Column header="Akcja" :exportable="false" style="max-width: 70px; justify-items: center">
          <template #body="slotProps">
            <div class="flex flex-row justify-between">
              <OfficeIconButton
                title="Dodaj książkę na półkę"
                class="text-orange-500"
                icon="pi pi-book"
                @click="addUserbook(slotProps.data.id)"
              />
              <OfficeIconButton
                title="Edytuj książkę"
                icon="pi pi-file-edit"
                class="text-orange-500"
                @click="editItem(slotProps.data)"
              />
              <OfficeIconButton
                title="Usuń książkę"
                icon="pi pi-trash"
                class="text-red-500"
                @click="confirmDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>

        <template #expansion="slotProps">
          <div class="flex">
            <div class="flex flex-col p-3 w-full">
              <label class="text-left">Opis:</label>
              <Textarea v-model="slotProps.data.description" rows="11" auto-resize fluid readonly />
            </div>
            <Image
              v-if="slotProps.data.cover"
              class="mt-2"
              :src="slotProps.data.cover"
              alt="Okładka do książki"
              width="250"
            />
            <Image
              v-else
              class=""
              src="../../../assets/HomeOffice.png"
              height="250"
              width="250"
              alt="Okładka do książki"
            />
          </div>
        </template>
      </DataTable>
    </Panel>
  </MainPageShell>
</template>
<style scoped>
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
