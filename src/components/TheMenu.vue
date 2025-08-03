<script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthorizationStore } from '@/stores/authorization';
  import router from '../router';

  const authorizationStore = useAuthorizationStore();
  const items = ref([
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      // to: { name: "Home" },
      command: () => {
        router.push({ name: 'Home' });
      },
    },
    {
      label: 'Administracja',
      icon: 'pi pi-fw pi-user',
      visible: authorizationStore.hasAccessAdmin,
      items: [
        {
          label: 'Użytkownicy',
          icon: 'pi pi-fw pi-users',
          disabled: true,
          // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
          command: () => {
            router.push({
              name: 'Book',
              params: { isEdit: 'false', bookId: 0 },
            });
          },
        },
        {
          label: 'Uprawnienia ',
          icon: 'pi pi-fw pi-folder-open',
          disabled: !authorizationStore.hasAccessAdmin,
          command: () => {
            if (window.location.href.includes(router.resolve({ name: 'Privileges' }).href)) {
              const redirect = JSON.stringify({ name: 'Privileges' });
              router.push({ path: '/refresh', query: { redirect: redirect } });
            } else {
              router.push({ name: 'Privileges' });
            }
          },
        },
        {
          label: 'Logi ',
          icon: 'pi pi-fw pi-chart-bar',
          disabled: !authorizationStore.hasAccessAdmin,
          command: () => {
            if (window.location.href.includes(router.resolve({ name: 'Logs' }).href)) {
              const redirect = JSON.stringify({ name: 'Logs' });
              router.push({ path: '/refresh', query: { redirect: redirect } });
            } else {
              router.push({ name: 'Logs' });
            }
          },
        },
      ],
    },
  ]);
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2" />
    </template>
    <template #end>
      <div v-if="!authorizationStore.isAuthenticatedOrToken">
        <router-link :to="{ name: 'login' }" style="text-decoration: none">
          <Button class="font-bold uppercase tracking-wider" outlined>ZALOGUJ</Button>
        </router-link>
      </div>
      <div v-else>
        <Button
          class="font-bold uppercase tracking-wider"
          icon="pi pi-power-off"
          outlined
          label="WYLOGUJ"
          icon-pos="right"
          :onclick="authorizationStore.logout"
        />
      </div>
    </template>
  </Menubar>
</template>
<style scoped></style>
