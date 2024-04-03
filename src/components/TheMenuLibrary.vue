<script setup lang="ts">
import { ref } from "vue";
import { useAuthorizationStore } from "@/stores/authorization";
import OfficeButton from "@/components/OfficeButton.vue";
import router from "@/router";

const authorizationStore = useAuthorizationStore();
const items = ref([
  {
    label: "Home",
    icon: "pi pi-fw pi-home",
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    command: () => {
      router.push({ name: "Home" });
    },
  },
  {
    label: "Książki",
    icon: "pi pi-fw pi-euro",
    disabled: !authorizationStore.hasAccessLibrary,
    items: [
      {
        label: "Nowa książka",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Book",
            params: { isEdit: "false", bookId: 0 },
          });
        },
      },
      {
        label: "Spis książek",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "Books" });
        },
      },
      {
        label: "Cykle",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "SeriesSearch" });
        },
      },
    ],
  },
  {
    label: "Moja półka",
    icon: "pi pi-fw pi-euro",
    disabled: !authorizationStore.hasAccessLibrary,
    items: [
      {
        label: "Aktualnie czytane",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "UserBooksReadNow",
            // params: { isEdit: "false", feeId: 0 },
          });
        },
      },
      {
        label: "Poczekalnia",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "UserBooksToRead" });
        },
      },
      {
        label: "Przeczytane",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "UserBooksRead" });
        },
      },
    ],
  },
]);
</script>

<template>
  <Menubar :model="items" class="main-menu">
    <template #start>
      <img alt="logo" src="@/assets/HomeOffice.png" height="30" class="mr-2" />
    </template>
    <template #end>
      <div v-if="!authorizationStore.isAuthenticated">
        <router-link :to="{ name: 'login' }" style="text-decoration: none">
          <OfficeButton
            size="sm"
            class="my-2 ml-2 my-sm-0"
            btn-type="office"
            text="zaloguj się"
          />
        </router-link>
      </div>
      <div v-else>
        <OfficeButton
          size="sm"
          class="my-2 ml-2 my-sm-0"
          btn-type="office"
          text="wyloguj"
          :onclick="authorizationStore.logout"
        />
      </div>
    </template>
  </Menubar>
</template>
<style scoped></style>
