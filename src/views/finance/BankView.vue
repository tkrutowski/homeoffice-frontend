<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { computed, onMounted, ref } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useToast } from 'primevue/usetoast';
  import router from '@/router';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { AxiosError } from 'axios';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import type { Bank } from '@/types/Bank.ts';
  import { useBanksStore } from '@/stores/banks.ts';
  import NipGusLookupPanel from '@/components/share/NipGusLookupPanel.vue';
  import type { CompanyLookupResult } from '@/types/CompanyLookup';
  import { applyCompanyLookupToParty } from '@/utils/applyCompanyLookupToParty';
  import {
    CalendarDaysIcon,
    InformationCircleIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    BuildingLibraryIcon,
  } from '@heroicons/vue/24/outline';

  const bankStore = useBanksStore();
  const route = useRoute();

  const toast = useToast();
  const bank = ref<Bank>({
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
    return bankStore.loadingBanks || btnSaveDisabled.value;
  });

  //
  //SAVE
  //
  function saveBank() {
    submitted.value = true;
    if (isEdit.value) {
      editBank();
    } else {
      newBank();
    }
  }

  //
  //---------------------------------------------------------NEW BANK----------------------------------------------
  //
  async function newBank() {
    console.log('newBank()');
    if (!isValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      await bankStore
        .addBankDb(bank.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano bank: ' + bank.value.name,
            life: 3000,
          });
          setTimeout(() => {
            btnSaveDisabled.value = false;
            router.push({ name: 'Banks' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          console.error(reason);
          btnSaveDisabled.value = false;
          toast.add({
            severity: 'error',
            summary: 'Błąd podczas dodawania banku.',
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
  //-----------------------------------------------------EDIT BANK------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editBank() {
    if (!isValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      await bankStore
        .updateBankDb(bank.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano dane banku: ' + bank.value.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Banks' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: 'Błąd podczas edycji banku.',
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
      console.log('onMounted NEW BANK');
    } else {
      console.log('onMounted EDIT BANK');
      const bankId = Number(route.params.bankId as string);
      bankStore
        .getBankFromDb(bankId)
        .then(data => {
          if (data) {
            bank.value = data;
          }
        })
        .catch(error => {
          console.error('Błąd podczas pobierania banku:', error);
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
    return bank.value.name.length > 0;
  };

  const showErrorName = () => {
    return submitted.value && bank.value.name.length <= 0;
  };
  const showErrorZip = () => {
    if (submitted.value) {
      const { zip } = bank.value.address;
      if (!zip) return false; // Jeśli zip jest pusty, nie pokazuj błędu
      return !/^\d{2}-\d{3}$/.test(zip) || zip.length > 6;
    }
    return false;
  };

  const showErrorMail = () => {
    if (submitted.value && bank.value.mail.length > 0) {
      return !bank.value.mail.includes('@');
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

  function onCompanyLookupFilled(result: CompanyLookupResult) {
    applyCompanyLookupToParty(bank.value, result);
  }
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <form class="mx-auto max-w-4xl" @submit.stop.prevent="saveBank">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{ isEdit ? 'Edycja danych banku' : 'Nowy bank' }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <OfficeIconButton
                title="Powrót do listy banków"
                class="text-orange-500"
                @click="() => router.push({ name: 'Banks' })"
              >
                <template #icon>
                  <CalendarDaysIcon aria-hidden="true" />
                </template>
              </OfficeIconButton>
              <ProgressSpinner v-if="bankStore.loadingBanks" class="h-8 w-8 [&>svg]:h-8 [&>svg]:w-8" stroke-width="5" />
            </div>
          </div>

          <NipGusLookupPanel @filled="onCompanyLookupFilled" />

          <div class="flex flex-col gap-6">
            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <InformationCircleIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Informacje ogólne</span>
              </h2>
              <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-name">Nazwa banku</label>
                <div
                  class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                  :class="{ 'border-red-500 dark:border-red-400': showErrorName() }"
                >
                  <div
                    class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                  >
                    <BuildingLibraryIcon class="h-5 w-5" aria-hidden="true" />
                  </div>
                  <InputText id="bank-name" v-model="bank.name" maxlength="100" :pt="ptFieldInputText" />
                </div>
                <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                  showErrorName() ? 'Pole jest wymagane.' : '\u00a0'
                }}</small>
              </div>
            </div>

            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <MapPinIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Adres</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3">
                <div class="flex flex-col gap-2 md:col-span-2 mr-5">
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-street">Ulica</label>
                  <InputText id="bank-street" v-model="bank.address.street" maxlength="100" :pt="ptFieldInputText" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-zip">Kod</label>
                  <InputText
                    id="bank-zip"
                    v-model="bank.address.zip"
                    maxlength="6"
                    :pt="ptFieldInputText"
                    :class="{ 'p-invalid': showErrorZip() }"
                  />
                  <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                    showErrorZip() ? 'Prawidłowy format to: 61-754' : '\u00a0'
                  }}</small>
                </div>
                <div class="flex flex-col gap-2 md:col-span-3">
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-city">Miasto</label>
                  <InputText id="bank-city" v-model="bank.address.city" maxlength="100" :pt="ptFieldInputText" />
                </div>
              </div>
            </div>

            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <PhoneIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Kontakt</span>
              </h2>
              <div class="flex flex-col gap-5">
                <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-phone">Telefon</label>
                    <InputText id="bank-phone" v-model="bank.phone" maxlength="30" :pt="ptFieldInputText" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-phone2">Telefon 2</label>
                    <InputText id="bank-phone2" v-model="bank.phone2" maxlength="30" :pt="ptFieldInputText" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-fax">Fax</label>
                    <InputText id="bank-fax" v-model="bank.fax" maxlength="30" :pt="ptFieldInputText" />
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-mail">E-mail</label>
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorMail() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <EnvelopeIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <InputText id="bank-mail" v-model="bank.mail" maxlength="100" :pt="ptFieldInputText" />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorMail() ? 'Niepoprawny format.' : '\u00a0'
                    }}</small>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="bank-www">WWW</label>
                    <InputText id="bank-www" v-model="bank.www" maxlength="100" :pt="ptFieldInputText" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <DocumentTextIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Dodatkowe informacje</span>
              </h2>
              <Textarea id="bank-other-info" v-model="bank.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
            </div>
          </div>

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
