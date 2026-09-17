<script setup lang="ts">
  import { ref } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import { LockClosedIcon } from '@heroicons/vue/24/outline';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useChangePasswordMutation } from '@/features/account/password/queries/usePasswordMutations';
  import { PASSWORD_STRENGTH_REGEX, parsePasswordChangeError } from '@/features/account/password/api/passwordApi';
  import type { ResponseData } from '@/types/User';

  const changePasswordMutation = useChangePasswordMutation();
  const toast = useToast();

  const oldPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const submitted = ref(false);
  const backendOldPasswordError = ref<string | null>(null);
  const backendNewPasswordError = ref<string | null>(null);

  const showErrorOldPassword = () => submitted.value && oldPassword.value.length === 0;
  const showErrorNewPasswordWeak = () => submitted.value && !PASSWORD_STRENGTH_REGEX.test(newPassword.value);
  const showErrorConfirmMismatch = () =>
    submitted.value && newPassword.value.length > 0 && confirmPassword.value !== newPassword.value;

  function isNotValid(): boolean {
    return showErrorOldPassword() || showErrorNewPasswordWeak() || showErrorConfirmMismatch();
  }

  function resetForm() {
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    submitted.value = false;
    backendOldPasswordError.value = null;
    backendNewPasswordError.value = null;
  }

  async function savePassword() {
    submitted.value = true;
    backendOldPasswordError.value = null;
    backendNewPasswordError.value = null;
    if (isNotValid()) {
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      });
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Hasło zostało zmienione.',
        life: 3000,
      });
      resetForm();
    } catch (reason) {
      const parsed = parsePasswordChangeError(reason as AxiosError<ResponseData>);
      if (parsed.field === 'oldPassword') {
        backendOldPasswordError.value = parsed.message;
      } else if (parsed.field === 'newPassword') {
        backendNewPasswordError.value = parsed.message;
      } else {
        toast.add({ severity: 'error', summary: 'Błąd', detail: parsed.message, life: 3000 });
      }
    }
  }

  const ptPasswordField = {
    root: { class: 'w-full' },
    pcInputText: {
      root: {
        class:
          'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
          'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
          'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
      },
    },
  };
</script>

<template>
  <FormSectionCard title="Zmiana hasła" :icon="LockClosedIcon">
    <form class="flex flex-col gap-5" @submit.stop.prevent="savePassword">
      <div class="flex flex-col gap-2">
        <label class="text-sm text-surface-600 dark:text-surface-400" for="password-old">Obecne hasło</label>
        <Password
          id="password-old"
          v-model="oldPassword"
          toggle-mask
          :feedback="false"
          :pt="ptPasswordField"
          :invalid="showErrorOldPassword() || !!backendOldPasswordError"
          @update:model-value="backendOldPasswordError = null"
        />
        <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
          backendOldPasswordError || (showErrorOldPassword() ? 'Pole jest wymagane.' : ' ')
        }}</small>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="password-new">Nowe hasło</label>
          <Password
            id="password-new"
            v-model="newPassword"
            toggle-mask
            :feedback="true"
            :pt="ptPasswordField"
            :invalid="showErrorNewPasswordWeak() || !!backendNewPasswordError"
            @update:model-value="backendNewPasswordError = null"
          />
          <small class="min-h-[2.5rem] text-sm text-red-600 dark:text-red-400">{{
            backendNewPasswordError ||
            (showErrorNewPasswordWeak() ? 'Minimum 8 znaków, jedna cyfra i jeden znak specjalny.' : ' ')
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="password-confirm"
            >Powtórz nowe hasło</label
          >
          <Password
            id="password-confirm"
            v-model="confirmPassword"
            toggle-mask
            :feedback="false"
            :pt="ptPasswordField"
            :invalid="showErrorConfirmMismatch()"
          />
          <small class="min-h-[2.5rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorConfirmMismatch() ? 'Hasła nie są identyczne.' : ' '
          }}</small>
        </div>
      </div>

      <div class="flex flex-row justify-end gap-2">
        <OfficeButton text="Anuluj" type="button" btn-type="office-regular" @click="resetForm" />
        <OfficeButton
          text="Zmień hasło"
          btn-type="office-save"
          type="submit"
          :loading="changePasswordMutation.isPending.value"
        />
      </div>
    </form>
  </FormSectionCard>
</template>
