<script setup lang="ts">
import TheMenu from "@/components/TheMenu.vue";
import { useAuthorizationStore } from "@/stores/authorization";
import { useBooksStore } from "@/stores/books";
import {useDevicesStore} from "@/stores/devices.ts";
import AppCard from "@/components/AppCard.vue";
import router from "@/router";

const authorizationStore = useAuthorizationStore();
const booksStore = useBooksStore();
const deviceStore = useDevicesStore();

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

function runDevice() {
  console.log("START - device()");
  if (authorizationStore.hasAccessDevice) {
    if (deviceStore.devices.length === 0) deviceStore.getDevicesFromDB();
    router.push({
      name: "DevicesHome",
      // params: { idUser: 0, isEdit: "false" },
    });
  }
}
</script>

<template>
  <TheMenu />
  <h1
    v-if="!authorizationStore.isAuthenticatedOrToken"
    class="color-office flex justify-center mt-8"
  >
    Musisz się najpierw zalogować... ;)
  </h1>
  <div v-else class="flex flex-row justify-center gap-2 mt-5">
    <AppCard
      text-content="Kredyty, płatności i zakupy"
      text-title="Finanse"
      :disabled="!authorizationStore.hasAccessFinance"
      @clicked="runFinance"
    />
    <AppCard
      text-content="Książki, audiobooki, ebooki"
      text-title="Biblioteka"
      :disabled="!authorizationStore.hasAccessLibrary"
      @clicked="runLibrary"
    />
    <AppCard
        text-content="Kopmputery, tablety i inne"
        text-title="Urządzenia"
        :disabled="!authorizationStore.hasAccessDevice"
        @clicked="runDevice"
    />
  </div>
</template>

<style scoped></style>
