<script setup lang="ts">
import {computed, onMounted, PropType, ref} from "vue";
import {Book, UserBook} from "@/assets/types/Book";
import {UtilsService} from "@/service/UtilsService";
import ImageButton from "@/components/ImageButton.vue";
import {useUserbooksStore} from "@/stores/userbooks";
import router from "@/router";
import {useBooksStore} from "@/stores/books";

const userbookStore = useUserbooksStore();
const booksStore = useBooksStore();
const props = defineProps({
  book: {
    type: Object as PropType<Book>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: "newUserbook", book: Book): void;
  (e: "newBook", book: Book): void;
}>();
const existedUserbooks = ref<UserBook[]>([]);

onMounted(async () => {
  console.log("SeriesBookNEW ONMOUNTED", props?.book)
  const userbooks = await userbookStore.getUserbooksByBookIdFromDb(
      props.book?.id
  );
  if (userbooks && userbooks.length > 0) existedUserbooks.value = userbooks;
});


const newUserbook = () => {
  emit("newUserbook", props.book);
};


const addToLibrary = () => {
  booksStore.tempBook = props.book;
  router.push({
    name: "Book",
    params: {isEdit: "false", bookId: -1},
  });
};


const ifExistsMsg = computed(() => {
  if (existedUserbooks.value.length > 0) {
    let msg = "";
    existedUserbooks.value.forEach((book) => {
      if (book.readingStatus.name === "READ") {
        msg += "Przeczytana (" + book.readFrom + " - " + book.readTo + ")";
      } else if (book.readingStatus.name === "NOT_READ") {
        msg += "Nie przeczytana";
      } else if (book.readingStatus.name === "READ_NOW") {
        msg += "Czytam (" + book.readFrom + " - ... )";
      }
    });
    return msg;
  } else {
    return "Książka na mojej półce";
  }
});


const checkStatus = computed(() => {
  if (existedUserbooks.value.length === 0) {
    return "Brak na półce";
  }
  if (existedUserbooks.value.length > 1) {
    // Sprawdzenie, czy któraś książka ma status "READ"
    const readBook = existedUserbooks.value.find(book => book.readingStatus.name === "READ");
    if (readBook) {
      return readBook.readingStatus.viewName;
    }
    // Sprawdzenie, czy któraś książka ma status "READ_NOW"
    const readNowBook = existedUserbooks.value.find(book => book.readingStatus.name === "READ_NOW");
    if (readNowBook) {
      return readNowBook.readingStatus.viewName;
    }
    // Sprawdzenie, czy któraś książka ma status "NOT_READ"
    const notReadBook = existedUserbooks.value.find(book => book.readingStatus.name === "NOT_READ");
    if (notReadBook) {
      return notReadBook.readingStatus.viewName;
    }
    return "Brak danych";
  }
  // Jeżeli jest tylko jedna książka, zwróć jej status
  return existedUserbooks.value[0].readingStatus.viewName;
});


const getSeverity = () => {
  console.log("getSeverity");
  if (existedUserbooks.value.length === 0) {
    return 'danger';
  }
  const readBook = existedUserbooks.value.find(book => book.readingStatus.name === "READ");
  if (readBook) {
    return 'success'
  }
  const readNowBook = existedUserbooks.value.find(book => book.readingStatus.name === "READ_NOW");
  if (readNowBook) {
    return 'warn';
  }
  const notReadBook = existedUserbooks.value.find(book => book.readingStatus.name === "NOT_READ");
  if (notReadBook) {
    return 'danger'
  }
  return 'danger';
};

const getLatestReadStatus = computed(() => {
  if (existedUserbooks.value.length === 0) {
    return "Brak na półce";
  }
  const readingNowBooks = existedUserbooks.value
      .filter(book => book.readingStatus.name === 'READ_NOW')
      .sort((a, b) => new Date(b.readFrom).getTime() - new Date(a.readFrom).getTime());
  if (readingNowBooks.length > 0) {
    return "Czytana od: " + readingNowBooks[0].readFrom; // Zwraca książkę z najpóźniejszą datą
  }

  const readBooks = existedUserbooks.value
      .filter(book => book.readingStatus.name === 'READ')
      .sort((a, b) => new Date(b.readFrom).getTime() - new Date(a.readFrom).getTime());

  if (readBooks.length > 0) {
    return "Przeczytana: " + readBooks[0].readFrom + "-" + readBooks[0].readTo; // Zwraca książkę z najpóźniejszą datą
  }

  return "Nieprzeczytana";

});

</script>

<template>
  <div class="border border-surface-200 dark:border-surface-700 rounded m-2  p-4" style="width: 300px">
    <div class="flex mb-4 font-medium text-xl justify-center">{{ props.book.title }}</div>
    <div class="mb-4 flex justify-center">
      <div class="relative mx-auto">
        <img
            v-if="props.book?.cover != 'https://focikhome.synology.me/covers/'"
            :src="props.book.cover"
            :alt="props.book.title" class="w-full rounded cover"/>
        <img v-else src="../../assets/images/no_cover.png" :alt="props.book.title" class="w-full rounded cover "/>
        <Tag :value="checkStatus" :severity="getSeverity()" class="absolute larger-tag" style="left:5px; top: 5px"/>
      </div>
    </div>
    <div class="flex mb-0 font-medium justify-center">{{ getLatestReadStatus }}</div>
    <div class="flex justify-between items-center">
      <div class="mt-0 font-semibold text-3xl">#{{ props.book.bookInSeriesNo }}</div>
      <span>
                                <ImageButton
                                    v-if="props.book?.id === 0"
                                    img-src="add-to-library"
                                    @click="addToLibrary"
                                />
      <ImageButton
          v-else-if="existedUserbooks.length > 0"
          v-tooltip.top="{
          value: ifExistsMsg,
          showDelay: 1000,
          hideDelay: 300,
        }"
          img-src="onShell"
      />
      <ImageButton v-else img-src="add-to-shell" @click="newUserbook"/>
                        </span>
    </div>
  </div>
</template>

<style scoped>

.larger-tag {
  font-size: 1.3em; /* Zwiększenie rozmiaru tekstu */
  padding: 5px; /* Zwiększenie wewnętrznego marginesu */
  font-weight: bold; /* Pogrubienie tekstu */
  border-radius: 5px; /* Zaokrąglenie rogów */
}

.cover {
  height: 400px;
  width: 250px;
}
</style>
