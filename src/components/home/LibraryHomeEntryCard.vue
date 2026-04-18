<script setup lang="ts">
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import router from '@/router';
  import { useAuthorizationStore } from '@/stores/authorization';

  const authorizationStore = useAuthorizationStore();

  function enterLibrary() {
    if (!authorizationStore.hasAccessLibrary) return;
    router.push({ name: 'LibraryHome' });
  }

  function pushListOrRefresh(routeName: 'Books' | 'Series' | 'UserBooksReadNow') {
    if (window.location.href.includes(router.resolve({ name: routeName }).href)) {
      const redirect = JSON.stringify({ name: routeName });
      router.push({ path: '/refresh', query: { redirect } });
    } else {
      router.push({ name: routeName });
    }
  }

  function goNewBook() {
    if (!authorizationStore.hasAccessLibrary) return;
    router.push({
      name: 'Book',
      params: { isEdit: 'false', bookId: 0 },
    });
  }

  function onAddBookClick() {
    if (!authorizationStore.hasAccessLibrary) return;
    goNewBook();
  }

  function goNewSeries() {
    if (!authorizationStore.hasAccessLibrary) return;
    router.push({ name: 'Series', query: { new: '1' } });
  }

  function onAddSeriesClick() {
    if (!authorizationStore.hasAccessLibrary) return;
    goNewSeries();
  }
</script>

<template>
  <div
    class="flex h-full min-h-0 w-full max-w-[400px] flex-col justify-self-center overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 text-surface-900 shadow-lg dark:border-primary/50 dark:bg-surface-950 dark:text-surface-0 dark:shadow-xl"
  >
    <div class="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:items-stretch">
      <button
        type="button"
        class="flex min-h-0 flex-col items-center gap-4 py-7 text-left transition hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-45 dark:hover:bg-white/5 md:h-full md:min-w-0 md:flex-1 md:items-start md:justify-between md:gap-5 md:pl-7 md:py-7"
        :disabled="!authorizationStore.hasAccessLibrary"
        @click="enterLibrary"
      >
        <div
          class="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-b from-surface-100/90 to-surface-0 shadow-inner backdrop-blur-md dark:border-primary/40 dark:from-white/15 dark:to-white/5 md:h-28 md:w-28"
        >
          <i class="pi pi-book text-4xl text-primary md:text-5xl" aria-hidden="true" />
        </div>
        <div class="w-full max-w-xs text-center md:text-left">
          <h2 class="text-xl font-bold uppercase tracking-[0.2em] text-surface-900 md:text-2xl dark:text-surface-0">
            Biblioteka
          </h2>
          <p class="mt-2 text-xs leading-relaxed text-surface-600 md:text-sm dark:text-surface-400">
            Książki, serie i półka — szybki dostęp do katalogu, cykli oraz lektury bieżącej.
          </p>
        </div>
      </button>

      <div
        class="flex w-full shrink-0 flex-col gap-3 border-t border-surface-200 p-3 dark:border-primary/20 md:h-full md:min-h-0 md:w-[170px] md:min-w-0 md:grow-0 md:border-t-0 md:border-surface-200 md:p-3 dark:md:border-primary/30"
      >
        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessLibrary }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 pr-12 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2 md:pr-10"
            :disabled="!authorizationStore.hasAccessLibrary"
            @click="pushListOrRefresh('Books')"
          >
            <i class="pi pi-book mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">Książki</span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Katalog książek
            </span>
          </button>
          <div
            class="finance-plus-wrap absolute right-1 top-1.5 z-20 shrink-0 md:right-0.5 md:top-1"
            title="Nowa książka"
            @click.stop="onAddBookClick"
          >
            <OfficeIconButton
              icon="pi pi-plus"
              :btn-disabled="!authorizationStore.hasAccessLibrary"
              class="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessLibrary }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 pr-12 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2 md:pr-10"
            :disabled="!authorizationStore.hasAccessLibrary"
            @click="pushListOrRefresh('Series')"
          >
            <i class="pi pi-sitemap mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">Serie / cykle</span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Spis serii
            </span>
          </button>
          <div
            class="finance-plus-wrap absolute right-1 top-1.5 z-20 shrink-0 md:right-0.5 md:top-1"
            title="Nowa seria"
            @click.stop="onAddSeriesClick"
          >
            <OfficeIconButton
              icon="pi pi-plus"
              :btn-disabled="!authorizationStore.hasAccessLibrary"
              class="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessLibrary }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2"
            :disabled="!authorizationStore.hasAccessLibrary"
            @click="pushListOrRefresh('UserBooksReadNow')"
          >
            <i class="pi pi-bookmark mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">Czytane</span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Aktualnie na półce
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
