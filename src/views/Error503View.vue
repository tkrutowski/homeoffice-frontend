<script setup lang="ts">
  import TheMenu from '@/components/TheMenu.vue';
  import { useAuthorizationStore } from '@/stores/authorization.ts';
  import { onMounted, ref } from 'vue';
  import router from '@/router';

  const authorizationStore = useAuthorizationStore();
  const counter = ref<number>(5);

  const startPingLoop = () => {
    const interval = setInterval(() => {
      if (counter.value > 0) {
        counter.value--;
      } else {
        authorizationStore
          .testPing()
          .then(() => {
            clearInterval(interval);
            router.back();
          })
          .catch(() => {
            counter.value = 5;
          });
      }
    }, 1000);
  };

  onMounted(() => {
    console.log('onMounted() Error503');
    startPingLoop();
  });
</script>

<template>
  <TheMenu />
  <div class="flex flex-col justify-center items-center w-full mt-10 text-primary">
    <p class="text-3xl">Serwis chwilowo niedostępny</p>
    <p class="text-lg mt-3">Ponowne sprawdzenie za {{ counter }} sekund</p>
  </div>
</template>
