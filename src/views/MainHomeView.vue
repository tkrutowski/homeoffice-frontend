<script setup lang="ts">
  import TheMenu from '@/components/TheMenu.vue';
  import { useAuthorizationStore } from '@/stores/authorization';
  import FinanceHomeEntryCard from '@/components/home/FinanceHomeEntryCard.vue';
  import LibraryHomeEntryCard from '@/components/home/LibraryHomeEntryCard.vue';
  import DeviceHomeEntryCard from '@/components/home/DeviceHomeEntryCard.vue';

  const authorizationStore = useAuthorizationStore();
</script>

<template>
  <TheMenu />
  <h1 v-if="!authorizationStore.isAuthenticatedOrToken" class="color-office flex justify-center mt-8">
    Musisz się najpierw zalogować... ;)
  </h1>
  <div
    v-else
    class="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-stretch justify-items-center gap-6 md:mt-9 md:grid-cols-2 xl:grid-cols-3"
  >
    <FinanceHomeEntryCard />
    <LibraryHomeEntryCard />
    <DeviceHomeEntryCard />
  </div>
</template>

<style scoped></style>
