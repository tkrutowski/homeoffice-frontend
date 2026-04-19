<script setup lang="ts">
  import TheMenu from '@/components/TheMenu.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenu />
    </template>
    <div class="flex flex-col justify-center items-center w-full mt-10 text-primary">
      <p class="text-3xl">Nie masz dostępu do tego zasobu</p>
      <p class="text-lg mt-3">Jeżeli potrzebujesz dostęp skontaktuj się z administratorem</p>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
