<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuthorizationStore} from '@/stores/authorization.ts'
import router from '@/router'
import {useRoute} from 'vue-router';
import {useBooksStore} from "@/stores/books.ts";
import {useUserbooksStore} from "@/stores/userbooks.ts";
import OfficeIconButton from "@/components/OfficeIconButton.vue";

const userbooksStore = useUserbooksStore()
const booksStore = useBooksStore()
const authorizationStore = useAuthorizationStore()
const route = useRoute();

const activeMenu = computed(() => {
  console.log('activeMenu', route.path)
  if (route.path.includes('/homelib')) return 'dashboard';
  if (route.path.includes('/library/book/shell')) return 'shell';
  if (route.path.includes('/library/book')) return 'book';
  return null; // Jeśli nie pasuje do żadnego menu
});

const allLoading = computed(() => {
  return userbooksStore.loadingUserbooks || booksStore.loadingBooks || booksStore.loadingAuthors || booksStore.loadingBooksInSeries
});

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
    class: `${activeMenu.value === 'dashboard' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessLibrary,
    command: () => {
      router.push({name: 'LibraryHome'})
    },
  },
  {
    label: 'Książki',
    icon: 'pi pi-book',
    class: `${activeMenu.value === 'book' ? 'active' : ''}`,
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
          if (window.location.href.includes(router.resolve({name: 'Books'}).href)) {
            const redirect = JSON.stringify({name: 'Books'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'Books'})
          }
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
    class: `${activeMenu.value === 'shell' ? 'active' : ''}`,
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
              label="WYLOGUJ"
              icon-pos="right"
              :onclick="authorizationStore.logout"
          />
        </div>
      </div>
    </template>
  </Menubar>
</template>
