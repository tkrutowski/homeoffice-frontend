<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type { AxiosError } from 'axios';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { PASSWORD_STRENGTH_REGEX, resetPassword } from '@/features/account/password/api/passwordApi';
  import type { ResponseData } from '@/types/User';

  const route = useRoute();
  const token = computed(() => {
    const value = route.query.token;
    return typeof value === 'string' ? value : '';
  });

  const newPassword = ref('');
  const confirmPassword = ref('');
  const submitted = ref(false);
  const loading = ref(false);
  const done = ref(false);
  const passwordError = ref<string | null>(null);
  const tokenError = ref<string | null>(null);

  const weak = computed(() => submitted.value && !PASSWORD_STRENGTH_REGEX.test(newPassword.value));
  const mismatch = computed(
    () => submitted.value && newPassword.value.length > 0 && confirmPassword.value !== newPassword.value
  );

  async function save() {
    submitted.value = true;
    passwordError.value = null;
    if (!PASSWORD_STRENGTH_REGEX.test(newPassword.value) || confirmPassword.value !== newPassword.value) {
      return;
    }
    loading.value = true;
    try {
      await resetPassword(token.value, newPassword.value);
      done.value = true;
    } catch (reason) {
      const error = reason as AxiosError<ResponseData>;
      const message = error.response?.data?.message;
      if (error.response?.status === 400 && message?.includes('Hasło musi mieć co najmniej')) {
        passwordError.value = message;
      } else if (error.response?.status === 400) {
        tokenError.value = message || 'Link do resetu hasła jest nieprawidłowy lub wygasł.';
      } else {
        passwordError.value = 'Nie udało się zmienić hasła. Spróbuj ponownie za chwilę.';
      }
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <MainPageShell>
    <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
      <div class="w-full max-w-96">
        <p class="mb-5 mt-5 text-center text-3xl font-bold text-primary">Nowe hasło</p>

        <!-- brak tokenu w URL -->
        <div v-if="!token" class="text-center">
          <p class="mb-4 text-surface-600 dark:text-surface-400">Nieprawidłowy link. Poproś o nowy.</p>
          <router-link to="/forgot-password" class="text-primary hover:underline">Wyślij nowy link</router-link>
        </div>

        <!-- sukces (bez automatycznego logowania) -->
        <div v-else-if="done" class="text-center">
          <p class="mb-4 text-surface-600 dark:text-surface-400">Hasło zostało zmienione.</p>
          <router-link to="/login" class="text-primary hover:underline">Przejdź do logowania</router-link>
        </div>

        <!-- token nieprawidłowy / wygasły / zużyty -->
        <div v-else-if="tokenError" class="text-center">
          <p class="mb-4 text-surface-600 dark:text-surface-400">{{ tokenError }}</p>
          <router-link to="/forgot-password" class="font-bold text-primary hover:underline"
            >Wyślij nowy link</router-link
          >
        </div>

        <form v-else novalidate @submit.prevent="save">
          <FloatLabel>
            <Password
              id="new-password"
              v-model="newPassword"
              toggle-mask
              class="w-full"
              autocomplete="new-password"
              :input-style="{ width: '100%' }"
              :feedback="false"
              :invalid="weak || !!passwordError"
              @update:model-value="passwordError = null"
            />
            <label for="new-password">Nowe hasło</label>
          </FloatLabel>
          <small class="block min-h-[2.5rem] text-sm text-red-600 dark:text-red-400">{{
            passwordError || (weak ? 'Minimum 8 znaków, jedna cyfra i jeden znak specjalny.' : ' ')
          }}</small>

          <FloatLabel class="mt-4">
            <Password
              id="confirm-password"
              v-model="confirmPassword"
              toggle-mask
              class="w-full"
              autocomplete="new-password"
              :input-style="{ width: '100%' }"
              :feedback="false"
              :invalid="mismatch"
            />
            <label for="confirm-password">Powtórz nowe hasło</label>
          </FloatLabel>
          <small class="block min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            mismatch ? 'Hasła nie są identyczne.' : ' '
          }}</small>

          <Button
            type="submit"
            class="mt-3 w-full font-bold uppercase tracking-[2px]"
            outlined
            :loading="loading"
            label="Zmień hasło"
          />
          <p class="mt-4 text-center">
            <router-link to="/login" class="text-primary hover:underline">Wróć do logowania</router-link>
          </p>
        </form>
      </div>
    </div>
  </MainPageShell>
</template>
