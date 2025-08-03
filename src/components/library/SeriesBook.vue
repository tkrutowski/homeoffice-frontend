<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, onMounted, ref } from 'vue';
  import { type Book, ReadingStatus, type UserBook } from '@/types/Book.ts';
  import ImageButton from '@/components/ImageButton.vue';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  import { TranslationService } from '@/service/TranslationService.ts';

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

  const ifExistsMsg = computed(() => {
    if (props.book.id === 0) {
      return 'Brak książki w biblotece.';
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
      return 'Czytana od: ';
    }

    const readBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ)
      .sort((a: UserBook, b: UserBook) => {
        const aDate = Array.isArray(a.readFrom) ? a.readFrom[0] : a.readFrom;
        const bDate = Array.isArray(b.readFrom) ? b.readFrom[0] : b.readFrom;

        const aTime = aDate instanceof Date ? aDate.getTime() : 0;
        const bTime = bDate instanceof Date ? bDate.getTime() : 0;

        return bTime - aTime;
      });

    if (readBooks.length > 0) {
      return 'Przeczytana: ';
    }

    return 'Nieprzeczytana';
  });

  const getLatestReadTime = computed(() => {
    if (existedUserbooks.value.length === 0) {
      return null;
    }
    const readingNowBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ_NOW)
      .sort((a: UserBook, b: UserBook) => {
        const aDate = Array.isArray(a.readFrom) ? a.readFrom[0] : a.readFrom;
        const bDate = Array.isArray(b.readFrom) ? b.readFrom[0] : b.readFrom;

        const aTime = aDate instanceof Date ? aDate.getTime() : 0;
        const bTime = bDate instanceof Date ? bDate.getTime() : 0;

        return bTime - aTime;
      });
    if (readingNowBooks.length > 0) {
      return readingNowBooks[0].readFrom; // Zwraca książkę z najpóźniejszą datą
    }

    const readBooks = existedUserbooks.value
      .filter((book: UserBook) => book.readingStatus === ReadingStatus.READ)
      .sort((a: UserBook, b: UserBook) => {
        const aDate = Array.isArray(a.readFrom) ? a.readFrom[0] : a.readFrom;
        const bDate = Array.isArray(b.readFrom) ? b.readFrom[0] : b.readFrom;

        const aTime = aDate instanceof Date ? aDate.getTime() : 0;
        const bTime = bDate instanceof Date ? bDate.getTime() : 0;

        return bTime - aTime;
      });

    if (readBooks.length > 0) {
      return readBooks[0].readFrom + '-' + readBooks[0].readTo; // Zwraca książkę z najpóźniejszą datą
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
    class="border border-surface-200 dark:border-surface-700 shadow-xl rounded m-2 p-4"
    style="width: 300px; min-width: 300px; max-width: 300px"
  >
    <div class="flex mb-4 font-medium text-xl justify-center text-primary" :title="props.book.title">
      {{ titleCal }}
    </div>
    <div class="mb-4 flex justify-center">
      <div class="relative mx-auto">
        <img
          v-if="props.book?.cover != 'https://focikhome.synology.me/covers/'"
          :src="props.book.cover"
          :alt="props.book.title"
          class="w-full rounded cover"
        />
        <img v-else src="../../assets/images/no_cover.png" :alt="props.book.title" class="w-full rounded cover" />
        <Tag
          :value="getStatusMsg"
          :severity="getSeverity()"
          class="absolute left-2 top-2 text-lg font-bold rounded p-1"
        />
      </div>
    </div>
    <div class="flex mb-0 font-medium justify-center items-end gap-2">
      <span class="text-lg">{{ getLatestReadStatus }} </span>
      <span class="text-sm pb-0.5">{{ getLatestReadTime }}</span>
    </div>
    <div class="flex justify-between items-center">
      <div class="mt-0 font-semibold text-3xl">#{{ props.book.bookInSeriesNo }}</div>
      <span :title="ifExistsMsg">
        <ImageButton v-if="props.book?.id === 0" img-src="add-to-library" @click="newBook" />
        <img
          v-else-if="checkStatus === ReadingStatus.READ_NOW"
          class="w-10 h-10 mb-2 mt-1 mr-1"
          src="@/assets/images/reading-book.png"
          alt="Czytana"
        />
        <ImageButton v-else-if="checkStatus === ReadingStatus.READ" img-src="read" @click="existUserbook" />
        <ImageButton v-else-if="existedUserbooks.length === 0" img-src="add-to-shell" @click="newUserbook" />
        <ImageButton v-else-if="existedUserbooks.length > 0" img-src="onShell" @click="existUserbook" />
      </span>
    </div>
  </div>
</template>

<style scoped>
  .cover {
    height: 400px;
    width: 250px;
  }
</style>
