<script setup lang="ts">
  import { type DefineComponent, ref, watchEffect } from 'vue';
  import type { PropType } from 'vue';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  import type { Book, Series, UserBook } from '@/types/Book.ts';
  import { useBooksStore } from '@/stores/books.ts';
  import { useToast } from 'primevue/usetoast';
  import AddBookToShellDialog from '@/components/library/AddEditUserBookDialog.vue';
  import SeriesBook from '@/components/library/SeriesBook.vue';
  import { UtilsService } from '@/service/UtilsService.ts';
  import AddEditSeriesDialog from '@/components/library/AddEditSeriesDialog.vue';
  import NewBookDialog from '@/components/library/NewBookDialog.vue';
  import type { AxiosError } from 'axios';

  const booksStore = useBooksStore();
  const userbookStore = useUserbooksStore();
  const toast = useToast();

  const props = defineProps({
    series: {
      type: Object as PropType<Series>,
      required: true,
    },
  });

  const carouselKey = ref<number>(0);
  const booksInSeries = ref<Book[]>([]);
  const tempSeries = ref<Series>({
    id: 0,
    url: '',
    hasNewBooks: false,
    checkDate: null,
    description: '',
    title: '',
  });

  watchEffect(async () => {
    tempSeries.value = props.series;
    await refresh();
  });

  function sortBooksBySeriesNo(books: Book[]): Book[] {
    return [...books].sort(
      (a: Book, b: Book) => Number.parseFloat(a.bookInSeriesNo) - Number.parseFloat(b.bookInSeriesNo)
    );
  }

  /** Książka z bazy ma id > 0; id === 0 to kandydat z API (jeszcze nie zapisany w bibliotece). */
  function isBookCandidate(book: Book): boolean {
    return book.id === 0;
  }

  function getBookListKey(book: Book): string {
    return `${book.bookInSeriesNo}::${book.title}`;
  }

  function getSeriesBookComponentKey(book: Book): string {
    const listKey = getBookListKey(book);
    const token = bookCardRefreshTokens.value[listKey] ?? 0;
    return `${book.id}::${listKey}::${token}`;
  }

  function bumpSeriesBookCard(book: Book) {
    const listKey = getBookListKey(book);
    bookCardRefreshTokens.value = {
      ...bookCardRefreshTokens.value,
      [listKey]: (bookCardRefreshTokens.value[listKey] ?? 0) + 1,
    };
  }

  function isSameBookInSeries(a: Book, b: Book): boolean {
    if (a.id > 0 && b.id > 0) return a.id === b.id;
    return a.title === b.title && a.bookInSeriesNo === b.bookInSeriesNo;
  }

  function mergeBookCandidatesIntoList(existing: Book[], candidates: Book[]): { books: Book[]; addedCount: number } {
    const merged = [...existing];
    let addedCount = 0;
    for (const book of candidates) {
      if (!merged.some(b => isSameBookInSeries(b, book))) {
        merged.push(book);
        addedCount++;
      }
    }
    return { books: sortBooksBySeriesNo(merged), addedCount };
  }

  async function refresh() {
    const fromDb = await booksStore.getBooksInSeriesFromDb(props.series?.id);
    const pendingCandidates = booksInSeries.value.filter(
      book => isBookCandidate(book) && !fromDb.some(dbBook => isSameBookInSeries(dbBook, book))
    );
    booksInSeries.value = sortBooksBySeriesNo([...fromDb, ...pendingCandidates]);
    carouselKey.value++;
  }

  async function findNewBookInSeries(url: string) {
    try {
      const candidates = await booksStore.getNewBooksInSeriesFromDb(props.series?.id, url);
      if (candidates.length > 0) {
        const { books, addedCount } = mergeBookCandidatesIntoList(booksInSeries.value, candidates);
        if (addedCount > 0) {
          booksInSeries.value = books;
          carouselKey.value++;
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Znaleziono ' + addedCount + ' ' + getBooksCountLabel(addedCount) + ' do dodania do biblioteki',
            life: 3000,
          });
        } else {
          toast.add({
            severity: 'info',
            summary: 'Potwierdzenie',
            detail: 'Znalezieni kandydaci są już na liście.',
            life: 3000,
          });
        }
      } else {
        toast.add({
          severity: 'info',
          summary: 'Potwierdzenie',
          detail: 'Nie znaleziono nowych książek.',
          life: 3000,
        });
      }
      const series = await booksStore.getSeriesByIdFromDb(props.series?.id);
      if (series) tempSeries.value = series;
    } catch (reason) {
      const error = reason as AxiosError;
      toast.add({
        severity: 'error',
        summary: error?.message,
        detail: 'Wystąpił błąd',
        life: 3000,
      });
    }
  }

  //
  //-------------------------------------------------USERBOOK-------------------------------------------------
  //
  const showUserbookDialog = ref<boolean>(false);
  const tempIdBook = ref<number>(0);
  const userbookBookListKey = ref<string | null>(null);
  const bookCardRefreshTokens = ref<Record<string, number>>({});
  const addUserbook = (book: Book) => {
    tempIdBook.value = book.id;
    userbookBookListKey.value = getBookListKey(book);
    showUserbookDialog.value = true;
  };
  const submitAddUserbook = async (newUserbook: UserBook) => {
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
          const book = booksInSeries.value.find(b => getBookListKey(b) === userbookBookListKey.value);
          if (book) bumpSeriesBookCard(book);
          userbookBookListKey.value = null;
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas dodawania książki na półkę.',
            life: 3000,
          });
        });
    }
  };

  //
  //-------------------------------------------------------SERIES
  //
  const showSeriesDialog = ref<boolean>(false);
  const tempIdSeries = ref<number>(0);
  const editSeries = () => {
    if (tempSeries.value) {
      tempIdSeries.value = tempSeries.value?.id;
    }
    showSeriesDialog.value = true;
  };
  const submitSeries = async (series: Series) => {
    showSeriesDialog.value = false;
    if (series && series.id > 0) {
      console.log('submitSeries(): EDIT');
      booksStore
        .updateSeriesDb(series)
        .then((res: Series) => {
          tempSeries.value = res;
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano cykl: ' + series.title,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji cyklu: ' + series.title,
            life: 3000,
          });
        });
    }
  };

  //
  //----------------------------BOOK
  //
  const showAddNewBookDialog = ref<boolean>(false);
  const editingCandidateKey = ref<string | null>(null);
  const bookToAdd = ref<Book>({
    id: 0,
    title: '',
    series: null,
    bookInSeriesNo: '',
    description: '',
    authors: [],
    categories: [],
    cover: '',
  });
  const addBook = (book: Book) => {
    console.log('showAddNewBookDialog', book);
    editingCandidateKey.value = getBookListKey(book);
    bookToAdd.value = book;
    showAddNewBookDialog.value = true;
  };

  function onBookSavedToDb(savedBook: Book) {
    const candidateKey = editingCandidateKey.value;
    if (!candidateKey) return;

    const index = booksInSeries.value.findIndex(book => getBookListKey(book) === candidateKey);
    if (index >= 0) {
      booksInSeries.value[index] = savedBook;
    }
    editingCandidateKey.value = null;
  }

  const afterSavedBook = () => {
    showAddNewBookDialog.value = false;
  };

  /** ~300px szerokości karty SeriesBook + marginesy; breakpointy jak w Tailwind (2xl/xl/lg/md/sm). */
  const responsiveOptions = ref([
    {
      breakpoint: '1536px',
      numVisible: 4,
      numScroll: 2,
    },
    {
      breakpoint: '1280px',
      numVisible: 3,
      numScroll: 2,
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '640px',
      numVisible: 1,
      numScroll: 1,
    },
  ]);

  function getBooksCountLabel(count: number) {
    if (count === 1) {
      return 'książka';
    } else if (count > 1 && count < 5) {
      return 'książki';
    } else {
      return 'książek';
    }
  }

  const menuRef = ref<DefineComponent | null>(null);
  const items = ref([
    {
      label: 'Odświerz',
      icon: 'pi pi-refresh',
      command: () => {
        refresh();
      },
    },
    {
      label: 'Edytuj',
      icon: 'pi pi-file-edit',
      command: () => {
        editSeries();
      },
    },
    {
      separator: true,
    },
    {
      label: 'Poszukaj nowe',
      items: [
        {
          label: 'Legimi',
          icon: 'pi pi-search',
          disabled: () => !tempSeries.value?.url.includes('legimi.pl'),
          command: () => {
            const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'legimi.pl', ';;');
            if (result.length > 0) {
              findNewBookInSeries(result[0]);
            }
          },
        },
        {
          label: 'Upoluj ebooka',
          icon: 'pi pi-search',
          disabled: () => !tempSeries.value?.url.includes('upolujebooka.pl'),
          command: () => {
            const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'upolujebooka.pl', ';;');
            if (result.length > 0) {
              findNewBookInSeries(result[0]);
            }
          },
        },
        {
          label: 'Lubimy czytać',
          icon: 'pi pi-search',
          disabled: () => !tempSeries.value?.url.includes('lubimyczytac.pl'),
          command: () => {
            const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'lubimyczytac.pl', ';;');
            if (result.length > 0) {
              findNewBookInSeries(result[0]);
            }
          },
        },
      ],
    },
  ]);
  const toggle = (event: Event) => {
    menuRef.value?.toggle(event);
  };
