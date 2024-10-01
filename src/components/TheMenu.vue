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
    // to: { name: "Home" },
    command: () => {
      router.push({ name: "Home" });
    },
  },
  {
    label: "Administracja",
    icon: "pi pi-fw pi-user",
    visible: authorizationStore.hasAccessAdmin,
    items: [
      {
        label: "Użytkownicy",
        icon: "pi pi-fw pi-users",
        disabled: true,
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Book",
            params: { isEdit: "false", bookId: 0 },
          });
        },
      },
      {
        label: "Uprawnienia ",
        icon: "pi pi-fw pi-folder-open",
        disabled: !authorizationStore.hasAccessAdmin,
        command: () => {
          if(window.location.href.includes(router.resolve({name: "Privileges"}).href)) {
            const redirect = JSON.stringify({ name: 'Privileges' });
            router.push({ path: '/refresh', query: { redirect: redirect } });
          }else {
            router.push({ name: "Privileges" });
          }
        },
      },
      {
        label: "Logi ",
        icon: "pi pi-fw pi-chart-bar",
        disabled: !authorizationStore.hasAccessAdmin,
        command: () => {
          if(window.location.href.includes(router.resolve({name: "Logs"}).href)) {
            const redirect = JSON.stringify({ name: 'Logs' });
            router.push({ path: '/refresh', query: { redirect: redirect } });
          }else {
            router.push({ name: "Logs" });
          }
        },
      },
    ],
  },
]);
</script>

<template>
  <Menubar :model="items" class="main-menu">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2" />
    </template>
    <template #end>
      <div v-if="!authorizationStore.isAuthenticatedOrToken">
        <router-link :to="{ name: 'login' }" style="text-decoration: none">
          <OfficeButton
            size="sm"
            class="my-2 ml-2 my-sm-0"
            btn-type="office-regular"
            text="zaloguj się"
          />
        </router-link>
      </div>
      <div v-else>
        <OfficeButton
          size="sm"
          class="my-2 ml-2 my-sm-0"
          btn-type="office-regular"
          text="wyloguj"
          :onclick="authorizationStore.logout"
        />
      </div>
    </template>
  </Menubar>
</template>
<style scoped>
.main-menu {
  border: 1px solid #ee7f00;
  border-radius: 0.25rem;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
