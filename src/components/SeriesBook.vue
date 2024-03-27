<script setup lang="ts">
import { computed, onMounted, PropType, ref } from "vue";
import { Book, UserBook } from "@/assets/types/Book";
import { UtilsService } from "../service/UtilsService";
import ImageButton from "@/components/ImageButton.vue";
import { useUserbooksStore } from "@/stores/userbooks";
import router from "@/router";
import { useBooksStore } from "@/stores/books";
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
    params: { isEdit: "false", bookId: -1 },
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
</script>

<template>
  <div class="my-card flex flex-row">
    <div class="header">
      <img class="pt-2 cover" alt="cover" :src="props.book?.cover" />
    </div>
    <div class="content flex flex-column color-orange">
      <h3 class="ml-auto mr-auto">
        {{ props.book.title }}
      </h3>
      <div class="flex flex-row justify-content-center">
        <p class="book-subtitle-sub">Autor:</p>
        <p class="book-subtitle-sub book-subtitle-bold">
          {{ UtilsService.displayAuthors(props.book.authors) }}
        </p>
      </div>
      <div class="flex flex-row justify-content-center">
        <p class="book-subtitle-sub">Kategoria:</p>
        <p class="book-subtitle-sub book-subtitle-bold text-truncate">
          {{ UtilsService.displayCategory(props.book.categories) }}
        </p>
      </div>
      <div class="w-full">
        <Textarea
          readonly
          :value="props.book?.description"
          rows="7"
          class="w-full description"
        />
      </div>
    </div>
    <div class="footer">
      <h1 class="color-orange">#{{ props.book.bookInSeriesNo }}</h1>
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
      <ImageButton v-else img-src="add-to-shell" @click="newUserbook" />
    </div>
  </div>
</template>

<style scoped>
.header {
  width: 22%;
  max-width: 200px;
  //background-color: #b35f00;
}
.content {
  width: 100%;
  //background-color: #2ca083;
}
.footer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 8%;
  max-width: 100px;
  //background-color: #ffc380;
}
.my-card {
  background-color: #1e1e1e;
  margin-bottom: 10px;
  margin-right: auto;
  margin-left: auto;
  padding-bottom: 10px;
  padding-left: 10px;
  padding-top: 10px;
  width: 90%;
  max-width: 1200px;
  border: 1px solid #ee7f00;
  //border-color: #ee7f00;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  color: #ee7f00;
}

.description {
  background-color: #1e1e1e;
  border: none;
}
.book-subtitle-sub {
  margin: 5px 5px 5px 0;
  font-size: 14px;
}

.book-subtitle-bold {
  margin: 5px 5px 5px 0;
  font-weight: bold;
  font-size: 14px;
}

.cover {
  height: 320px;
  width: 200px;
}
</style>
