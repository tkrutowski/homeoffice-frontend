<script setup lang="ts">
import TheFooter from "@/components/TheFooter.vue";
import TheMenu from "@/components/TheMenu.vue";
import { useAuthorizationStore } from "@/stores/authorization";
import { useBooksStore } from "@/stores/books";
import AppCard from "@/components/AppCard.vue";
import router from "@/router";

const authorizationStore = useAuthorizationStore();
const booksStore = useBooksStore();
function runFinance() {
  console.log("START - finance()");
  if (authorizationStore.hasAccessFinance) {
    router.push({
      name: "FinanceHome",
      // params: { idUser: 0, isEdit: "false" },
    });
  }
}

function runLibrary() {
  console.log("START - library()");
  if (authorizationStore.hasAccessLibrary) {
    if (booksStore.books.length === 0) booksStore.getBooksFromDb();
    router.push({
      name: "LibraryHome",
      // params: { idUser: 0, isEdit: "false" },
    });
  }
}
</script>

<template>
  <TheMenu />
  <h1
    v-if="!authorizationStore.isAuthenticatedOrToken"
    class="color-orange flex justify-content-center mt-8"
  >
    Musisz się najpierw zalogować... ;)
  </h1>
  <div v-else class="flex flex-row justify-content-center gap-2 mt-5">
    <AppCard
      text-content="Kredyty, płatności i zakupy"
      text-title="Finanse"
      :btn-disabled="!authorizationStore.hasAccessFinance"
      @clicked="runFinance"
    />
    <AppCard
      text-content="Książki, audiobooki, ebooki"
      text-title="Biblioteka"
      :btn-disabled="!authorizationStore.hasAccessLibrary"
      @clicked="runLibrary"
    />
  </div>
  <TheFooter />
</template>

<style scoped></style>
