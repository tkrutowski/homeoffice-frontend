<script setup lang="ts">
  import { useBooksStore } from '@/stores/books';
  import { useRoute } from 'vue-router';
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import type { Author, Book, Category, Series, UserBook } from '@/types/Book';
  import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import BookFormFields from '@/components/library/BookFormFields.vue';
  import BookUrlLookupPanel from '@/components/library/BookUrlLookupPanel.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddEditUserBookDialog from '@/components/library/AddEditUserBookDialog.vue';
  import { useUserbooksStore } from '@/stores/userbooks';
  import { ListBulletIcon } from '@heroicons/vue/24/outline';
  import type { AxiosError } from 'axios';

  const bookStore = useBooksStore();
  const userbookStore = useUserbooksStore();
  const route = useRoute();

  const toast = useToast();
  const selectedAuthors = ref<Author[]>([]);
  const selectedSeries = ref<Series | null>(null);
  const selectedCategories = ref<Category[]>([]);
  const authors = ref<Author[]>([]);
  const book = ref<Book>({
    id: 0,
    series: null,
    authors: [],
    categories: [],
    title: '',
    description: '',
    cover: '',
    bookInSeriesNo: '',
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return bookStore.loadingBooks || bookStore.loadingSeries || bookStore.loadingAuthors || btnSaveDisabled.value;
  });
  //
  //AUTO COMPLETE
  //
  //AUTHOR
  const filteredAuthors = ref<Author[]>();
  const searchAuthor = (event: { query: string }) => {
    filteredAuthors.value = authors.value.filter((author: Author) => {
      return (
        author.lastName.toLowerCase().includes(event.query.toLowerCase()) ||
        author.firstName.toLowerCase().includes(event.query.toLowerCase())
      );
    });
  };
  watch(selectedAuthors, (newAuthors: Author[] | []) => {
    book.value.authors = newAuthors;
  });

  //SERIES
  const filteredSeries = ref<Series[]>();
  const searchSeries = (event: { query: string }) => {
    filteredSeries.value = bookStore.series.filter((series: Series) => {
      return series.title.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedSeries, (newSeries: Series | null) => {
    book.value.series = newSeries;
  });

  //CATEGORY
  const filteredCategories = ref<Category[]>();
  const searchCategory = (event: { query: string }) => {
    filteredCategories.value = bookStore.categories.filter((cat: Category) => {
      return cat.name.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedCategories, (newCategory: Category[] | []) => {
    book.value.categories = newCategory;
  });

  function findExistingCategory(category: Category): Category | undefined {
    return bookStore.categories.find(
      (cat: Category) =>
        (category.id > 0 && cat.id === category.id) || cat.name.toLowerCase() === category.name.toLowerCase()
    );
  }

  function mapToExistingCategories(categories: Category[]): Category[] {
    const matched: Category[] = [];
    const skippedNames: string[] = [];

    for (const category of categories) {
      const existing = findExistingCategory(category);
      if (existing) {
        if (!matched.some((cat: Category) => cat.id === existing.id)) {
          matched.push(existing);
        }
      } else if (category.name) {
        skippedNames.push(category.name);
      }
    }

    if (skippedNames.length > 0) {
      toast.add({
        severity: 'warn',
        summary: 'Kategorie',
        detail: `Pominięto nieistniejące kategorie: ${skippedNames.join(', ')}`,
        life: 5000,
      });
    }

    return matched;
  }

  function findExistingAuthor(author: Author): Author | undefined {
    if (author.id > 0) {
      return authors.value.find((a: Author) => a.id === author.id);
    }
    return authors.value.find(
      (a: Author) =>
        a.firstName.toLowerCase() === author.firstName.toLowerCase() &&
        a.lastName.toLowerCase() === author.lastName.toLowerCase()
    );
  }

  function findExistingSeries(series: Series): Series | undefined {
    if (series.id > 0) {
      return bookStore.series.find((s: Series) => s.id === series.id);
    }
    return bookStore.series.find((s: Series) => s.title.toLowerCase() === series.title.toLowerCase());
  }

  const showAddModal = ref(false);
  const showAddSeriesModal = ref(false);

  type UrlSearchPendingItem = { kind: 'series'; series: Series } | { kind: 'author'; author: Author };

  const urlSearchPendingQueue = ref<UrlSearchPendingItem[]>([]);
  const addAuthorFromUrlFlow = ref(false);
  const addAuthorPrefillFirstName = ref('');
  const addAuthorPrefillLastName = ref('');
  const addSeriesFromUrlFlow = ref(false);
  const addSeriesPrefillTitle = ref('');
  const addSeriesPrefillUrl = ref('');

  function clearUrlSearchFlow() {
    urlSearchPendingQueue.value = [];
    addAuthorFromUrlFlow.value = false;
    addSeriesFromUrlFlow.value = false;
    addAuthorPrefillFirstName.value = '';
    addAuthorPrefillLastName.value = '';
    addSeriesPrefillTitle.value = '';
    addSeriesPrefillUrl.value = '';
  }

  function openAddAuthorModal() {
    clearUrlSearchFlow();
    showAddModal.value = true;
  }

  function openAddSeriesModal() {
    clearUrlSearchFlow();
    showAddSeriesModal.value = true;
  }

  async function processNextUrlSearchPending() {
    if (urlSearchPendingQueue.value.length === 0) {
      clearUrlSearchFlow();
      return;
    }

    const item = urlSearchPendingQueue.value[0];
    await nextTick();

    if (item.kind === 'series') {
      addSeriesFromUrlFlow.value = true;
      addAuthorFromUrlFlow.value = false;
      addSeriesPrefillTitle.value = item.series.title;
      addSeriesPrefillUrl.value = item.series.url ?? '';
      showAddModal.value = false;
      showAddSeriesModal.value = true;
    } else {
      addAuthorFromUrlFlow.value = true;
      addSeriesFromUrlFlow.value = false;
      addAuthorPrefillFirstName.value = item.author.firstName;
      addAuthorPrefillLastName.value = item.author.lastName;
      showAddSeriesModal.value = false;
      showAddModal.value = true;
    }
  }

  function advanceUrlSearchQueue() {
    addAuthorFromUrlFlow.value = false;
    addSeriesFromUrlFlow.value = false;
    urlSearchPendingQueue.value.shift();
    showAddModal.value = false;
    showAddSeriesModal.value = false;
    nextTick(() => processNextUrlSearchPending());
  }

  function cancelAddAuthor() {
    showAddModal.value = false;
  }

  function cancelAddSeries() {
    showAddSeriesModal.value = false;
  }

  watch(showAddModal, visible => {
    if (!visible && addAuthorFromUrlFlow.value) {
      advanceUrlSearchQueue();
    }
  });

  watch(showAddSeriesModal, visible => {
    if (!visible && addSeriesFromUrlFlow.value) {
      advanceUrlSearchQueue();
    }
  });

  function buildUrlSearchPendingQueue(bookByUrl: Book): UrlSearchPendingItem[] {
    const queue: UrlSearchPendingItem[] = [];

    if (bookByUrl.series?.title) {
      const existingSeries = findExistingSeries(bookByUrl.series);
      if (!existingSeries) {
        queue.push({ kind: 'series', series: bookByUrl.series });
      }
    }

    for (const author of bookByUrl.authors ?? []) {
      const existingAuthor = findExistingAuthor(author);
      if (!existingAuthor && (author.firstName || author.lastName)) {
        queue.push({ kind: 'author', author });
      }
    }

    return queue;
  }

  async function applyBookFromSearch(bookByUrl: Book) {
    if (bookStore.categories.length === 0) {
      await bookStore.getCategoriesFromDb();
    }
    if (bookStore.series.length === 0) {
      await bookStore.getSeriesFromDb();
    }
    if (authors.value.length === 0) {
      authors.value = await bookStore.getAuthorsFromDb();
    }

    book.value = bookByUrl;
    selectedCategories.value = mapToExistingCategories(bookByUrl.categories);

    if (bookByUrl.series?.title) {
      selectedSeries.value = findExistingSeries(bookByUrl.series) ?? null;
    } else {
      selectedSeries.value = null;
    }

    const matchedAuthors: Author[] = [];
    for (const author of bookByUrl.authors ?? []) {
      const existing = findExistingAuthor(author);
      if (existing && !matchedAuthors.some((a: Author) => a.id === existing.id)) {
        matchedAuthors.push(existing);
      }
    }
    selectedAuthors.value = matchedAuthors;

    urlSearchPendingQueue.value = buildUrlSearchPendingQueue(bookByUrl);
    if (urlSearchPendingQueue.value.length > 0) {
      await processNextUrlSearchPending();
    }
  }

  //
  //SAVE
  //
  function saveBook() {
    submitted.value = true;
    if (isEdit.value) {
      editBook();
    } else {
      newBook();
    }
  }

  //
  //---------------------------------------------------------NEW BOOK----------------------------------------------
  //
  async function newBook() {
    console.log('newBook()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      book.value.authors = selectedAuthors.value;
      book.value.categories = selectedCategories.value;
      book.value.series = selectedSeries.value;
      bookStore
        .addBookDb(book.value)
        .then((savedBook: Book) => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano książkę: ' + savedBook.title,
            life: 3000,
          });
          btnShowBusy.value = false;
          savedBookId.value = savedBook.id;
          savedBookTitle.value = savedBook.title;
          showAddToShelfConfirmation.value = true;
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason);
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Książka już istnieje w bazie danych.',
              life: 5000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: reason?.message,
              detail: 'Błąd podczas dodawania książki.',
              life: 5000,
            });
          }
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
          submitted.value = false;
        });
    }
  }

  //
  //-----------------------------------------------------EDIT BOOK------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editBook() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      console.log('editBook()');
      book.value.authors = selectedAuthors.value;
      book.value.categories = selectedCategories.value;
      book.value.series = selectedSeries.value;
      await bookStore
        .updateBookDb(book.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano książkę: ' + book.value?.title,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Books' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas edycji książki.',
            life: 5000,
          });
          btnSaveDisabled.value = false;
        });
    }
  }

  //---------------------------------------------MOUNTED--------------------------------------------
  onMounted(async () => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    authors.value = await bookStore.getAuthorsFromDb();
    if (bookStore.series.length === 0) bookStore.getSeriesFromDb();
    if (bookStore.categories.length === 0) bookStore.getCategoriesFromDb();
    btnSaveDisabled.value = false;
  });

  onMounted(async () => {
    btnSaveDisabled.value = true;
    isEdit.value = route.params.isEdit === 'true';
    const bookId = Number(route.params.bookId as string);
    if (!isEdit.value && bookId === -1) {
      book.value = bookStore.tempBook;
      selectedAuthors.value = book.value.authors;
      selectedCategories.value = mapToExistingCategories(book.value.categories);
      selectedSeries.value = book.value.series;
    } else if (!isEdit.value && bookId === 0) {
      console.log('onMounted NEW BOOK');
    } else {
      console.log('onMounted EDIT BOOK');
      bookStore
        .getBookFromDb(bookId)
        .then((data: Book | null) => {
          if (data) {
            book.value = data;
            selectedAuthors.value = book.value.authors;
            selectedCategories.value = mapToExistingCategories(book.value.categories);
            selectedSeries.value = book.value.series;
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania książek:', error);
        });
    }
    btnSaveDisabled.value = false;
  });
  //
  //--------------------------------------------------AUTHOR
  //

  async function saveAuthor(firstName: string, lastName: string) {
    if (firstName.length === 0 || lastName.length === 0) {
      showError('Uzupełnij brakujące elementy');
      return;
    }

    try {
      const newAuthor = await bookStore.addAuthorDb({
        id: 0,
        firstName: firstName,
        lastName: lastName,
      });
      authors.value.push(newAuthor);

      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano autora: ' + firstName + ' ' + lastName,
        life: 3000,
      });

      if (addAuthorFromUrlFlow.value) {
        if (!selectedAuthors.value.some((a: Author) => a.id === newAuthor.id)) {
          selectedAuthors.value = [...selectedAuthors.value, newAuthor];
        }
        advanceUrlSearchQueue();
      } else {
        showAddModal.value = false;
      }
    } catch (reason) {
      const axiosError = reason as AxiosError;
      toast.add({
        severity: 'error',
        summary: axiosError?.message,
        detail: 'Nie dodano autora: ' + firstName + ' ' + lastName,
        life: 5000,
      });
    }
  }

  //
  //--------------------------------------------------SERIES
  //

  async function saveSeries(title: string, url: string) {
    if (title.length === 0 || url.length === 0) {
      showError('Uzupełnij brakujące elementy');
      return;
    }

    try {
      const newSeries = await bookStore.addSeriesDb({
        id: 0,
        title: title,
        description: '',
        url: url,
        checkDate: null,
        hasNewBooks: false,
      });

      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano serię: ' + title,
        life: 3000,
      });

      if (addSeriesFromUrlFlow.value) {
        selectedSeries.value = newSeries;
        advanceUrlSearchQueue();
      } else {
        showAddSeriesModal.value = false;
      }
    } catch (reason) {
      const axiosError = reason as AxiosError;
      toast.add({
        severity: 'error',
        summary: axiosError?.message,
        detail: 'Nie dodano serii: ' + title,
        life: 5000,
      });
    }
  }

  //
  //--------------------------------------------------CATEGORY
  //
  const showAddCategoryModal = ref(false);
  const showAddToShelfConfirmation = ref(false);
  const showUserbookDialog = ref(false);
  const savedBookId = ref(0);
  const savedBookTitle = ref('');
  const addToShelfMessage = computed(() => `Czy chcesz od razu dodać książkę <b>${savedBookTitle.value}</b> na półkę?`);

  function cancelAddToShelf() {
    showAddToShelfConfirmation.value = false;
    resetForm();
  }

  function confirmAddToShelf() {
    showAddToShelfConfirmation.value = false;
    showUserbookDialog.value = true;
  }

  async function submitAddUserbook(newUserbook: UserBook) {
    showUserbookDialog.value = false;
    if (newUserbook) {
      await userbookStore
        .addUserbookDb(newUserbook)
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
    resetForm();
  }

  function onUserbookCancel() {
    showUserbookDialog.value = false;
    resetForm();
  }

  async function saveCategory(name: string) {
    console.log('in1: ', name);
    showAddCategoryModal.value = false;
    if (name.length === 0) {
      showError('Uzupełnij brakujące elementy');
    } else {
      await bookStore
        .addCategoryDb({
          id: 0,
          name: name,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano kategorię: ' + name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Nie dodano kategorii: ' + name,
            life: 5000,
          });
        });
    }
  }

  //
  //----------------------------------------------SEARCH---------------------------------------------
  //
  const searchUrl = ref<string>('');
  const btnSearchShowError = ref<boolean>(false);
  const btnSearchShowBusy = ref<boolean>(false);
  const btnSearchShowOk = ref<boolean>(false);
  const btnSearchDisabled = ref<boolean>(false);

  async function findBook(ai: boolean = false) {
    console.log('START - findBook(' + searchUrl.value + ')');
    submittedSearch.value = true;
    resetForm();
    clearUrlSearchFlow();
    if (isSearchNotValid()) {
      showError('Uzupełnij brakujące elementy');
      btnSearchShowError.value = true;
      setTimeout(() => (btnSearchShowError.value = false), 5000);
    } else {
      btnSearchDisabled.value = true;
      try {
        const bookByUrl = await bookStore.getBookFromUrl(searchUrl.value, ai);
        if (bookByUrl == null) {
          changeStatusSearchIcon(false, false, true);
          setTimeout(() => changeStatusSearchIcon(false, false, false), 8000);
          toast.add({
            severity: 'info',
            summary: 'Informacja',
            detail: 'Nie znaleziono książki.',
            life: 3500,
          });
        } else {
          changeStatusSearchIcon(false, true, false);
          setTimeout(() => changeStatusSearchIcon(false, false, false), 8000);
          await applyBookFromSearch(bookByUrl);
        }
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Błąd podczas wyszukiwania książki...',
          life: 3500,
        });
      } finally {
        btnSearchDisabled.value = false;
        bookStore.searchBook = false;
      }
    }
  }

  function resetForm() {
    book.value = {
      id: 0,
      series: null,
      authors: [],
      categories: [],
      title: '',
      description: '',
      cover: '',
      bookInSeriesNo: '',
    };
    selectedAuthors.value = [];
    selectedCategories.value = [];
    selectedSeries.value = null;
    clearUrlSearchFlow();
    submitted.value = false;
    btnSaveDisabled.value = false;
  }

  function changeStatusSearchIcon(busy: boolean, saved: boolean, error: boolean) {
    btnSearchShowBusy.value = busy;
    btnSearchShowError.value = error;
    btnSearchShowOk.value = saved;
  }

  //
  //------------------------------------------------ERROR----------------------------------------------------------
  //
  const submitted = ref(false);
  const submittedSearch = ref(false);

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Error Message',
      detail: msg,
      life: 3000,
    });
  };
  const isSearchNotValid = () => {
    return showErrorUrl();
  };
  const isNotValid = () => {
    return showErrorTitle() || showErrorAuthor() || showErrorCategory() || showErrorCover();
  };
  const showErrorUrl = () => {
    return submittedSearch.value && searchUrl.value.length === 0;
  };
  const showErrorTitle = () => {
    return submitted.value && book.value.title.length === 0;
  };
  const showErrorAuthor = () => {
    return submitted.value && book.value.authors.length === 0;
  };
  const showErrorCategory = () => {
    return submitted.value && book.value.categories.length === 0;
  };
  const showErrorCover = () => {
    return submitted.value && !!book.value.cover && book.value.cover.length === 0;
  };
