<script lang="ts" setup>
  import { useAuthorizationStore } from '@/stores/authorization';
  import ThemeSwitcher from './ThemeSwitcher.vue';
  import InstanceControl from "@/components/share/InstanceControl.vue";

  const authStore = useAuthorizationStore();
</script>

<template>
  <div id="logo-back-mobile" class="w-full p-2">
    <img id="logo-mobile" alt="HomeOffice logo" src="../assets/HomeOffice.png" />
    <h1 class="text-primary text-4xl font-bold">Home Office</h1>
    <div class="flex flex-col align-items-end">
      <div class="flex justify-end gap-2">
        <InstanceControl :idInstance="'i-0c84ab8759cefd840'" title="Smartgaz" />
        <InstanceControl :idInstance="'i-09a67c6323c0bd240'" title="Home Office" />
      </div>
      <theme-switcher />
      <h5 v-if="authStore.isAuthenticatedOrToken" class="flex justify-end font-bold pr-1 text-primary">
        Użytkownik: {{ authStore.username }}
      </h5>
    </div>
  </div>
  <br />
</template>
<style scoped>
  #logo-mobile {
    width: 75px;
    height: 75px;
    margin-left: 5px;
    margin-top: 5px;
  }

  #logo-back-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    width: auto;
    background-color: #515455 !important;
  }
</style>
