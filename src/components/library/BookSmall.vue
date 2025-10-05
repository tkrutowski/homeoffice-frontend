<script setup lang="ts">
  import type { Author, Book, UserBook } from '@/types/Book.ts';
  import { ReadingStatus } from '@/types/Book.ts';
  import { computed, type PropType, onMounted, ref } from 'vue';
  import ImageButton from '@/components/ImageButton.vue';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  import { TranslationService } from '@/service/TranslationService.ts';
  import SeriesCarouselInfoDialog from '@/components/library/SeriesCarouselInfoDialog.vue';

  const userbookStore = useUserbooksStore();
  const props = defineProps({
    book: {
      type: Object as PropType<Book>,
      required: true,
    },
  });

  const emit = defineEmits<{
    (e: 'newUserbook', book: Book): void;
    (e: 'existUserbook', book: Book): void;
    (e: 'newBook', book: Book): void;
  }>();

  const existedUserbooks = ref<UserBook[]>([]);
  const showSeriesDialog = ref<boolean>(false);

  onMounted(async () => {
    refreshUserbooks();
  });

  const refreshUserbooks = async () => {
    const userbooks = await userbookStore.getUserbooksByBookIdFromDb(props.book?.id);
    if (userbooks && userbooks.length > 0) existedUserbooks.value = userbooks;
  };

  const newUserbook = () => {
    emit('newUserbook', props.book);
  };

  const existUserbook = () => {
    emit('existUserbook', props.book);
  };

  const newBook = () => {
    emit('newBook', props.book);
  };

  const openSeriesDialog = () => {
    console.log('openSeriesDialog', props.book?.series);
    if (props.book?.series) {
      showSeriesDialog.value = true;
    }
  };

  const seriesCal = computed(() => {
    const tempSeries = props.book?.series;
    if (tempSeries && tempSeries.title?.length > 21) {
      return tempSeries.title.slice(0, 21) + '...';
    }
    return tempSeries?.title;
  });

  const titleCal = computed(() => {
    const org = props.book?.title;
    if (org && org.length > 20) {
      return org.slice(0, 20) + '...';
    }
    return org;
  });

  const getAuthors = computed(() => {
    return props.book?.authors.map((a: Author) => a.firstName + ' ' + a.lastName).join(',');
  });

  const checkStatus = computed(() => {
    if (existedUserbooks.value.length === 0) {
      return null;
    }
    if (existedUserbooks.value.length > 1) {
      // Sprawdzenie, czy któraś książka ma status "READ"
      const readBook = existedUserbooks.value.find((book: UserBook) => book.readingStatus === ReadingStatus.READ);
      if (readBook) {
        return readBook.readingStatus;
      }
      // Sprawdzenie, czy któraś książka ma status "READ_NOW"
      const readNowBook = existedUserbooks.value.find(
        (book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW
      );
      if (readNowBook) {
        return readNowBook.readingStatus;
      }
      // Sprawdzenie, czy któraś książka ma status "NOT_READ"
      const notReadBook = existedUserbooks.value.find(
        (book: UserBook) => book.readingStatus === ReadingStatus.NOT_READ
      );
      if (notReadBook) {
        return notReadBook.readingStatus;
      }
      return null;
    }
    // Jeżeli jest tylko jedna książka, zwróć jej status
    return existedUserbooks.value[0].readingStatus;
  });

  const getStatusMsg = computed(() => {
    if (existedUserbooks.value.length === 0) {
      return '';
    }
    if (existedUserbooks.value.length > 1) {
      // Sprawdzenie, czy któraś książka ma status "READ"
      const readBook = existedUserbooks.value.find((book: UserBook) => book.readingStatus === ReadingStatus.READ);
      if (readBook) {
        return TranslationService.translateEnum('ReadingStatus', readBook.readingStatus);
      }
      // Sprawdzenie, czy któraś książka ma status "READ_NOW"
      const readNowBook = existedUserbooks.value.find(
        (book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW
      );
      if (readNowBook) {
        return TranslationService.translateEnum('ReadingStatus', readNowBook.readingStatus);
      }
      // Sprawdzenie, czy któraś książka ma status "NOT_READ"
      const notReadBook = existedUserbooks.value.find(
        (book: UserBook) => book.readingStatus === ReadingStatus.NOT_READ
      );
      if (notReadBook) {
        return TranslationService.translateEnum('ReadingStatus', notReadBook.readingStatus);
      }
      return 'Brak danych';
    }
    // Jeżeli jest tylko jedna książka, zwróć jej status
    return TranslationService.translateEnum('ReadingStatus', existedUserbooks.value[0].readingStatus);
  });

  const getSeverity = () => {
    if (existedUserbooks.value.length === 0) {
      return 'danger';
    }
    const readNowBook = existedUserbooks.value.find((book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW);
    if (readNowBook) {
      return 'warn';
    }
    const readBook = existedUserbooks.value.find((book: UserBook) => book.readingStatus === ReadingStatus.READ);
    if (readBook) {
      return 'success';
    }
    const notReadBook = existedUserbooks.value.find((book: UserBook) => book.readingStatus === ReadingStatus.NOT_READ);
    if (notReadBook) {
      return 'danger';
    }
    return 'danger';
  };

  const ifExistsMsg = computed(() => {
    if (props.book.id === 0) {
      return 'Brak książki w bibliotece.';
    }
    if (existedUserbooks.value.length > 0) {
      let msg = '';
      existedUserbooks.value.forEach(book => {
        if (book.readingStatus === ReadingStatus.READ) {
          msg += '\nPrzeczytana (' + book.readFrom + ' - ' + book.readTo + ')';
        } else if (book.readingStatus === ReadingStatus.NOT_READ) {
          msg += 'Nie przeczytana';
        } else if (book.readingStatus === ReadingStatus.READ_NOW) {
          msg += 'Czytam (' + book.readFrom + ' - ... )';
        }
      });
      return msg;
    } else {
      return 'Brak książki na mojej półce.';
    }
  });
</script>

<template>
  <div class="book-card w-[300px] m-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
    <!-- COVER -->
    <div class="w-full relative">
      <img
        v-if="book?.cover != 'https://focikhome.synology.me/covers/'"
        :src="book.cover"
        alt="Okładka do książki"
        class="w-full h-[400px] object-cover"
      />
      <img
        v-else
        src="../../assets/images/no_cover.png"
        alt="Okładka do książki"
        class="w-full h-[400px] object-cover"
      />
      <Tag
        v-if="getStatusMsg"
        :value="getStatusMsg"
        :severity="getSeverity()"
        class="absolute left-2 top-2 text-lg font-bold rounded p-1"
      />
    </div>

    <div class="p-4">
      <!-- AUTHORS -->
      <p class="text-sm text-center text-gray-600 dark:text-gray-400">
        {{ getAuthors }}
      </p>
      <p class="text-center text-xl font-semibold text-primary mt-1" :title="book?.title">
        {{ titleCal }}
      </p>

      <!-- SERIES -->
      <div class="book-series mt-2" v-if="book?.series">
        <p class="text-sm text-gray-600 dark:text-gray-400" :title="book?.series?.title">
          Cykl:
          <strong
            class="text-gray-800 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            @click="openSeriesDialog"
            >{{ seriesCal }}</strong
          >
        </p>
        <div class="flex items-center gap-2">
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-300">#{{ book?.bookInSeriesNo }}</p>
          <div class="flex-shrink-0" :title="ifExistsMsg">
            <ImageButton v-if="book?.id === 0" img-src="add-to-library" @click="newBook" />
            <img
              v-else-if="checkStatus === ReadingStatus.READ_NOW"
              class="w-8 h-8"
              src="@/assets/images/reading-book.png"
              alt="Czytana"
            />
            <ImageButton v-else-if="checkStatus === ReadingStatus.READ" img-src="read" @click="existUserbook" />
            <ImageButton v-else-if="existedUserbooks.length === 0" img-src="add-to-shell" @click="newUserbook" />
            <ImageButton v-else-if="existedUserbooks.length > 0" img-src="onShell" @click="existUserbook" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Series Dialog -->
  <SeriesCarouselInfoDialog
    v-if="showSeriesDialog && book?.series"
    :series="book.series"
    v-model:visible="showSeriesDialog"
  />
</template>

<style scoped>
  .book-series {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0;
  }
</style>
