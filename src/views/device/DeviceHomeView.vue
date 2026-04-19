<script setup lang="ts">
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuDevice />
    </template>
    <p class="text-3xl text-center mt-8">Coś tu kiedyś będzie....</p>
  </MainPageShell>
</template>

<style scoped></style>