</script>

<template>
  <AddDialog
    v-model:visible="showAddModal"
    label2="Nazwisko:"
    msg="Dodaj autora"
    label1="Imię:"
    :value1="addAuthorPrefillFirstName"
    :value2="addAuthorPrefillLastName"
    @save="saveAuthor"
    @cancel="cancelAddAuthor"
  />
  <AddDialog
    v-model:visible="showAddSeriesModal"
    msg="Dodaj serię"
    label1="Tytuł:"
    label2="URL:"
    :value1="addSeriesPrefillTitle"
    :value2="addSeriesPrefillUrl"
    @save="saveSeries"
    @cancel="cancelAddSeries"
  />
  <AddDialog
    v-model:visible="showAddCategoryModal"
    msg="Dodaj kategorię"
    label1="Nazwa:"
    @save="saveCategory"
    @cancel="showAddCategoryModal = false"
  />
  <ConfirmationDialog
    v-model:visible="showAddToShelfConfirmation"
    :msg="addToShelfMessage"
    label="Dodaj na półkę"
    @save="confirmAddToShelf"
    @cancel="cancelAddToShelf"
  />
  <AddEditUserBookDialog
    v-model:visible="showUserbookDialog"
    :id-book="savedBookId"
    @save="submitAddUserbook"
    @cancel="onUserbookCancel"
  />

  <MainPageShell>
    <template #top>
      <TheMenuLibrary />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <form class="mx-auto max-w-6xl" @submit.stop.prevent="saveBook">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{ isEdit ? `Edycja książki: ${book?.title}` : 'Nowa książka' }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <OfficeIconButton
                title="Powrót do listy książek"
                class="text-orange-500"
                @click="() => router.push({ name: 'Books' })"
              >
                <template #icon>
                  <ListBulletIcon aria-hidden="true" />
                </template>
              </OfficeIconButton>
              <ProgressSpinner v-if="bookStore.loadingBooks" class="h-8 w-8 [&>svg]:h-8 [&>svg]:w-8" stroke-width="5" />
            </div>
          </div>

          <BookUrlLookupPanel
            v-if="!isEdit"
            v-model:search-url="searchUrl"
            :show-error-url="showErrorUrl()"
            :loading="bookStore.searchBook"
            :btn-disabled="btnSearchDisabled"
            @search="findBook()"
            @search-ai="findBook(true)"
          />

          <BookFormFields
            v-model:book="book"
            v-model:selected-authors="selectedAuthors"
            v-model:selected-series="selectedSeries"
            v-model:selected-categories="selectedCategories"
            :filtered-authors="filteredAuthors"
            :filtered-series="filteredSeries"
            :filtered-categories="filteredCategories"
            :show-error-title="showErrorTitle()"
            :show-error-author="showErrorAuthor()"
            :show-error-category="showErrorCategory()"
            :show-error-cover="showErrorCover()"
            :loading-authors="bookStore.loadingAuthors"
            :loading-series="bookStore.loadingSeries"
            :loading-categories="bookStore.loadingCategories"
            @search-author="searchAuthor"
            @search-series="searchSeries"
            @search-category="searchCategory"
            @add-author="openAddAuthorModal"
            @add-series="openAddSeriesModal"
            @add-category="showAddCategoryModal = true"
          />

          <div class="mt-8 flex flex-row justify-end gap-2">
            <OfficeButton v-if="!isEdit" text="Reset" type="button" btn-type="office-regular" @click="resetForm()" />
            <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :loading="btnShowBusy"
              :btn-disabled="isSaveBtnDisabled"
            />
          </div>
        </div>
      </form>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