</script>

<template>
  <AddBookToShellDialog
    v-model:visible="showUserbookDialog"
    :id-book="tempIdBook"
    @save="submitAddUserbook"
    @cancel="showUserbookDialog = false"
  />

  <AddEditSeriesDialog
    v-model:visible="showSeriesDialog"
    :id-series="tempIdSeries"
    @save="submitSeries"
    @cancel="showSeriesDialog = false"
  />

  <NewBookDialog
    v-model:visible="showAddNewBookDialog"
    :book-to-add="bookToAdd"
    @saved="onBookSavedToDb"
    @close="afterSavedBook"
  />
  <Panel class="mb-10 w-full text-color">
    <template #header>
      <div class="flex items-center gap-4">
        <p class="font-bold text-3xl ml-2">
          <span class="text-primary">{{ props.series.title }} </span> -
          {{ booksInSeries.length }}
          {{ getBooksCountLabel(booksInSeries.length) }}
        </p>
        <div v-if="booksStore.loadingBooksInSeries">
          <ProgressSpinner class="ml-2 mt-1" style="width: 30px; height: 30px" stroke-width="5" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <Tag
          v-if="tempSeries && tempSeries.hasNewBooks"
          value="Znaleziono nowe książki"
          severity="success"
          class="larger-tag"
        />
        <span v-else />
        <span class=""
          >Sprawdzono: <span class="text-sm"> {{ tempSeries.checkDate }}</span></span
        >
      </div>
    </template>
    <template #icons>
      <Button icon="pi pi-cog" severity="secondary" rounded text @click="toggle" />
      <Menu ref="menuRef" id="config_menu" :model="items" popup />
    </template>
    <div class="card" style="overflow: hidden">
      <!--                verticalViewPortHeight="300px" -->
      <Carousel
        :value="booksInSeries"
        :responsive-options="responsiveOptions"
        :num-visible="5"
        :num-scroll="3"
        class="w-full"
        :key="carouselKey"
        style="overflow: hidden; width: 100%"
      >
        <template #item="slotProps">
          <div class="flex justify-center">
            <SeriesBook
              :key="getSeriesBookComponentKey(slotProps.data)"
              :book="slotProps.data"
              @new-userbook="addUserbook"
              @exist-userbook="addUserbook"
              @new-book="addBook"
            />
          </div>
        </template>
      </Carousel>
    </div>
  </Panel>
</template>

<style scoped>
  .card {
    overflow: hidden;
  }

  .p-carousel {
    width: 100%;
  }

  .p-carousel-viewport {
    overflow: hidden;
  }
</style>
