<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import Toast from "primevue/toast";
</script>

<template>
  <Toast class="min-w-max" />
  <TheHeader />
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;

  background-color: #222526 !important;
}
</style>
