<script setup lang="ts">
import {ref} from 'vue'
import {useAuthorizationStore} from '../../stores/authorization'
import OfficeButton from '../../components/OfficeButton.vue'
import router from '../../router'

const authorizationStore = useAuthorizationStore()
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    command: () => {
      router.push({name: 'Home'})
    },
  },
  {
    label: 'Tablica',
    icon: 'pi pi-fw pi-clipboard',
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    command: () => {
      router.push({name: 'DevicesHome'})
    },
  },
  {
    label: 'Urządzenia',
    icon: 'pi pi-desktop',
    disabled: !authorizationStore.hasAccessDevice,
    items: [
      {
        label: 'Nowe urządzenie',
        icon: 'pi pi-plus',
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: 'Device',
            params: {isEdit: 'false', deviceId: 0},
          })
        },
      },
      {
        label: 'Spis urządzeń',
        icon: 'pi pi-fw pi-list',
        // to: { name: "Invoices" },
        command: () => {
          router.push({name: 'Devices'})
        },
      },
    ],
  },
])
</script>

<template>
  <Menubar :model="items" class="main-menu">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2"/>
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
<style scoped></style>
