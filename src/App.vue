<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import Toast from 'primevue/toast'
</script>

<template>
  <div class="w-full">
    <Toast class="min-w-max" />
    <TheHeader />
    <router-view />
  </div>
</template>
