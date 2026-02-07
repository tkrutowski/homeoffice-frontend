<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import router from '@/router';
  import { useAuthorizationStore } from '@/stores/authorization';
  import { useToast } from 'primevue/usetoast';
  import ProgressBar from 'primevue/progressbar';
  import { useEc2Control } from '@/composables/useEc2Control';
  import { EC2_INSTANCE_ID } from '@/config/ec2';

  const authorizationStore = useAuthorizationStore();

  const username = ref<string>('');
  const password = ref<string>('');
  const toast = useToast();
  const { ensureInstanceRunning } = useEc2Control();

  type LoginPhase = 'idle' | 'checking' | 'starting' | 'waiting' | 'waiting_app' | 'logging_in';
  const loginPhase = ref<LoginPhase>('idle');

  const phaseMessage: Record<Exclude<LoginPhase, 'idle'>, string> = {
    checking: 'Sprawdzam serwer…',
    starting: 'Uruchamiam serwer…',
    waiting: 'Oczekiwanie na uruchomienie (może zająć 1–2 min)…',
    waiting_app: 'Czekam na gotowość aplikacji…',
    logging_in: 'Logowanie…',
  };

  onMounted(() => {
    console.log('MOUNTED');
    authorizationStore.loginError = null;
  });

  async function login() {
    loginPhase.value = 'checking';

    try {
      await ensureInstanceRunning(EC2_INSTANCE_ID, {
        onPhase: p => {
          loginPhase.value = p;
        },
        waitForAppPing: async () => {
          await authorizationStore.testPing();
        },
      });

      loginPhase.value = 'logging_in';
      const result = await authorizationStore.login(username.value, password.value);
      if (result) {
        goBack();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nie udało się uruchomić serwera.';
      toast.add({
        severity: 'error',
        summary: 'Logowanie',
        detail: message,
        life: 5000,
      });
    } finally {
      loginPhase.value = 'idle';
    }
  }

  watch(
    () => authorizationStore.loginError,
    newValue => {
      if (newValue) {
        toast.add({
          severity: 'error',
          summary: 'Logowanie',
          detail: newValue,
          life: 5000,
        });
      }
    },
    { immediate: true }
  );

  function goBack(): void {
    let history: string[] | [] = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
    const lastAddress = history[history.length - 1];
    if (lastAddress && (lastAddress === '/error' || lastAddress === '/login')) {
      history = history.slice(-25);
      history = history.filter(item => item !== lastAddress); // Usuń ostatnią odwiedzoną stronę
      localStorage.setItem('navigationHistory', JSON.stringify(history));
    }

    if (history.length > 0) router.replace(history[history.length - 1]);
    else router.replace('/');
  }
</script>
<template>
  <form class="max-w-96 mx-auto mt-48" @submit.prevent="login()">
    <p class="mb-5 mt-5 text-center text-3xl font-bold text-primary">Logowanie</p>

    <!-- USERNAME -->
    <FloatLabel class="">
      <InputText id="username" v-model="username" class="w-full" autocomplete="username" required />
      <label for="username">Login</label>
    </FloatLabel>

    <!-- PASSWORD -->
    <FloatLabel class="mt-9">
      <Password
        id="password"
        v-model="password"
        toggle-mask
        required
        class="w-full"
        autocomplete="current-password"
        :input-style="{ width: '100%' }"
        :feedback="false"
      />
      <label for="password" class="w-full">Hasło</label>
    </FloatLabel>

    <!-- BUTTON -->
    <Button
      type="submit"
      class="mt-5 mb-1 font-bold w-full uppercase tracking-[5px]"
      outlined
      :loading="authorizationStore.loading"
      label="ZALOGUJ"
      icon-pos="right"
    />

    <!-- EC2 / login progress -->
    <div v-if="loginPhase !== 'idle'" class="mt-2 mb-2 w-full">
      <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">
        {{ phaseMessage[loginPhase] }}
      </p>
      <ProgressBar mode="indeterminate" class="w-full" />
    </div>

    <p class="text-right mb-4">
      <router-link class="" to="/forgot-password">Nie pamiętam hasła</router-link>
    </p>
  </form>
</template>
