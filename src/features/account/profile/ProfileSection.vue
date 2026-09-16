<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import { UserIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/vue/24/outline';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useMyProfileQuery } from '@/features/account/profile/queries/useProfileQueries';
  import { useUpdateProfileMutation } from '@/features/account/profile/queries/useProfileMutations';
  import type { AccountProfile } from '@/features/account/profile/types';
  import type { ResponseData } from '@/types/User';

  const profileQuery = useMyProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const toast = useToast();

  const profile = ref<AccountProfile | null>(null);
  const submitted = ref(false);
  const emailTakenError = ref(false);

  watch(
    () => profileQuery.data.value,
    data => {
      if (data) {
        profile.value = { ...data };
      }
    },
    { immediate: true }
  );

  function resetForm() {
    if (profileQuery.data.value) {
      profile.value = { ...profileQuery.data.value };
    }
    submitted.value = false;
    emailTakenError.value = false;
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showErrorFirstName = () => submitted.value && (profile.value?.firstName.trim().length ?? 0) === 0;
  const showErrorLastName = () => submitted.value && (profile.value?.lastName.trim().length ?? 0) === 0;
  const showErrorEmailFormat = () => submitted.value && !EMAIL_REGEX.test(profile.value?.email ?? '');
  const showErrorEmailTaken = () => emailTakenError.value;

  function isNotValid(): boolean {
    return showErrorFirstName() || showErrorLastName() || showErrorEmailFormat();
  }

  function accountStatusLabel(data: AccountProfile): string {
    if (!data.enabled) return 'Wyłączone';
    if (!data.notLocked) return 'Zablokowane';
    return 'Aktywne';
  }

  function accountStatusSeverity(data: AccountProfile): 'success' | 'danger' | 'warn' {
    if (!data.enabled) return 'danger';
    if (!data.notLocked) return 'warn';
    return 'success';
  }

  async function saveProfile() {
    submitted.value = true;
    emailTakenError.value = false;
    if (!profile.value || isNotValid()) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstName: profile.value.firstName.trim(),
        lastName: profile.value.lastName.trim(),
        email: profile.value.email.trim(),
      });
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zapisano zmiany w profilu.',
        life: 3000,
      });
      submitted.value = false;
    } catch (reason) {
      const error = reason as AxiosError<ResponseData>;
      if (error.response?.status === 400 && error.response.data?.message === 'Email already exists') {
        emailTakenError.value = true;
      } else {
        toast.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Błąd podczas zapisywania profilu.',
          life: 3000,
        });
      }
    }
  }

  const ptFieldInputText = {
    root: {
      class:
        'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };
</script>

<template>
  <FormSectionCard title="Dane profilu" :icon="UserIcon">
    <form class="flex flex-col gap-5" @submit.stop.prevent="saveProfile">
      <div v-if="profile" class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="profile-first-name">Imię</label>
          <InputText
            id="profile-first-name"
            v-model="profile.firstName"
            :pt="ptFieldInputText"
            :invalid="showErrorFirstName()"
          />
          <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorFirstName() ? 'Pole jest wymagane.' : ' '
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="profile-last-name">Nazwisko</label>
          <InputText
            id="profile-last-name"
            v-model="profile.lastName"
            :pt="ptFieldInputText"
            :invalid="showErrorLastName()"
          />
          <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorLastName() ? 'Pole jest wymagane.' : ' '
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="profile-email">Adres e-mail</label>
          <div
            class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
            :class="{ 'border-red-500 dark:border-red-400': showErrorEmailFormat() || showErrorEmailTaken() }"
          >
            <div
              class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
            >
              <EnvelopeIcon class="h-5 w-5" aria-hidden="true" />
            </div>
            <InputText
              id="profile-email"
              v-model="profile.email"
              class="w-full"
              :pt="{
                root: {
                  class:
                    'w-full border-0 bg-transparent text-surface-900 shadow-none enabled:focus:border-transparent enabled:focus:shadow-none enabled:focus:ring-0 dark:text-surface-0',
                },
              }"
              @input="emailTakenError = false"
            />
          </div>
          <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorEmailTaken()
              ? 'Ten adres e-mail jest już zajęty przez innego użytkownika.'
              : showErrorEmailFormat()
                ? 'Podaj poprawny adres e-mail.'
                : ' '
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="profile-username">Nazwa użytkownika</label>
          <div
            class="flex min-h-[2.75rem] items-center overflow-hidden rounded-lg border border-surface-300 bg-surface-100 dark:border-surface-600 dark:bg-surface-800"
          >
            <div
              class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
            >
              <IdentificationIcon class="h-5 w-5" aria-hidden="true" />
            </div>
            <InputText id="profile-username" :model-value="profile.username" class="w-full" disabled />
          </div>
          <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400"
            >Nazwy użytkownika nie można zmienić</small
          >
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-surface-600 dark:text-surface-400">Status konta</label>
          <div>
            <Tag :value="accountStatusLabel(profile)" :severity="accountStatusSeverity(profile)" />
          </div>
        </div>
      </div>

      <div class="flex flex-row justify-end gap-2">
        <OfficeButton text="Anuluj" type="button" btn-type="office-regular" @click="resetForm" />
        <OfficeButton
          text="Zapisz zmiany"
          btn-type="office-save"
          type="submit"
          :loading="updateProfileMutation.isPending.value"
        />
      </div>
    </form>
  </FormSectionCard>
</template>
