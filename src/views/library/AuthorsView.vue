<script setup lang="ts">
  import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useBooksStore } from '@/stores/books';
  import { computed, ref, onMounted, watch } from 'vue';
  import type { Author } from '@/types/Book';
  import { useToast } from 'primevue/usetoast';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import BookSmall from '@/components/library/BookSmall.vue';
  import type { Book } from '@/types/Book';
  import type { AxiosError } from 'axios';
  // Typy dla DataTable events
  interface DataTablePageEvent {
    page: number;
    rows: number;
    first: number;
  }
  const booksStore = useBooksStore();
  const toast = useToast();

  // filters
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
  };
  initFilters();

  const clearFilter = async () => {
    initFilters();
    await booksStore.filterAuthors(filters.value);
  };

  // Load authors
  booksStore.getAuthorsFromDbPage(0);

  const authorTemp = ref<Author>();
  const authorStatistics = ref<Map<number, number>>(new Map());
  const selectedAuthor = ref<Author | null>(null);
  const authorBooks = ref<Book[]>([]);

  const getCounter = (author: Author) => {
    console.log('getCounter()', `${author.lastName} ${author.firstName}`);
    return authorStatistics.value.get(author.id) || 0;
  };

  //
  //-------------------------------------------------DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (author: Author) => {
    authorTemp.value = author;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (authorTemp.value)
      return `Czy chcesz usunąć autora: <b>${authorTemp.value?.lastName} ${authorTemp.value?.firstName}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (authorTemp.value) {
      await booksStore
        .deleteAuthorDb(authorTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto autora: ' + authorTemp.value?.lastName + ' ' + authorTemp.value?.firstName,
            life: 3000,
          });
          authorTemp.value = undefined;
        })
        .catch((reason: AxiosError) => {
          console.log('submitDelete() error', reason);
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail:
              reason?.response?.data && (reason.response.data as any).message
                ? (reason.response.data as any).message
                : 'Nie usunięto autora: ' + authorTemp.value?.lastName + ' ' + authorTemp.value?.firstName,
            life: 5000,
          });
        });
    }
  };

  //
  //-------------------------------------------------ADD/EDIT -------------------------------------------------
  //
  const showAddDialog = ref<boolean>(false);
  const isEditMode = ref<boolean>(false);
  const editingAuthor = ref<Author | null>(null);

  const addAuthor = () => {
    isEditMode.value = false;
    editingAuthor.value = null;
    showAddDialog.value = true;
  };

  const editAuthor = (item: Author) => {
    isEditMode.value = true;
    editingAuthor.value = { ...item };
    showAddDialog.value = true;
  };

  const dialogTitle = computed(() => {
    return isEditMode.value ? 'Edytuj autora' : 'Dodaj autora';
  });

  const submitAddEdit = async (lastName: string, firstName: string) => {
    console.log('submitAddEdit()', lastName, firstName);
    showAddDialog.value = false;

    const authorData: Author = {
      id: isEditMode.value ? editingAuthor.value!.id : 0,
      lastName,
      firstName,
    };

    try {
      if (isEditMode.value) {
        await booksStore.updateAuthorDb(authorData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaktualizowano autora: ' + lastName + ' ' + firstName,
          life: 3000,
        });
      } else {
        await booksStore.addAuthorDb(authorData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano autora: ' + lastName + ' ' + firstName,
          life: 3000,
        });
      }
    } catch (reason: any) {
      toast.add({
        severity: 'error',
        summary: reason?.message || 'Błąd',
        detail: `Nie udało się ${isEditMode.value ? 'zaktualizować' : 'dodać'} autora: ` + lastName + ' ' + firstName,
        life: 3000,
      });
    }
  };

  const handlePageChange = async (event: DataTablePageEvent) => {
    console.log('handlePageChange()', event);
    localStorage.setItem('rowsPerPageAuthors', event.rows.toString());
    booksStore.authorsRowsPerPage = event.rows;
    await booksStore.loadAuthorsPage(event.page);
  };

  const handleSort = async (event: any) => {
    console.log('handleSort()', event);
    await booksStore.sortAuthors(event.sortField, event.sortOrder);
  };

  const onRowSelect = async (event: { data: Author }) => {
    console.log('onRowSelect()', event.data);
    selectedAuthor.value = event.data;
    authorBooks.value = await booksStore.getAuthorBooks(event.data.id);
  };

  const handleFilter = async () => {
    console.log('handleFilter()', filters.value);
    await booksStore.filterAuthors(filters.value);
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
        searchTimeout = setTimeout(async () => {
          console.log('Global search:', newValue);
          await booksStore.filterAuthors(filters.value);
        }, 500); // 500ms debounce
      }
    }
  );

  //------------------------------------MOUNTED------------------------------
  onMounted(async () => {
    console.log('onMounted AuthorsView');
    try {
      authorStatistics.value = await booksStore.getAuthorStatistics();
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk autorów:', error);
    }
  });
</script>

<template>
  <div class="h-[calc(100vh-150px)] overflow-hidden">
    <TheMenuLibrary />
    <div class="flex">
      <div class="w-1/3">
        <AddDialog
          v-model:visible="showAddDialog"
          :msg="dialogTitle"
          label1="Nazwisko"
          label2="Imię"
          :value1="editingAuthor?.lastName || ''"
          :value2="editingAuthor?.firstName || ''"
          @save="submitAddEdit"
          @cancel="showAddDialog = false"
        />
        <ConfirmationDialog
          v-model:visible="showDeleteConfirmationDialog"
          :msg="deleteConfirmationMessage"
          label="Usuń"
          @save="submitDelete"
          @cancel="showDeleteConfirmationDialog = false"
        />

        <Panel class="my-3 mx-2 h-[calc(100vh-240px)] overflow-hidden">
          <DataTable
            scrollable
            scrollHeight="calc(100vh - 370px)"
            :value="booksStore.authors"
            removable-sort
            paginator
            lazy
            :sort-mode="'single'"
            v-model:filters="filters"
            filter-display="menu"
            :global-filter-fields="['lastName', 'firstName']"
            :rows="booksStore.authorsRowsPerPage"
            :total-records="booksStore.totalAuthors"
            :rows-per-page-options="[5, 10, 20, 50]"
            table-style="width: 100%"
            row-hover
            size="small"
            @page="handlePageChange"
            @sort="handleSort"
            @filter="handleFilter"
            selectionMode="single"
            v-model:selection="selectedAuthor"
            @row-select="onRowSelect"
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
            current-page-report-template="Od {first} do {last} (Wszystkich autorów: {totalRecords})"
          >
            <template #header>
              <div class="flex justify-between">
                <ButtonOutlined text="Dodaj" icon="pi pi-plus" title="Dodaj nowego autora" @click="addAuthor()" />
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
                <div v-if="booksStore.loadingAuthors">
                  <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
                </div>
              </div>
            </template>

            <template #empty>
              <p v-if="!booksStore.loadingAuthors" class="text-red-500">Nie znaleziono autorów...</p>
            </template>

            <!--      LAST NAME        -->
            <Column field="lastName" header="Nazwisko" sortable></Column>

            <!--      FIRST NAME     -->
            <Column field="firstName" header="Imię" sortable></Column>

            <!--  BOOK COUNT  -->
            <Column field="bookCount" header="Ilość książek" sortable style="max-width: 120px">
              <template #body="slotProps">
                {{ getCounter(slotProps.data) }}
              </template>
            </Column>

            <!--                EDIT, DELETE-->
            <Column header="Akcja" :exportable="false" style="max-width: 70px; justify-items: center">
              <template #body="slotProps">
                <div class="flex flex-row justify-between">
                  <OfficeIconButton title="Edytuj autora" icon="pi pi-file-edit" @click="editAuthor(slotProps.data)" />
                  <OfficeIconButton
                    title="Usuń autora"
                    icon="pi pi-trash"
                    severity="danger"
                    @click="confirmDelete(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>

      <!-- Books container -->
      <div class="w-2/3 h-[calc(100vh-240px)] overflow-y-auto p-4">
        <div v-if="selectedAuthor" class="flex flex-wrap gap-4">
          <BookSmall v-for="book in authorBooks" :key="book.id" :book="book" />
        </div>
        <div v-else class="flex items-center justify-center h-full text-lg text-gray-500">
          Wybierz autora, aby zobaczyć jego książki
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
