<script setup lang="ts">
  import { ref } from 'vue';
  import moment from 'moment';
  import { useToast } from 'primevue/usetoast';
  import { FingerPrintIcon } from '@heroicons/vue/24/outline';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import { usePasskeysQuery } from '@/features/account/passkeys/queries/usePasskeyQueries';
  import {
    useDeletePasskeyMutation,
    useRegisterPasskeyMutation,
  } from '@/features/account/passkeys/queries/usePasskeyMutations';
  import { useWebAuthn } from '@/composables/useWebAuthn';
  import type { PasskeyCredential } from '@/features/account/passkeys/types';

  const { isSupported } = useWebAuthn();
  const passkeysQuery = usePasskeysQuery();
  const registerMutation = useRegisterPasskeyMutation();
  const deleteMutation = useDeletePasskeyMutation();
  const toast = useToast();

  const passkeyToDelete = ref<PasskeyCredential | null>(null);
  const showDeleteConfirmationDialog = ref(false);

  function formatDate(date: Date): string {
    return moment(date).format('DD.MM.YYYY, HH:mm');
  }

  function passkeyLabel(passkey: PasskeyCredential): string {
    return passkey.label?.trim() || `Klucz dodany ${formatDate(passkey.created)}`;
  }

  async function addPasskey() {
    try {
      const registered = await registerMutation.mutateAsync();
      if (registered) {
        toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Dodano klucz dostępu.', life: 3000 });
      }
      // registered === false -> użytkownik anulował prompt biometrii, cicho pomijamy
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się dodać klucza dostępu.',
        life: 3000,
      });
    }
  }

  function confirmDeletePasskey(passkey: PasskeyCredential) {
    passkeyToDelete.value = passkey;
    showDeleteConfirmationDialog.value = true;
  }

  async function submitDeletePasskey() {
    if (!passkeyToDelete.value) return;
    try {
      await deleteMutation.mutateAsync(passkeyToDelete.value.id);
      toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Usunięto klucz dostępu.', life: 3000 });
    } catch {
      toast.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się usunąć klucza dostępu.', life: 3000 });
    } finally {
      showDeleteConfirmationDialog.value = false;
      passkeyToDelete.value = null;
    }
  }
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="`Czy chcesz usunąć klucz dostępu: <b>${passkeyToDelete ? passkeyLabel(passkeyToDelete) : ''}</b>?`"
    label="Usuń"
    @save="submitDeletePasskey"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <FormSectionCard
    title="Klucze dostępu (passkeys)"
    :icon="FingerPrintIcon"
    description="Loguj się odciskiem palca, Face ID lub Windows Hello zamiast hasła."
  >
    <p v-if="!isSupported" class="text-sm text-surface-500 dark:text-surface-400">
      Ta przeglądarka lub urządzenie nie obsługuje kluczy dostępu (WebAuthn).
    </p>

    <template v-else>
      <ul v-if="passkeysQuery.data.value?.length" class="mb-4 flex flex-col gap-3">
        <li
          v-for="passkey in passkeysQuery.data.value"
          :key="passkey.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-surface-200 bg-surface-50/80 px-3 py-2.5 dark:border-surface-700 dark:bg-surface-900/50"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm text-surface-900 dark:text-surface-0">{{ passkeyLabel(passkey) }}</p>
            <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">
              Dodano: {{ formatDate(passkey.created) }} ·
              {{ passkey.lastUsed ? `Ostatnio użyty: ${formatDate(passkey.lastUsed)}` : 'Nigdy nieużyty' }}
            </p>
          </div>
          <OfficeIconButton
            class="text-red-500"
            icon="pi pi-trash"
            :title="'Usuń klucz: ' + passkeyLabel(passkey)"
            @click="confirmDeletePasskey(passkey)"
          />
        </li>
      </ul>
      <p v-else-if="!passkeysQuery.isLoading.value" class="mb-4 text-sm text-surface-500 dark:text-surface-400">
        Nie masz jeszcze żadnego klucza dostępu.
      </p>

      <div class="flex justify-end">
        <OfficeButton
          text="Dodaj klucz dostępu"
          btn-type="office-regular"
          icon="pi pi-key"
          :loading="registerMutation.isPending.value"
          @click="addPasskey"
        />
      </div>
    </template>
  </FormSectionCard>
</template>
