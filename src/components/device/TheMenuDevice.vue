<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuthorizationStore} from '@/stores/authorization.ts'
import router from '@/router'
import {useRoute} from 'vue-router';
import {useComputerStore} from "@/stores/computers.ts";
import {useDevicesStore} from "@/stores/devices.ts";
import OfficeIconButton from "@/components/OfficeIconButton.vue";

const computerStore = useComputerStore()
const deviceStore = useDevicesStore()
const authorizationStore = useAuthorizationStore()
const route = useRoute();

const activeMenu = computed(() => {
  console.log('activeMenu', route.path)
  if (route.path.includes('/homedevice')) return 'dashboard';
  if (route.path.includes('/devices/device')) return 'device';
  if (route.path.includes('/devices/computer')) return 'computer';
  return null; // Jeśli nie pasuje do żadnego menu
});

const allLoading = computed(() => {
  return computerStore.loadingComputers || deviceStore.loadingDevices
});

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
    class: `${activeMenu.value === 'dashboard' ? 'active' : ''}`,
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    command: () => {
      router.push({name: 'DevicesHome'})
    },
  },
  {
    label: 'Urządzenia',
    icon: 'pi pi-desktop',
    class: `${activeMenu.value === 'device' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessDevice,
    items: [
      {
        label: 'Nowe urządzenie',
        icon: 'pi pi-plus',
        command: () => {
          router.push({
            name: 'Device',
            params: {isEdit: 'false', deviceId: 0},
          })
        },
      },
      {
        label: 'Spis urządzeń - siatka',
        icon: 'pi pi-fw pi-th-large',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'DevicesGrid'}).href)) {
            const redirect = JSON.stringify({name: 'DevicesGrid'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'DevicesGrid'})
          }
        },
      },
      {
        label: 'Spis urządzeń - lista',
        icon: 'pi pi-fw pi-list',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'DevicesList'}).href)) {
            const redirect = JSON.stringify({name: 'DevicesList'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'DevicesList'})
          }
        },
      },
      {
        separator: true
      },
      {
        label: 'Komputery',
        icon: 'pi pi-fw pi-list',
        class: `${activeMenu.value === 'computer' ? 'active' : ''}`,
        disabled: !authorizationStore.hasAccessComputer,
        command: () => {
          router.push({name: 'Computers'})
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
      <div class="flex flex-row gap-4">
        <OfficeIconButton class="cursor-default" icon="pi pi-check-square" severity="success" :loading="allLoading"
                          title="Określa, czy wyświetlane dane są aktualne."/>
        <div v-if="!authorizationStore.isAuthenticatedOrToken">
          <router-link :to="{ name: 'login' }" style="text-decoration: none">
            <Button class="font-bold uppercase tracking-wider" outlined>zaloguj</Button>
          </router-link>
        </div>
        <div v-else>
          <Button
              class="font-bold uppercase tracking-wider"
              icon="pi pi-power-off"
              outlined
              label="wyloguj"
              icon-pos="right"
              :onclick="authorizationStore.logout"
          />
        </div>
      </div>
    </template>
  </Menubar>
</template>
