<script setup lang="ts">
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddEditSeriesDialog from './AddEditSeriesDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useSeriesListQuery } from '@/features/library/series/queries/useSeriesQueries';
  import {
    useCreateSeriesMutation,
    useDeleteSeriesMutation,
    useUpdateSeriesMutation,
  } from '@/features/library/series/queries/useSeriesMutations';
  import { useBooksInSeriesQuery } from '@/features/library/catalog/queries/useBooksQueries';
  import { useCreateUserbookMutation } from '@/features/library/shelf/queries/useUserbooksMutations';
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { Series } from '@/features/library/shelf/types';
  import { useToast } from 'primevue/usetoast';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import BookSmall from '@/features/library/series/BookSmall.vue';
  import type { Book, UserBook } from '@/features/library/shelf/types';
  import type { AxiosError } from 'axios';
  import AddEditUserBookDialog from '@/features/library/shelf/AddEditUserBookDialog.vue';
  import NewBookDialog from '@/features/library/catalog/NewBookDialog.vue';
  import legimiLogo from '@/assets/images/legimi.png';
  import upolujebookaLogo from '@/assets/images/upolujebooka.png';
  import lubimyczytacLogo from '@/assets/images/lubimyczytac.png';

  const toast = useToast();
  const route = useRoute();
  const router = useRouter();

  // filters
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
  };
  initFilters();

  const clearFilter = () => {
    initFilters();
  };

  const { data: seriesListData, isFetching: loadingSeries } = useSeriesListQuery();
  const createSeriesMutation = useCreateSeriesMutation();
  const updateSeriesMutation = useUpdateSeriesMutation();
  const deleteSeriesMutation = useDeleteSeriesMutation();
  const createUserbookMutation = useCreateUserbookMutation();

  // Computed property for filtered series
  const filteredSeries = computed(() => {
    const series = seriesListData.value ?? [];
    if (!filters.value.global.value) {
      return series;
    }

    const searchTerm = filters.value.global.value.toLowerCase();
    return series.filter(
      (serie: Series) =>
        serie.title.toLowerCase().includes(searchTerm) || serie.description?.toLowerCase().includes(searchTerm)
    );
  });

  const seriesTemp = ref<Series>();
  const selectedSeries = ref<Series | null>(null);
  const selectedSeriesId = computed(() => selectedSeries.value?.id ?? 0);
  const { data: seriesBooksData, refetch: refetchSeriesBooks } = useBooksInSeriesQuery(
    selectedSeriesId,
    computed(() => selectedSeriesId.value > 0)
  );
  const seriesBooks = computed(() => seriesBooksData.value ?? []);

  // Funkcja do formatowania daty
  const formatDate = (date: Date | null) => {
    if (!date) return 'Brak daty';
    return new Date(date).toLocaleDateString('pl-PL');
  };

  // Funkcja do parsowania URL-i
  const parseUrls = (urlString: string) => {
    if (!urlString) return [];
    return urlString.split(';;').filter(url => url.trim() !== '');
  };

  // Funkcja do określania logo na podstawie URL
  const getLogoForUrl = (url: string): string | undefined => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('legimi')) {
      return legimiLogo;
    } else if (lowerUrl.includes('upolujebooka')) {
      return upolujebookaLogo;
    } else if (lowerUrl.includes('lubimyczytac')) {
      return lubimyczytacLogo;
    }

    // Domyślna ikona dla innych URL-i
    return undefined;
  };

  //
  //-------------------------------------------------DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (series: Series) => {
    seriesTemp.value = series;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (seriesTemp.value) return `Czy chcesz usunąć cykl: <b>${seriesTemp.value?.title}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (seriesTemp.value) {
      await deleteSeriesMutation
        .mutateAsync(seriesTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto cykl: ' + seriesTemp.value?.title,
            life: 3000,
          });
          seriesTemp.value = undefined;
        })
        .catch((reason: AxiosError) => {
          console.log('submitDelete() error', reason);
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail:
              reason?.response?.data && (reason.response.data as any).message
                ? (reason.response.data as any).message
                : 'Nie usunięto cyklu: ' + seriesTemp.value?.title,
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
  const editingSeriesId = ref<number>(0);

  // Userbook dialog variables
  const showUserbookDialog = ref<boolean>(false);
  const showAddNewBookDialog = ref<boolean>(false);
  const tempIdBook = ref<number>(0);
  const bookToAdd = ref<Book>({
    id: 0,
    series: null,
    authors: [],
    categories: [],
    title: '',
    description: '',
    cover: '',
    bookInSeriesNo: '',
  });

  const addSeries = () => {
    isEditMode.value = false;
    editingSeriesId.value = 0;
    showAddDialog.value = true;
  };

  function isNewSeriesQuery(v: unknown): boolean {
    if (v === '1' || v === 1) return true;
    if (Array.isArray(v) && v[0] != null) return String(v[0]) === '1';
    return false;
  }

  watch(
    () => route.query.new,
    v => {
      if (!isNewSeriesQuery(v)) return;
      addSeries();
      router.replace({ name: 'Series', query: {} });
    },
    { immediate: true }
  );

  const editSeries = (item: Series) => {
    isEditMode.value = true;
    editingSeriesId.value = item.id;
    showAddDialog.value = true;
  };

  const submitAddEdit = async (seriesData: Series) => {
    console.log('submitAddEdit()', seriesData);
    showAddDialog.value = false;

    try {
      if (isEditMode.value) {
        await updateSeriesMutation.mutateAsync(seriesData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaktualizowano cykl: ' + seriesData.title,
          life: 3000,
        });
      } else {
        await createSeriesMutation.mutateAsync(seriesData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano cykl: ' + seriesData.title,
          life: 3000,
        });
      }
    } catch (reason: any) {
      toast.add({
        severity: 'error',
        summary: reason?.message || 'Błąd',
        detail: `Nie udało się ${isEditMode.value ? 'zaktualizować' : 'dodać'} cyklu: ` + seriesData.title,
        life: 3000,
      });
    }
  };

  // Userbook methods
  const addUserbook = (book: Book) => {
    tempIdBook.value = book.id;
    showUserbookDialog.value = true;
  };

  const addBook = (book: Book) => {
    console.log('showAddNewBookDialog', book);
    bookToAdd.value = book;
    showAddNewBookDialog.value = true;
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
        .catch((error: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Nie udało się dodać książki na półkę: ' + (error.response?.data as string) || error.message,
            life: 3000,
          });
        });
    }
  };

  const afterSavedBook = async () => {
    showAddNewBookDialog.value = false;
    if (selectedSeries.value) {
      await refetchSeriesBooks();
    }
  };

  const onRowSelect = (event: { data: Series }) => {
    console.log('onRowSelect()', event.data);
    selectedSeries.value = event.data;
  };
</script>

<template>
  <MainPageShell :scroll-default-slot="false">
    <template #top>
      <TheMenuLibrary />
    </template>
    <div class="flex min-h-0 min-w-0 flex-1 flex-row">
      <div class="flex min-h-0 min-w-0 w-1/3 flex-col">
        <AddEditSeriesDialog
          v-model:visible="showAddDialog"
          :id-series="editingSeriesId"
          :is-edit="isEditMode"
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

        <AddEditUserBookDialog
          v-model:visible="showUserbookDialog"
          :id-book="tempIdBook"
          @save="submitAddUserbook"
          @cancel="showUserbookDialog = false"
        />

        <NewBookDialog
          v-model:visible="showAddNewBookDialog"
          :book-to-add="bookToAdd"
          @save="afterSavedBook"
          @cancel="showAddNewBookDialog = false"
        />

        <Panel class="series-panel my-3 mx-2 flex min-h-0 flex-1 flex-col overflow-hidden">
          <DataTable
            scrollable
            scrollHeight="flex"
            :value="filteredSeries"
            removable-sort
            v-model:filters="filters"
            filter-display="menu"
            :global-filter-fields="['title', 'description']"
            table-style="width: 100%"
            row-hover
            size="small"
            selectionMode="single"
            v-model:selection="selectedSeries"
            @row-select="onRowSelect"
          >
            <template #header>
              <div class="flex justify-between">
                <ButtonOutlined text="Dodaj" icon="pi pi-plus" title="Dodaj nowy cykl" @click="addSeries()" />
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
                <div v-if="loadingSeries">
                  <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
                </div>
              </div>
            </template>

            <template #empty>
              <p v-if="!loadingSeries" class="text-red-500">Nie znaleziono cykli...</p>
            </template>

            <!--      TITLE        -->
            <Column field="title" header="Tytuł" :sortable="true">
              <template #body="slotProps">
                <span :title="slotProps.data.description" class="cursor-help">
                  {{ slotProps.data.title }}
                </span>
              </template>
            </Column>

            <!--      URL     -->
            <Column field="url" header="Linki" :sortable="true">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <a
                    v-for="(url, index) in parseUrls(slotProps.data.url)"
                    :key="index"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :title="url"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <img v-if="getLogoForUrl(url)" :src="getLogoForUrl(url)" :alt="url" class="w-5 h-5" />
                    <i v-else class="pi pi-external-link text-sm"></i>
                  </a>
                </div>
              </template>
            </Column>

            <!--  CHECK DATE  -->
            <Column field="checkDate" header="Data sprawdzenia" :sortable="true" style="max-width: 140px">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.checkDate) }}
              </template>
            </Column>

            <!--                EDIT, DELETE-->
            <Column header="Akcja" :exportable="false" style="max-width: 70px; justify-items: center">
              <template #body="slotProps">
                <div class="flex flex-row justify-between">
                  <OfficeIconButton
                    class="text-orange-500"
                    title="Edytuj cykl"
                    icon="pi pi-file-edit"
                    @click="editSeries(slotProps.data)"
                  />
                  <OfficeIconButton
                    title="Usuń cykl"
                    icon="pi pi-trash"
                    class="text-red-500"
                    @click="confirmDelete(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>

      <!-- Books container: bez display:flex na zewnątrz — brak rozciągania kart na wysokość kolumny -->
      <div class="min-h-0 min-w-0 w-2/3 flex-1 overflow-y-auto p-4">
        <div v-if="selectedSeries" class="flex flex-wrap content-start items-start gap-4">
          <BookSmall
            v-for="book in seriesBooks"
            :key="book.id"
            :book="book"
            @new-userbook="addUserbook"
            @exist-userbook="addUserbook"
            @new-book="addBook"
          />
        </div>
        <div v-else class="flex items-center justify-center h-full text-lg text-gray-500">
          Wybierz cykl, aby zobaczyć książki z tego cyklu
        </div>
      </div>
    </div>
  </MainPageShell>
</template>

<style scoped>
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }

  :deep(.series-panel.p-panel) {
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  :deep(.series-panel .p-panel-content-container) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  :deep(.series-panel .p-panel-content) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  :deep(.series-panel .p-datatable) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
