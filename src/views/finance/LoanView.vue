<script setup lang="ts">
  import { useLoansStore } from '@/stores/loans';
  import { useBanksStore } from '@/stores/banks';
  import { useUsersStore } from '@/stores/users';
  import { useRoute } from 'vue-router';
  import { computed, onMounted, ref } from 'vue';
  import type { Loan } from '@/types/Loan';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useToast } from 'primevue/usetoast';
  import router from '@/router';
  import type { Bank } from '@/types/Bank';
  import type { User } from '@/types/User';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';
  import AddBankDialog from '@/components/finance/AddBankDialog.vue';
  import {
    UserIcon,
    BuildingLibraryIcon,
    CalendarDaysIcon,
    BanknotesIcon,
    CreditCardIcon,
    InformationCircleIcon,
    CalculatorIcon,
    DocumentTextIcon,
  } from '@heroicons/vue/24/outline';

  const userStore = useUsersStore();
  const loanStore = useLoansStore();
  const bankStore = useBanksStore();
  const route = useRoute();

  const toast = useToast();
  const selectedUser = ref<User | null>();
  const selectedBank = ref<Bank | null>();

  const loan = ref<Loan>({
    id: 0,
    bank: null,
    idUser: 0,
    name: '',
    amount: 0,
    date: null,
    loanNumber: '',
    accountNumber: '',
    firstPaymentDate: null,
    numberOfInstallments: 1,
    installmentAmount: 0,
    loanStatus: PaymentStatus.TO_PAY,
    loanCost: 0,
    otherInfo: '',
    installmentList: [],
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return (
      loanStore.loadingPaymentType ||
      loanStore.loadingLoans ||
      userStore.loadingUsers ||
      bankStore.loadingBanks ||
      btnSaveDisabled.value
    );
  });
  //
  //------------------------------------------------------SAVE-----------------------------------------
  //
  function saveLoan() {
    submitted.value = true;
    if (isEdit.value) {
      editLoan();
    } else {
      newLoan();
    }
  }

  //
  //---------------------------------------------------------NEW LOAN----------------------------------------------
  //
  async function newLoan() {
    console.log('newLoan()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      loanStore
        .addLoanDb(loan.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano kredyt: ' + loan.value?.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Loans' });
          }, 3000);
        })
        .catch(() => {
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Błąd podczas zapisywania kredytu',
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
  //-----------------------------------------------------EDIT LOAN------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  function editLoan() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      console.log('editLoan()');
      loanStore
        .updateLoanDb(loan.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano kredyt: ' + loan.value?.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Loans' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji kredytu: ' + loan.value?.name,
            life: 3000,
          });
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
        });
    }
  }

  //---------------------------------------MOUNTED------------------------------------------------
  onMounted(() => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    if (userStore.users.length === 0) userStore.getUsersFromDb();
    if (bankStore.banks.length === 0) bankStore.getBanksFromDb();
    btnSaveDisabled.value = false;
    console.log('loanStore.loans.length', loanStore.loans.length);
    loanStore.getLoans('ALL');
  });

  onMounted(async () => {
    // console.log("onMounted EDIT", route.params);
    btnSaveDisabled.value = true;
    isEdit.value = route.params.isEdit === 'true';
    if (isEdit.value === false) {
      console.log('onMounted NEW LOAN');
      // invoiceDateTemp.value = loan.value.invoiceDate;
      // sellDateTemp.value = loan.value.sellDate;
    } else {
      console.log('onMounted EDIT LOAN');
      const loanId = Number(route.params.loanId as string);
      loanStore
        .getLoanFromDb(loanId)
        .then((data: Loan | null) => {
          if (data) {
            loan.value = data;
            selectedBank.value = loan.value.bank;
            selectedUser.value = userStore.getUser(loan.value.idUser);
            // loanDateTemp.value = loan.value.date
            // firstPaymentDateTemp.value = loan.value.firstPaymentDate
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania kredytu:', error);
        });
    }
    btnSaveDisabled.value = false;
  });

  //
  //------------------------------------------ERROR
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
      showErrorBank() ||
      showErrorNumber() ||
      showErrorAmount() ||
      showErrorAccountNumber() ||
      showErrorInstallmentAmount() ||
      showErrorFirstDate() ||
      showErrorDate()
    );
  };
  const showErrorName = () => {
    return submitted.value && loan.value.name.length === 0;
  };
  const showErrorUser = () => {
    return submitted.value && loan.value.idUser === 0;
  };
  const showErrorBank = () => {
    return submitted.value && !loan.value.bank;
  };
  const showErrorNumber = () => {
    return submitted.value && loan.value.loanNumber.length === 0;
  };
  const showErrorAmount = () => {
    return submitted.value && loan.value.amount <= 0;
  };
  const showErrorInstallmentAmount = () => {
    return submitted.value && loan.value.installmentAmount <= 0;
  };
  const showErrorAccountNumber = () => {
    //todo zrobić regex
    return submitted.value && loan.value.accountNumber.length === 0;
  };
  const showErrorDate = () => {
    return submitted.value && !loan.value.date;
  };
  const showErrorFirstDate = () => {
    return submitted.value && !loan.value.firstPaymentDate;
  };

  //
  //----------------------------------------------NEW BANK-------------------------------
  //
  const showNewBankModal = ref<boolean>(false);

  async function newBank(bank: Bank) {
    showNewBankModal.value = false;
    await bankStore
      .addBankDb(bank)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano bank: ' + bank.name,
          life: 3000,
        });
      })
      .catch((reason: AxiosError) => {
        console.error(reason);
        toast.add({
          severity: 'error',
          summary: 'Błąd podczas dodawania banku.',
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
      class: 'shrink-0 border-0 bg-transparent px-3 text-surface-500 dark:text-surface-400',
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
  <AddBankDialog v-model:visible="showNewBankModal" @save="newBank" @cancel="showNewBankModal = false" />

  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <form class="mx-auto max-w-4xl" @submit.stop.prevent="saveLoan">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{ isEdit ? `Edycja kredytu: ${loan?.name}` : 'Nowy kredyt' }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <OfficeIconButton
                title="Powrót do listy kredytów"
                class="text-orange-500"
                @click="() => router.push({ name: 'Loans' })"
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
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-name">Nazwa</label>
                  <InputText
                    id="loan-name"
                    v-model="loan.name"
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
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-user"
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
                        id="loan-user"
                        v-model="selectedUser"
                        :pt="ptSelectInField"
                        :options="userStore.users"
                        :option-label="user => user.firstName + ' ' + user.lastName"
                        placeholder="Wybierz użytkownika"
                        :loading="userStore.loadingUsers"
                        @change="loan.idUser = selectedUser ? selectedUser.id : 0"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorUser() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-bank">Wybierz bank</label>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      <div
                        class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                        :class="{ 'border-red-500 dark:border-red-400': showErrorBank() }"
                      >
                        <div
                          class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                        >
                          <BuildingLibraryIcon class="h-5 w-5" aria-hidden="true" />
                        </div>
                        <Select
                          id="loan-bank"
                          v-model="selectedBank"
                          :pt="ptSelectInField"
                          :options="bankStore.banks"
                          option-label="name"
                          placeholder="Wybierz bank"
                          :loading="bankStore.loadingBanks"
                          @change="loan.bank = selectedBank ? selectedBank : null"
                        />
                      </div>
                      <OfficeIconButton
                        title="Dodaj bank"
                        :icon="bankStore.loadingBanks ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                        class="text-orange-500"
                        @click="showNewBankModal = true"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorBank() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-number"
                      >Numer kredytu</label
                    >
                    <InputText
                      id="loan-number"
                      v-model="loan.loanNumber"
                      maxlength="50"
                      :pt="ptFieldInputText"
                      :class="{ 'p-invalid': showErrorNumber() }"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorNumber() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-date">Z dnia</label>
                    <DatePicker
                      id="loan-date"
                      v-model="loan.date"
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
                <span>Szczegóły kredytu</span>
              </h2>
              <div class="flex flex-col gap-5">
                <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-amount"
                      >Kwota kredytu</label
                    >
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
                        id="loan-amount"
                        v-model="loan.amount"
                        :pt="ptInputNumberAmount"
                        input-class="w-full"
                        :invalid="showErrorAmount()"
                        :min-fraction-digits="2"
                        :max-fraction-digits="2"
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

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-cost">Koszt kredytu</label>
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <CreditCardIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <InputNumber
                        id="loan-cost"
                        v-model="loan.loanCost"
                        :pt="ptInputNumberAmount"
                        input-class="w-full"
                        :min-fraction-digits="2"
                        :max-fraction-digits="2"
                        mode="currency"
                        currency="PLN"
                        locale="pl-PL"
                        @focus="UtilsService.selectText"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-installments"
                      >Ilość rat</label
                    >
                    <InputNumber
                      id="loan-installments"
                      v-model="loan.numberOfInstallments"
                      :pt="ptFieldInputText"
                      mode="decimal"
                      show-buttons
                      :min="1"
                      :max="84"
                      :disabled="isEdit"
                    />
                    <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-installment-amount"
                      >Kwota raty</label
                    >
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorInstallmentAmount() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <BanknotesIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <InputNumber
                        id="loan-installment-amount"
                        v-model="loan.installmentAmount"
                        :pt="ptInputNumberAmount"
                        input-class="w-full"
                        :invalid="showErrorInstallmentAmount()"
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
                      showErrorInstallmentAmount() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-first-date"
                      >Data pierwszej raty</label
                    >
                    <DatePicker
                      id="loan-first-date"
                      v-model="loan.firstPaymentDate"
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

                <div class="flex flex-col gap-2">
                  <label class="text-sm text-surface-600 dark:text-surface-400" for="loan-account">Nr konta</label>
                  <InputMask
                    id="loan-account"
                    v-model="loan.accountNumber"
                    :pt="ptInputMaskField"
                    :class="{ 'p-invalid': showErrorAccountNumber() }"
                    mask="99 9999 9999 9999 9999 9999 9999"
                  />
                  <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                    showErrorAccountNumber() ? 'Pole jest wymagane.' : '\u00a0'
                  }}</small>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <DocumentTextIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Dodatkowe informacje</span>
              </h2>
              <Textarea id="loan-other-info" v-model="loan.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
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
