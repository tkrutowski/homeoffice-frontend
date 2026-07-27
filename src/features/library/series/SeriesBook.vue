<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed } from 'vue';
  import { type Book, ReadingStatus, type UserBook } from '@/features/library/shelf/types';
  import ImageButton from '@/components/ImageButton.vue';
  import { useUserbooksByBookIdQuery } from '@/features/library/shelf/queries/useUserbooksQueries';
  import { TranslationService } from '@/service/TranslationService.ts';
  import { UtilsService } from '@/service/UtilsService';

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
  const bookId = computed(() => props.book?.id ?? 0);
  const { data: existedUserbooksData } = useUserbooksByBookIdQuery(bookId);
  const existedUserbooks = computed<UserBook[]>(() => existedUserbooksData.value ?? []);

  const newUserbook = () => {
    emit('newUserbook', props.book);
  };

  const existUserbook = () => {
    emit('existUserbook', props.book);
  };

  const newBook = () => {
    emit('newBook', props.book);
  };

  function formatUserbookDate(value: Date | string | null | undefined): string {
    return value ? UtilsService.formatDateToString(value) : '';
  }

  function readFromTime(value: Date | string | null | undefined): number {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string' && value.length > 0) return new Date(value).getTime();
    return 0;
  }

  function sortByReadFromDesc(a: UserBook, b: UserBook): number {
    return readFromTime(b.readFrom) - readFromTime(a.readFrom);
  }

  const ifExistsMsg = computed(() => {
    if (props.book.id === 0) {
      return 'Brak książki w biblotece.';
    }
    if (existedUserbooks.value.length > 0) {
      let msg = '';
      existedUserbooks.value.forEach(book => {
        if (book.readingStatus === ReadingStatus.READ) {
          msg += `\nPrzeczytana (${formatUserbookDate(book.readFrom)} - ${formatUserbookDate(book.readTo)})`;
        } else if (book.readingStatus === ReadingStatus.NOT_READ) {
          msg += 'Nie przeczytana';
        } else if (book.readingStatus === ReadingStatus.READ_NOW) {
          msg += `Czytam (${formatUserbookDate(book.readFrom)} - ... )`;
        }
      });
      return msg;
    } else {
      return 'Brak książki na mojej półce.';
    }
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

  const getLatestReadStatus = computed(() => {
    if (existedUserbooks.value.length === 0) {
      return 'Brak na półce';
    }
    const readingNowBooks = existedUserbooks.value.filter(
      (book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW
    );
    if (readingNowBooks.length > 0) {
      return 'Czytana od:';
    }

    const readBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ)
      .sort(sortByReadFromDesc);

    if (readBooks.length > 0) {
      return 'Przeczytana:';
    }

    return 'Nieprzeczytana';
  });

  const getLatestReadTime = computed(() => {
    if (existedUserbooks.value.length === 0) {
      return null;
    }
    const readingNowBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW)
      .sort(sortByReadFromDesc);
    if (readingNowBooks.length > 0) {
      return formatUserbookDate(readingNowBooks[0].readFrom);
    }

    const readBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ)
      .sort(sortByReadFromDesc);

    if (readBooks.length > 0) {
      const from = formatUserbookDate(readBooks[0].readFrom);
      const to = formatUserbookDate(readBooks[0].readTo);
      return from && to ? `${from} - ${to}` : from || to || null;
    }

    return null;
  });

  const titleCal = computed(() => {
    const org = props.book?.title;
    if (org && org.length > 25) {
      return org.slice(0, 24) + '...';
    }
    return org;
  });
</script>

<template>
  <div
    class="m-2 w-[300px] min-w-[300px] max-w-[300px] overflow-hidden rounded-lg border border-surface-200 bg-surface-0 shadow-xl dark:border-surface-700 dark:bg-surface-900"
  >
    <div class="flex justify-center px-4 pt-4 pb-2 font-medium text-xl text-primary" :title="props.book.title">
      {{ titleCal }}
    </div>
    <div class="relative w-full">
      <img
        v-if="props.book?.cover && props.book.cover.length > 0"
        :src="props.book.cover"
        :alt="props.book.title"
        class="block h-[400px] w-full object-cover"
      />
      <img
        v-else
        src="../../../assets/images/no_cover.png"
        :alt="props.book.title"
        class="block h-[400px] w-full object-cover"
      />
      <Tag
        :value="getStatusMsg"
        :severity="getSeverity()"
        class="absolute left-2 top-2 rounded p-1 text-lg font-bold"
      />
    </div>
    <div class="px-4 pb-4 pt-2">
      <div class="mb-0 flex flex-wrap items-baseline justify-center gap-x-2 font-medium">
        <span class="text-lg">{{ getLatestReadStatus }}</span>
        <span v-if="getLatestReadTime" class="text-sm">{{ getLatestReadTime }}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="mt-0 text-3xl font-semibold">#{{ props.book.bookInSeriesNo }}</div>
        <span :title="ifExistsMsg">
          <ImageButton v-if="props.book?.id === 0" img-src="add-to-library" @click="newBook" />
          <img
            v-else-if="checkStatus === ReadingStatus.READ_NOW"
            class="mb-2 mr-1 mt-1 h-10 w-10"
            src="@/assets/images/reading-book.png"
            alt="Czytana"
          />
          <ImageButton v-else-if="checkStatus === ReadingStatus.READ" img-src="read" @click="existUserbook" />
          <ImageButton v-else-if="existedUserbooks.length === 0" img-src="add-to-shell" @click="newUserbook" />
          <ImageButton v-else-if="existedUserbooks.length > 0" img-src="onShell" @click="existUserbook" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
