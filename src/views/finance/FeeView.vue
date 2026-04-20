<script setup lang="ts">
  import { useUsersStore } from '@/stores/users';
  import { useRoute } from 'vue-router';
  import { computed, onMounted, ref, watch } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import router from '@/router';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { User } from '@/types/User';
  import { useFeeStore } from '@/stores/fee';
  import { useFirmsStore } from '@/stores/firms';
  import { useToast } from 'primevue/usetoast';
  import type { Firm } from '@/types/Firm';
  import type { Fee, FeeFrequency } from '@/types/Fee';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';
  import AddFirmDialog from '@/components/share/AddFirmDialog.vue';
  import {
    UserIcon,
    BuildingOffice2Icon,
    CalendarDaysIcon,
    BanknotesIcon,
    CreditCardIcon,
    InformationCircleIcon,
    CalculatorIcon,
    DocumentTextIcon,
  } from '@heroicons/vue/24/outline';

  const userStore = useUsersStore();
  const feeStore = useFeeStore();
  const firmStore = useFirmsStore();
  const route = useRoute();
  const toast = useToast();
  const selectedUser = ref<User | null>(null);
  const selectedFirm = ref<Firm | null>(null);
  const selectedFeeFrequency = ref<FeeFrequency | null>(null);

  const fee = ref<Fee>({
    id: 0,
    firm: null,
    idUser: 0,
    name: '',
    amount: 0,
    date: null,
    feeNumber: '',
    accountNumber: '',
    firstPaymentDate: null,
    numberOfPayments: 1,
    feeStatus: PaymentStatus.TO_PAY,
    feeFrequency: null,
    otherInfo: '',
    installmentList: [],
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return (
      feeStore.loadingFeeFrequencyType ||
      feeStore.loadingFees ||
      userStore.loadingUsers ||
      firmStore.loadingFirms ||
      btnSaveDisabled.value
    );
  });
  //
  //AUTO COMPLETE
  //
  const filteredFirms = ref<Firm[]>([]);
  const searchFirm = (event: { query: string }) => {
    filteredFirms.value = firmStore.firms.filter((firm: Firm) => {
      return firm.name.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  watch(selectedFirm, (newFirm: Firm | null) => {
    fee.value.firm = newFirm;
  });
  //
  //SAVE
  //
  function saveFee() {
    submitted.value = true;
    if (isEdit.value) {
      editFee();
    } else {
      newFee();
    }
  }

  //
  //---------------------------------------------------------NEW FEE----------------------------------------------
  //
  async function newFee() {
    console.log('newFee()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      // btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      btnSaveDisabled.value = true;
      await feeStore
        .addFeeDb(fee.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano opłatę: ' + fee.value?.name,
            life: 3000,
          });
          btnShowBusy.value = false;
          setTimeout(() => {
            router.push({ name: 'Fees' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas zapisywania opłaty: ' + fee.value?.name,
            life: 3000,
          });
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
        });
    }
  }

  //
  //-----------------------------------------------------EDIT FEE------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editFee() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      console.log('editFee()');
      await feeStore
        .updateFeeDb(fee.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano opłatę: ' + fee.value?.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Fees' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizowania opłaty: ' + fee.value?.name,
            life: 3000,
          });
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
        });
    }
  }

  //---------------------------------------------MOUNTED--------------------------------------------
  onMounted(() => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    if (userStore.users.length === 0) userStore.getUsersFromDb();
    if (firmStore.firms.length === 0) firmStore.getFirmsFromDb();
    if (feeStore.feeFrequencyTypes.length === 0) feeStore.getFeeFrequencyType();
    btnSaveDisabled.value = false;
    // if (feeStore.fees.length === 0) feeStore.getFeesFromDb('ALL', true);
  });

  onMounted(async () => {
    // console.log("onMounted EDIT", route.params);
    btnSaveDisabled.value = true;
    isEdit.value = route.params.isEdit === 'true';

    // Sprawdź czy jest parametr copyFromId (kopiowanie opłaty)
    const copyFromId = route.query.copyFromId;

    if (copyFromId) {
      console.log('onMounted COPY FEE from ID:', copyFromId);
      const sourceFeeId = Number(copyFromId as string);
      feeStore
        .getFeeFromDb(sourceFeeId)
        .then((data: Fee | null) => {
          if (data) {
            // Kopiuj dane z opłaty źródłowej, ale resetuj ID i listy
            fee.value = {
              ...data,
              id: 0, // Nowa opłata musi mieć ID = 0
              installmentList: [], // Czyścimy listę rat - będą wygenerowane na nowo
            };
            selectedFirm.value = fee.value.firm;
            selectedUser.value = userStore.getUser(fee.value.idUser);
            selectedFeeFrequency.value = fee.value.feeFrequency;
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania opłaty do skopiowania:', error);
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Nie udało się pobrać danych opłaty do skopiowania',
            life: 3000,
          });
        });
    } else if (isEdit.value === false) {
      console.log('onMounted NEW FEE');
    } else {
      console.log('onMounted EDIT FEE');
      const feeId = Number(route.params.feeId as string);
      feeStore
        .getFeeFromDb(feeId)
        .then((data: Fee | null) => {
          if (data) {
            fee.value = data;
            selectedFirm.value = fee.value.firm;
            selectedUser.value = userStore.getUser(fee.value.idUser);
            selectedFeeFrequency.value = fee.value.feeFrequency;
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania opłaty:', error);
        });
    }
    btnSaveDisabled.value = false;
  });

  //
  //------------------------------------------------ERROR----------------------------------------------------------
  //
  const submitted = ref(false);

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Error Message',
      detail: msg,
      life: 3000,
    });
  };
  const isNotValid = () => {
    return (
      showErrorName() ||
      showErrorUser() ||
      showErrorFirm() ||
      showErrorFeeFrequency() ||
      showErrorNumber() ||
      showErrorAmount() ||
      showErrorAccountNumber() ||
      showErrorFirstDate() ||
      showErrorDate()
    );
  };
  const showErrorName = () => {
    return submitted.value && fee.value.name.length === 0;
  };
  const showErrorUser = () => {
    return submitted.value && fee.value.idUser === 0;
  };
  const showErrorFirm = () => {
    return submitted.value && !fee.value.firm;
  };
  const showErrorFeeFrequency = () => {
    return submitted.value && !fee.value.feeFrequency;
  };
  const showErrorNumber = () => {
    return submitted.value && fee.value.feeNumber.length === 0;
  };
  const showErrorAmount = () => {
    return submitted.value && fee.value.amount <= 0;
  };
  const showErrorAccountNumber = () => {
    //todo zrobić regex
    return submitted.value && fee.value.accountNumber.length === 0;
  };
  const showErrorDate = () => {
    return submitted.value && !fee.value.date;
  };
  const showErrorFirstDate = () => {
    return submitted.value && !fee.value.firstPaymentDate;
  };

  //
  //----------------------------------------------NEW FIRM-------------------------------
  //
  const showNewFirmModal = ref<boolean>(false);

  async function newFirm(firm: Firm) {
    console.log('newFirm()', firm);
    showNewFirmModal.value = false;
    await firmStore
      .addFirmDb(firm)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano firmę: ' + firm.name,
          life: 3000,
        });
      })
      .catch((reason: AxiosError) => {
        console.error(reason);
        toast.add({
          severity: 'error',
          summary: 'Błąd podczas dodawania firmy.',
          detail: (reason?.response?.data as { message: string }).message,
          life: 5000,
        });
      });
  }

  const ptFieldInputText = {
    root: {
      class:
        'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };

  const ptSelectInField = {
    root: {
      class: 'flex-1 rounded-none border-0 shadow-none',
    },
    label: {
      class: 'border-0 bg-transparent text-surface-900 dark:text-surface-0',
    },
    dropdown: {
      class: 'border-0 bg-transparent text-surface-500 dark:text-surface-400',
    },
  };

  const ptAutoCompleteInField = {
    root: {
      class: 'flex min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none',
    },
    pcInputText: {
      root: {
        class:
          'w-full rounded-none border-0 bg-transparent text-surface-900 shadow-none ' +
          'enabled:focus:border-transparent enabled:focus:shadow-none enabled:focus:ring-0 ' +
          'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
      },
    },
    dropdown: {
      class:
        'border-0 bg-transparent text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-0',
    },
  };

  const ptDatePickerField = {
    root: {
      class: 'w-full',
    },
    pcInputText: {
      root: {
        class:
          'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 ' +
          'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
          'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0',
      },
    },
  };

  const ptInputNumberAmount = {
    root: {
      class: 'min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none',
    },
    pcInputText: {
      root: {
        class:
          'w-full border-0 bg-transparent text-surface-900 shadow-none ' +
          'enabled:focus:border-transparent enabled:focus:shadow-none enabled:focus:ring-0 ' +
          'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
      },
    },
  };

  const ptInputMaskField = {
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
  <AddFirmDialog v-model:visible="showNewFirmModal" @save="newFirm" @cancel="showNewFirmModal = false" />

  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <form class="mx-auto max-w-4xl" @submit.stop.prevent="saveFee">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{
                isEdit ? `Edycja opłaty: ${fee?.name}` : route.query.copyFromId ? 'Nowa opłata (kopia)' : 'Nowa opłata'
              }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <OfficeIconButton
                title="Powrót do listy opłat"
                class="text-orange-500"
                @click="() => router.push({ name: 'Fees' })"
              >
                <template #icon>
                  <CalendarDaysIcon aria-hidden="true" />
                </template>
              </OfficeIconButton>
            </div>
          </div>

          <div class="flex flex-col gap-6">
            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <InformationCircleIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Informacje ogólne</span>
              </h2>
              <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-name">Nazwa</label>
                  <InputText
                    id="fee-name"
                    v-model="fee.name"
                    maxlength="50"
                    :pt="ptFieldInputText"
                    :class="{ 'p-invalid': showErrorName() }"
                  />
                  <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                    showErrorName() ? 'Pole jest wymagane.' : '\u00a0'
                  }}</small>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-user"
                      >Wybierz użytkownika</label
                    >
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorUser() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <UserIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Select
                        id="fee-user"
                        v-model="selectedUser"
                        :pt="ptSelectInField"
                        :options="userStore.users"
                        :option-label="user => user.firstName + ' ' + user.lastName"
                        placeholder="Wybierz użytkownika"
                        :loading="userStore.loadingUsers"
                        required
                        @change="fee.idUser = selectedUser ? selectedUser.id : 0"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorUser() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-firm">Wybierz firmę</label>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      <div
                        class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                        :class="{ 'border-red-500 dark:border-red-400': showErrorFirm() }"
                      >
                        <div
                          class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                        >
                          <BuildingOffice2Icon class="h-5 w-5" aria-hidden="true" />
                        </div>
                        <AutoComplete
                          id="fee-firm"
                          v-model="selectedFirm"
                          :pt="ptAutoCompleteInField"
                          input-class="w-full"
                          dropdown
                          force-selection
                          :invalid="showErrorFirm()"
                          :suggestions="filteredFirms"
                          option-label="name"
                          placeholder="Wybierz firmę"
                          :loading="firmStore.loadingFirms"
                          @complete="searchFirm"
                        />
                      </div>
                      <OfficeIconButton
                        title="Dodaj firmę"
                        :icon="firmStore.loadingFirms ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                        class="text-orange-500"
                        @click="showNewFirmModal = true"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorFirm() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-number">Numer umowy</label>
                    <InputText
                      id="fee-number"
                      v-model="fee.feeNumber"
                      maxlength="50"
                      :pt="ptFieldInputText"
                      :class="{ 'p-invalid': showErrorNumber() }"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorNumber() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-date">Z datą</label>
                    <DatePicker
                      id="fee-date"
                      v-model="fee.date"
                      :pt="ptDatePickerField"
                      show-icon
                      date-format="yy-mm-dd"
                      :invalid="showErrorDate()"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorDate() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <CalculatorIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Szczegóły płatności</span>
              </h2>
              <div class="flex flex-col gap-5">
                <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-frequency"
                      >Częstotliwość opłat</label
                    >
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorFeeFrequency() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <CreditCardIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Select
                        id="fee-frequency"
                        v-model="selectedFeeFrequency"
                        :pt="ptSelectInField"
                        :options="feeStore.feeFrequencyTypes"
                        option-label="viewName"
                        placeholder="Wybierz..."
                        :disabled="isEdit"
                        :loading="feeStore.loadingFeeFrequencyType"
                        @change="fee.feeFrequency = selectedFeeFrequency ? selectedFeeFrequency : null"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorFeeFrequency() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-count">Ilość opłat</label>
                    <InputNumber
                      id="fee-count"
                      v-model="fee.numberOfPayments"
                      :pt="ptFieldInputText"
                      mode="decimal"
                      show-buttons
                      :min="1"
                      :max="84"
                      :disabled="isEdit"
                    />
                    <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-amount">Kwota opłaty</label>
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorAmount() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <BanknotesIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <InputNumber
                        id="fee-amount"
                        v-model="fee.amount"
                        :pt="ptInputNumberAmount"
                        input-class="w-full"
                        :invalid="showErrorAmount()"
                        :min-fraction-digits="2"
                        :max-fraction-digits="2"
                        :disabled="isEdit"
                        mode="currency"
                        currency="PLN"
                        locale="pl-PL"
                        @focus="UtilsService.selectText"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorAmount() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-account">Nr konta</label>
                    <InputMask
                      id="fee-account"
                      v-model="fee.accountNumber"
                      :pt="ptInputMaskField"
                      :class="{ 'p-invalid': showErrorAccountNumber() }"
                      mask="99 9999 9999 9999 9999 9999 9999"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorAccountNumber() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="fee-first-date"
                      >Data pierwszej raty</label
                    >
                    <DatePicker
                      id="fee-first-date"
                      v-model="fee.firstPaymentDate"
                      :pt="ptDatePickerField"
                      :invalid="showErrorFirstDate()"
                      show-icon
                      date-format="yy-mm-dd"
                      :disabled="isEdit"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorFirstDate() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <DocumentTextIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Dodatkowe informacje</span>
              </h2>
              <Textarea id="fee-other-info" v-model="fee.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :loading="btnShowBusy"
              :btn-disabled="isSaveBtnDisabled"
            />
          </div>
        </div>
      </form>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
