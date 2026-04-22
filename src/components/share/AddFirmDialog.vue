<script setup lang="ts">
  import { ref } from 'vue';
  import { type Firm } from '@/types/Firm.ts';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useToast } from 'primevue/usetoast';
  import FirmFormFields from '@/components/share/FirmFormFields.vue';

  const toast = useToast();
  const firm = ref<Firm>({
    id: 0,
    name: '',
    phone: '',
    phone2: '',
    fax: '',
    www: '',
    mail: '',
    otherInfo: '',
    address: {
      id: 0,
      city: '',
      street: '',
      zip: '',
    },
  });

  const emit = defineEmits<{
    (e: 'save', firm: Firm): void;
    (e: 'cancel'): void;
  }>();

  const cancel = () => {
    emit('cancel');
  };

  const submitted = ref(false);
  const save = () => {
    submitted.value = true;
    if (!isValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      emit('save', firm.value);
      reset();
    }
  };

  const reset = () => {
    firm.value = {
      id: 0,
      name: '',
      phone: '',
      phone2: '',
      fax: '',
      www: '',
      mail: '',
      otherInfo: '',
      address: {
        id: 0,
        city: '',
        street: '',
        zip: '',
      },
    };
  };

  //
  //-----------------------------------------------------ERROR-------------------------------------------------------
  //

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Error Message',
      detail: msg,
      life: 5000,
    });
  };
  const isValid = () => {
    return firm.value.name.length > 0;
  };

  const showErrorName = () => {
    return submitted.value && firm.value.name.length <= 0;
  };
  const showErrorZip = () => {
    if (submitted.value) {
      const { zip } = firm.value.address;
      if (!zip) return false; // Jeśli zip jest pusty, nie pokazuj błędu
      return !/^\d{2}-\d{3}$/.test(zip) || zip.length > 6;
    }
    return false;
  };
  const showErrorMail = () => {
    if (submitted.value && firm.value.mail.length > 0) {
      return !firm.value.mail.includes('@');
    }
    return false;
  };

  const ptFieldInputText = {
    root: {
      class:
        'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };

  const ptTextareaField = {
    root: {
      class:
        'w-full min-h-[8rem] resize-y rounded-lg border border-surface-300 bg-surface-0 py-3 text-surface-900 ' +
        'placeholder:text-surface-500 enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };
</script>

<template>
  <Dialog :style="{ width: 'min(95vw, 64rem)' }" :modal="true">
    <template #header>
      <p class="text-xl text-center mx-auto">Nowa firma</p>
    </template>
    <div class="max-h-[70vh] overflow-y-auto pr-1">
      <FirmFormFields
        :firm="firm"
        :show-error-name="showErrorName()"
        :show-error-zip="showErrorZip()"
        :show-error-mail="showErrorMail()"
        :pt-field-input-text="ptFieldInputText"
        :pt-textarea-field="ptTextareaField"
      />
    </div>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel" @abort="cancel"></OfficeButton>
        <OfficeButton text="zapisz" btn-type="office-save" @click="save"></OfficeButton>
      </div>
    </template>
  </Dialog>
</template>
