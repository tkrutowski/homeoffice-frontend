<script setup lang="ts">
  import TheHeader from './components/TheHeader.vue';
  import Toast from 'primevue/toast';
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col">
    <Toast class="min-w-max shrink-0" />
    <TheHeader class="shrink-0" />
    <main class="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <router-view />
    </main>
  </div>
</template>
