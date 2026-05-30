<script setup lang="ts">
  import { useBooksStore } from '@/stores/books.ts';
  import { computed, type PropType, ref, watch, watchEffect } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import BookFormFields from '@/components/library/BookFormFields.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddEditUserBookDialog from '@/components/library/AddEditUserBookDialog.vue';
  import { useToast } from 'primevue/usetoast';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  import type { Author, Book, Category, Series, UserBook } from '@/types/Book.ts';
  import type { AxiosError } from 'axios';

  const bookStore = useBooksStore();
  const userbookStore = useUserbooksStore();
  const visible = defineModel<boolean>('visible', { default: false });

  const toast = useToast();
  const selectedAuthors = ref<Author[]>([]);
  const selectedSeries = ref<Series | null>(null);
  const selectedCategories = ref<Category[]>([]);

  const props = defineProps({
    bookToAdd: {
      type: Object as PropType<Book>,
      required: true,
    },
  });

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const showAddToShelfConfirmation = ref(false);
  const showUserbookDialog = ref(false);
  const savedBookId = ref(0);
  const savedBookTitle = ref('');
  const addToShelfMessage = computed(
    () => `Czy chcesz od razu dodać książkę <b>${savedBookTitle.value}</b> na półkę?`
  );

  function finishDialogFlow() {
    visible.value = false;
    emit('close');
  }

  function cancelAddToShelf() {
    showAddToShelfConfirmation.value = false;
    finishDialogFlow();
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
    finishDialogFlow();
  }

  function onUserbookCancel() {
    showUserbookDialog.value = false;
    finishDialogFlow();
  }

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

  watchEffect(async () => {
    book.value = props.bookToAdd;
    selectedAuthors.value = props.bookToAdd.authors;
    selectedCategories.value = props.bookToAdd.categories;
    selectedSeries.value = props.bookToAdd.series;
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return bookStore.loadingBooks || bookStore.loadingSeries || bookStore.loadingAuthors || btnSaveDisabled.value;
  });

  const filteredAuthors = ref<Author[]>();
  const searchAuthor = (event: { query: string }) => {
    filteredAuthors.value = bookStore.authors.filter((author: Author) => {
      return author.lastName.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedAuthors, (newAuthors: Author[] | []) => {
    book.value.authors = newAuthors;
  });

  const filteredSeries = ref<Series[]>();
  const searchSeries = (event: { query: string }) => {
    filteredSeries.value = bookStore.series.filter((series: Series) => {
      return series.title.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedSeries, (newSeries: Series | null) => {
    book.value.series = newSeries;
  });

  const filteredCategories = ref<Category[]>();
  const searchCategory = (event: { query: string }) => {
    filteredCategories.value = bookStore.categories.filter((cat: Category) => {
      return cat.name.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedCategories, (newCategory: Category[] | []) => {
    book.value.categories = newCategory;
  });

  //
  //SAVE
  //
  function saveBook() {
    submitted.value = true;
    newBook();
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
          visible.value = false;
          showAddToShelfConfirmation.value = true;
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason);
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Książka już istnieje w bazie danych.',
              life: 3000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Błąd podczas dodawania książki.',
              life: 3000,
            });
          }
        });

      btnSaveDisabled.value = false;
      btnShowBusy.value = false;
      submitted.value = false;
    }
  }

  //
  //------------------------------------------------ERROR----------------------------------------------------------
  //
  const submitted = ref(false);

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Error Message',
      detail: msg,
      life: 3000,
    });
  };
  const isNotValid = () => {
    return showErrorTitle() || showErrorAuthor() || showErrorCategory() || showErrorCover();
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
    return submitted.value && book.value.cover.length === 0;
  };
</script>
<template>
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
  <Dialog
    v-model:visible="visible"
    :style="{ width: 'min(95vw, 64rem)' }"
    header="Nowa książka"
    :modal="true"
    close-on-escape
  >
    <div class="max-h-[70vh] overflow-y-auto pr-1">
      <form @submit.stop.prevent="saveBook">
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
          :show-add-buttons="false"
          id-prefix="new-book-dialog"
          @search-author="searchAuthor"
          @search-series="searchSeries"
          @search-category="searchCategory"
        />

        <div class="mt-8 flex flex-row justify-end gap-2">
          <OfficeButton
            text="zapisz"
            btn-type="office-save"
            type="submit"
            :loading="btnShowBusy"
            :btn-disabled="isSaveBtnDisabled"
          />
        </div>
      </form>
    </div>
  </Dialog>
</template>

<style scoped></style>
