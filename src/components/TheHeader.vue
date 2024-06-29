<template>
  <div id="logo-back-mobile" class="color-yellow">
    <img
      id="logo-mobile"
      alt="ProgasOffice logo"
      src="../assets/HomeOffice.png"
    />
    <div class="flex flex-column align-items-end">
      <h1 class="pr-3">HomeOffice</h1>
      <span class="pr-1" v-if="authStore.isAuthenticatedOrToken">
        Użytkownik: {{ authStore.username }}
      </span>
    </div>
  </div>
  <br />
</template>
<script lang="ts" setup>
import { useAuthorizationStore } from "@/stores/authorization";
const authStore = useAuthorizationStore();
</script>

<style scoped>
#logo {
  width: 150px;
  height: 150px;
  margin-left: 50px;
  margin-top: 50px;
}

#logo-mobile {
  width: 75px;
  height: 75px;
  margin-left: 5px;
  margin-top: 5px;
}

#logo-back {
  display: flex;
  justify-content: space-between;
  height: 250px;
  width: auto;
  background-color: #515455 !important;
}

#logo-back-mobile {
  display: flex;
  justify-content: space-between;
  height: 100px;
  width: auto;
  background-color: #515455 !important;
}

#name {
  padding-top: 100px;
  padding-right: 50px;
}

#name-mobile {
  padding-top: 20px;
  padding-right: 50px;
}
</style>
