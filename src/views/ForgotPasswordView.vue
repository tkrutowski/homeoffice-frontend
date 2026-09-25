<script setup lang="ts">
  import { computed, ref } from 'vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { requestPasswordReset } from '@/features/account/password/api/passwordApi';

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const email = ref('');
  const submitted = ref(false);
  const loading = ref(false);
  const done = ref(false);

  const emailInvalid = computed(() => submitted.value && !EMAIL_REGEX.test(email.value.trim()));

  async function send() {
    submitted.value = true;
    if (!EMAIL_REGEX.test(email.value.trim())) {
      return;
    }
    loading.value = true;
    try {
      await requestPasswordReset(email.value.trim());
    } catch {
      // Celowo ignorujemy wynik - UI nie może zdradzać, czy konto istnieje.
    } finally {
      loading.value = false;
      done.value = true;
    }
  }
</script>

<template>
  <MainPageShell>
    <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
      <div class="w-full max-w-96">
        <p class="mb-5 mt-5 text-center text-3xl font-bold text-primary">Reset hasła</p>

        <p v-if="done" class="mb-6 text-center text-surface-600 dark:text-surface-400">
          Jeśli podany e-mail istnieje w naszej bazie, wysłaliśmy na niego link do resetu hasła.
        </p>

        <form v-else novalidate @submit.prevent="send">
          <p class="mb-6 text-sm text-surface-600 dark:text-surface-400">
            Podaj adres e-mail powiązany z kontem, a wyślemy Ci link do ustawienia nowego hasła.
          </p>
          <FloatLabel>
            <InputText
              id="email"
              v-model="email"
              type="email"
              class="w-full"
              autocomplete="email"
              :invalid="emailInvalid"
            />
            <label for="email">E-mail</label>
          </FloatLabel>
          <small class="block min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            emailInvalid ? 'Podaj poprawny adres e-mail.' : ' '
          }}</small>

          <Button
            type="submit"
            class="mt-3 w-full font-bold uppercase tracking-[2px]"
            outlined
            :loading="loading"
            label="Wyślij link resetujący"
          />
        </form>

        <p class="mt-4 text-center">
          <router-link to="/login" class="text-primary hover:underline">Wróć do logowania</router-link>
        </p>
      </div>
    </div>
  </MainPageShell>
</template>
