<script setup lang="ts">
import {ref} from 'vue'
import {useAuthorizationStore} from '../../stores/authorization'
import router from '../../router'

const authorizationStore = useAuthorizationStore()
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => {
      router.push({name: 'Home'})
    },
  },
  {
    label: 'Tablica',
    icon: 'pi pi-fw pi-clipboard',
    disabled: !authorizationStore.hasAccessLibrary,
    command: () => {
      router.push({name: 'LibraryHome'})
    },
  },
  {
    label: 'Książki',
    icon: 'pi pi-book',
    disabled: !authorizationStore.hasAccessLibrary,
    items: [
      {
        label: 'Nowa książka',
        icon: 'pi pi-plus',
        command: () => {
          router.push({
            name: 'Book',
            params: {isEdit: 'false', bookId: 0},
          })
        },
      },
      {
        label: 'Spis książek',
        icon: 'pi pi-fw pi-list',
        command: () => {
          router.push({name: 'Books'})
        },
      },
      {
        label: 'Cykle',
        icon: 'pi pi-fw pi-list',
        command: () => {
          router.push({name: 'SeriesSearch'})
        },
      },
    ],
  },
  {
    label: 'Moja półka',
    icon: 'pi pi-fw pi-address-book',
    disabled: !authorizationStore.hasAccessLibrary,
    items: [
      {
        label: 'Aktualnie czytane',
        icon: 'pi pi-list',
        command: () => {
          router.push({
            name: 'UserBooksReadNow',
          })
        },
      },
      {
        label: 'Poczekalnia',
        icon: 'pi pi-fw pi-list',
        to: {name: 'Invoices'},
        command: () => {
          router.push({name: 'UserBooksToRead'})
        },
      },
      {
        label: 'Przeczytane',
        icon: 'pi pi-fw pi-list',
        command: () => {
          router.push({name: 'UserBooksRead'})
        },
      },
    ],
  },
  {
    label: 'Statystyki',
    icon: 'pi pi-fw pi-chart-line',
    disabled: !authorizationStore.hasAccessLibrary,
    command: () => {
      router.push({name: 'Statistics'})
    },
  },
])
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2"/>
    </template>
    <template #end>
      <div v-if="!authorizationStore.isAuthenticatedOrToken">
        <router-link :to="{ name: 'login' }" style="text-decoration: none">
          <Button class="font-bold uppercase tracking-wider" outlined>zaloguj</Button>
        </router-link>
      </div>
      <div v-else>
        <Button
            class="font-bold uppercase tracking-wider"
            outlined
            :onclick="authorizationStore.logout"
        >wyloguj
        </Button>
      </div>
    </template>
  </Menubar>
</template>
<style scoped></style>
