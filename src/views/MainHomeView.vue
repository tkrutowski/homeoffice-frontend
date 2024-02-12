<script setup lang="ts">
import TheFooter from "@/components/TheFooter.vue";
import TheMenu from "@/components/TheMenu.vue";
import { useAuthorizationStore } from "@/stores/authorization";
import AppCard from "@/components/AppCard.vue";
import router from "@/router";

const authorizationStore = useAuthorizationStore();

function runFinance() {
  console.log("START - finance()");
  if (authorizationStore.hasAccessFinance) {
    router.push({
      name: "FinanceHome",
      // params: { idUser: 0, isEdit: "false" },
    });
  }
}
</script>

<template>
  <TheMenu />
  <h1
    v-if="!authorizationStore.isAuthenticated"
    class="color-orange flex justify-content-center mt-8"
  >
    Musisz się najpierw zalogować... ;)
  </h1>
  <div v-else class="flex flex-row justify-content-center gap-2 mt-5">
    <AppCard
      text-content="Kredyty, płatności i zakupy"
      text-title="Finanse"
      @clicked="runFinance"
    />
    <AppCard
      text-content="Kredyty, płatności i zakupy"
      text-title="Finanse"
      @clicked="runFinance"
    />
  </div>
  <TheFooter />
</template>

<style scoped></style>
