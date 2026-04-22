<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { computed, onMounted, ref } from 'vue';
  import { type Firm } from '@/types/Firm.ts';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useToast } from 'primevue/usetoast';
  import router from '@/router';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { AxiosError } from 'axios';
  import { useFirmsStore } from '@/stores/firms.ts';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { CalendarDaysIcon } from '@heroicons/vue/24/outline';
  import FirmFormFields from '@/components/share/FirmFormFields.vue';

  const firmStore = useFirmsStore();
  const route = useRoute();

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

  const btnSaveDisabled = ref<boolean>(false);
  const btnShowBusy = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return firmStore.loadingFirms || btnSaveDisabled.value;
  });

  //
  //SAVE
  //
  function saveFirm() {
    submitted.value = true;
    if (isEdit.value) {
      editFirm();
    } else {
      newFirm();
    }
  }

  //
  //---------------------------------------------------------NEW FIRM----------------------------------------------
  //
  async function newFirm() {
    console.log('newFirm()');
    if (!isValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      await firmStore
        .addFirmDb(firm.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano firmę: ' + firm.value.name,
            life: 3000,
          });
          setTimeout(() => {
            btnSaveDisabled.value = false;
            router.push({ name: 'Firms' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          console.error(reason);
          btnSaveDisabled.value = false;
          toast.add({
            severity: 'error',
            summary: 'Błąd podczas dodawania firmy.',
            detail: (reason?.response?.data as { message: string }).message,
            life: 5000,
          });
        })
        .finally(() => {
          btnShowBusy.value = false;
        });
      submitted.value = false;
    }
  }

  //
  //-----------------------------------------------------EDIT FRIMA------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editFirm() {
    if (!isValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      await firmStore
        .updateFirmDb(firm.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano dane firmy: ' + firm.value.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Firms' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: 'Błąd podczas edycji firmy.',
            detail: (reason?.response?.data as { message: string }).message,
            life: 5000,
          });
        });
    }
  }

  onMounted(async () => {
    console.log('onMounted EDIT', route.params);
    btnSaveDisabled.value = true;
    isEdit.value = route.params.isEdit === 'true';
    if (!isEdit.value) {
      console.log('onMounted NEW FIRM');
    } else {
      console.log('onMounted EDIT FIRM');
      const firmId = Number(route.params.firmId as string);
      firmStore
        .getFirmFromDb(firmId)
        .then(data => {
          if (data) {
            firm.value = data;
          }
        })
        .catch(error => {
          console.error('Błąd podczas pobierania firmy:', error);
        });
    }
    btnSaveDisabled.value = false;
  });

  //
  //-----------------------------------------------------ERROR-------------------------------------------------------
  //
  const submitted = ref(false);

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
  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <form class="mx-auto max-w-4xl" @submit.stop.prevent="saveFirm">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{ isEdit ? 'Edycja danych firmy' : 'Nowa firma' }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <OfficeIconButton
                title="Powrót do listy firm"
                class="text-orange-500"
                @click="() => router.push({ name: 'Firms' })"
              >
                <template #icon>
                  <CalendarDaysIcon aria-hidden="true" />
                </template>
              </OfficeIconButton>
              <ProgressSpinner v-if="firmStore.loadingFirms" class="h-8 w-8 [&>svg]:h-8 [&>svg]:w-8" stroke-width="5" />
            </div>
          </div>

          <FirmFormFields
            :firm="firm"
            :show-error-name="showErrorName()"
            :show-error-zip="showErrorZip()"
            :show-error-mail="showErrorMail()"
            :pt-field-input-text="ptFieldInputText"
            :pt-textarea-field="ptTextareaField"
          />

          <div class="mt-8 flex justify-end">
            <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :is-busy-icon="btnShowBusy"
              :btn-disabled="isSaveBtnDisabled"
            />
          </div>
        </div>
      </form>
    </div>
  </MainPageShell>
</template>
