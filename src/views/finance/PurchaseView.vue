<script setup lang="ts">
  import OfficeButton from '@/components/OfficeButton.vue';
  import type { User } from '@/types/User';
  import { computed, onMounted, ref, watch } from 'vue';
  import moment, { type Moment } from 'moment';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import type { Firm } from '@/types/Firm';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import type { Purchase } from '@//types/Purchase';
  import type { Card } from '@/types/Bank';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';

  import { useUsersStore } from '@/stores/users';
  import { useRoute } from 'vue-router';
  import { useFirmsStore } from '@/stores/firms';
  import { usePurchasesStore } from '@/stores/purchases';
  import { useCardsStore } from '@/stores/cards';
  import { PaymentStatus } from '@/types/Payment.ts';
  import AddFirmDialog from '@/components/share/AddFirmDialog.vue';
  import {
    UserIcon,
    CreditCardIcon,
    BuildingOffice2Icon,
    BanknotesIcon,
    CalendarDaysIcon,
    TableCellsIcon,
  } from '@heroicons/vue/24/outline';

  const userStore = useUsersStore();
  const purchaseStore = usePurchasesStore();
  const firmStore = useFirmsStore();
  const route = useRoute();
  const cardStore = useCardsStore();

  const toast = useToast();
  const selectedUser = ref<User | null>(null);
  const selectedFirm = ref<Firm | null>(null);
  const selectedCard = ref<Card | null>(null);
  const optionCard = ref<Card[]>();

  const purchase = ref<Purchase>({
    id: 0,
    idCard: 0,
    idFirm: 0,
    idUser: 0,
    name: '',
    purchaseDate: null,
    amount: 0,
    paymentDeadline: null,
    paymentDate: null,
    paymentStatus: PaymentStatus.TO_PAY,
    installment: false,
    otherInfo: '',
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return cardStore.loadingCards || userStore.loadingUsers || firmStore.loadingFirms || btnSaveDisabled.value;
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
    if (newFirm) purchase.value.idFirm = newFirm.id;
    else purchase.value.idFirm = 0;
  });

  //
  //CARD
  //
  watch(selectedUser, () => {
    console.log('WATCH user, ', selectedUser.value);
    if (selectedUser.value && selectedUser.value?.id > 0) {
      if (isEdit.value) optionCard.value = cardStore.getCardByUser(selectedUser.value?.id);
      else optionCard.value = cardStore.getCardByUserAndStatus(selectedUser.value?.id, 'ACTIVE');
    }
  });

  const isCalculatePossible = (): boolean => {
    return (
      selectedUser.value !== null &&
      selectedUser.value?.id > 0 &&
      selectedCard.value !== null &&
      selectedCard.value?.id > 0 &&
      purchase.value.purchaseDate !== null
    );
  };
  //purchase.value.purchaseDate doesn't work, another watch added
  watch(
    [selectedCard, selectedUser, purchase.value.purchaseDate],
    () => {
      if (isCalculatePossible() && selectedCard.value && purchase.value.purchaseDate) {
        calculateDeadline(selectedCard.value, purchase.value.purchaseDate);
      }
    }
    // , { deep: true }
  );

  watch(
    () => purchase.value.purchaseDate,
    () => {
      if (isCalculatePossible() && selectedCard.value && purchase.value.purchaseDate) {
        calculateDeadline(selectedCard.value, purchase.value?.purchaseDate);
      }
    }
  );

  function calculateDeadline(card: Card, date: Date) {
    console.log('Calculating deadline...');
    const purchaseDate: Moment = moment(date);

    // Ustawienie początkowej daty płatności na następny miesiąc
    let deadlineDate: Moment = purchaseDate.add(1, 'months');

    // Jeśli dzień zakupu jest większy niż dzień zamknięcia karty, przesuń o kolejny miesiąc
    if (purchaseDate.date() > card.closingDay) {
      deadlineDate = deadlineDate.add(1, 'months');
    }

    // Ustawienie dnia płatności karty
    deadlineDate = deadlineDate.date(card.repaymentDay);

    // Jeśli przekroczyliśmy koniec roku, ustawienie odpowiedniego roku
    if (deadlineDate.month() === 0 && purchaseDate.month() === 11) {
      deadlineDate = deadlineDate.add(1, 'year');
    }

    // Formatowanie i zapisywanie daty płatności
    purchase.value.paymentDeadline = deadlineDate.toDate();
  }

  //
  //SAVE
  //
  /** Po zapisie: cofnięcie w historii, albo tablica finansów przy braku sensownego „wstecz”. */
  function closePurchaseFormAfterSave() {
    const state = window.history.state as { back?: string | null } | undefined;
    const hasInAppBack = typeof state?.back === 'string' && state.back.length > 0;
    if (hasInAppBack) {
      router.back();
      return;
    }
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push({ name: 'FinanceHome' });
  }

  function savePurchase() {
    submitted.value = true;
    if (isEdit.value) {
      editPurchase();
    } else {
      newPurchase();
    }
  }

  //
  //---------------------------------------------------------NEW PURCHASE----------------------------------------------
  //
  async function newPurchase() {
    console.log('newPurchase()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      // btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      await purchaseStore
        .addPurchaseDb(purchase.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano zakup: ' + purchase.value?.name,
            life: 3000,
          });
          btnShowBusy.value = false;
          setTimeout(() => {
            closePurchaseFormAfterSave();
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          btnShowBusy.value = false;
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas zapisywania zakupu: ' + purchase.value?.name,
            life: 3000,
          });
        });
    }
  }

  //
  //-----------------------------------------------------EDIT PURCHASE------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editPurchase() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      console.log('editPurchase()');
      await purchaseStore
        .updatePurchaseDb(purchase.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaktualizowano zakup: ' + purchase.value?.name,
            life: 3000,
          });
          btnShowBusy.value = false;
          btnSaveDisabled.value = false;
          setTimeout(() => {
            closePurchaseFormAfterSave();
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          btnShowBusy.value = false;
          btnSaveDisabled.value = false;
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji zakupu: ' + purchase.value?.name,
            life: 3000,
          });
        });
    }
  }

  //---------------------------------------------MOUNTED--------------------------------------------
  onMounted(() => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    if (userStore.users.length === 0) userStore.getUsersFromDb();
    if (firmStore.firms.length === 0) firmStore.getFirmsFromDb();
    cardStore.getCardsFromDb('ALL');
    btnSaveDisabled.value = false;
  });

  onMounted(async () => {
    // console.log("onMounted EDIT", route.params);
    btnSaveDisabled.value = true;
    // if (userStore.users.length === 0) await userStore.getUsersFromDb();
    // if (firmStore.banks.length === 0) await firmStore.getFirmsFromDb();
    isEdit.value = route.params.isEdit === 'true';
    if (isEdit.value === false) {
      console.log('onMounted NEW PURCHASE');
    } else {
      console.log('onMounted EDIT PURCHASE');
      const purchaseId = Number(route.params.purchaseId as string);
      purchaseStore
        .getPurchaseFromDb(purchaseId)
        .then((data: Purchase | null) => {
          if (data) {
            purchase.value = data;
            console.log('onMounted PURCHSE', purchase.value);
            selectedFirm.value = firmStore.getFirm(purchase.value.idFirm);
            selectedCard.value = cardStore.getCard(purchase.value.idCard);
            selectedUser.value = userStore.getUser(purchase.value.idUser);
            // purchaseDateTemp.value = purchase.value.purchaseDate
            // deadlineDateTemp.value = purchase.value.paymentDeadline
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
      showErrorCard() ||
      showErrorAmount() ||
      showErrorDeadline() ||
      showErrorDate()
    );
  };
  const showErrorName = () => {
    return submitted.value && purchase.value.name.length === 0;
  };
  const showErrorUser = () => {
    return submitted.value && purchase.value.idUser === 0;
  };
  const showErrorCard = () => {
    return submitted.value && purchase.value.idCard === 0;
  };
  const showErrorFirm = () => {
    return submitted.value && purchase.value.idFirm === 0;
  };
  const showErrorAmount = () => {
    return submitted.value && purchase.value.amount <= 0;
  };
  const showErrorDate = () => {
    return submitted.value && !purchase.value.purchaseDate;
  };
  const showErrorDeadline = () => {
    return submitted.value && !purchase.value.paymentDeadline;
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

  /** Pass-through PrimeVue — tokeny surface + tryb ciemny (bez :deep / @apply). */
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
      class: 'flex-1 rounded-none border-0  shadow-none',
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
  <TheMenuFinance />
  <AddFirmDialog v-model:visible="showNewFirmModal" @save="newFirm" @cancel="showNewFirmModal = false" />
  <div class="min-h-[calc(100vh-4rem)] bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
    <form class="mx-auto max-w-2xl" @submit.stop.prevent="savePurchase">
      <div
        class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900 dark:shadow-none sm:p-8"
      >
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1
            class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
          >
            {{ isEdit ? `Edycja zakupu: ${purchase?.name}` : 'Nowy zakup' }}
          </h1>
          <div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <OfficeIconButton
              title="Powrót do listy aktualnych zakupów"
              class="text-surface-500 hover:text-orange-500 dark:text-surface-400 dark:hover:text-orange-400"
              @click="() => router.push({ name: 'PurchasesCurrent' })"
            >
              <template #icon>
                <CalendarDaysIcon aria-hidden="true" />
              </template>
            </OfficeIconButton>
            <OfficeIconButton
              title="Powrót do listy wszystkich zakupów"
              class="text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-0"
              @click="() => router.push({ name: 'Purchases' })"
            >
              <template #icon>
                <TableCellsIcon aria-hidden="true" />
              </template>
            </OfficeIconButton>
          </div>
        </div>

        <div class="flex flex-col gap-6">
          <!-- Nazwa -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-name">Nazwa</label>
            <InputText
              id="purchase-name"
              v-model="purchase.name"
              maxlength="50"
              :pt="ptFieldInputText"
              :class="{ 'p-invalid': showErrorName() }"
            />
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
              showErrorName() ? 'Pole jest wymagane.' : '\u00a0'
            }}</small>
          </div>

          <!-- Użytkownik -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-user">Wybierz użytkownika</label>
            <div
              class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
              :class="{ 'border-red-500 dark:border-red-400': showErrorUser() }"
            >
              <div
                class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
              >
                <UserIcon class="h-5 w-5" aria-hidden="true" />
              </div>
              <Select
                id="purchase-user"
                v-model="selectedUser"
                :pt="ptSelectInField"
                :options="userStore.getUserByPrivileges"
                :option-label="user => user.firstName + ' ' + user.lastName"
                placeholder="Wybierz użytkownika"
                :loading="userStore.loadingUsers"
                required
                @change="purchase.idUser = selectedUser ? selectedUser.id : 0"
              />
            </div>
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
              showErrorUser() ? 'Pole jest wymagane.' : '\u00a0'
            }}</small>
          </div>

          <!-- Karta -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-card">Wybierz kartę</label>
            <div
              class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
              :class="{ 'border-red-500 dark:border-red-400': showErrorCard() }"
            >
              <div
                class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
              >
                <CreditCardIcon class="h-5 w-5" aria-hidden="true" />
              </div>
              <Select
                id="purchase-card"
                v-model="selectedCard"
                :pt="ptSelectInField"
                :options="optionCard"
                option-label="name"
                placeholder="Wybierz kartę"
                :loading="cardStore.loadingCards"
                @change="purchase.idCard = selectedCard ? selectedCard.id : 0"
              />
            </div>
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
              showErrorCard() ? 'Pole jest wymagane.' : '\u00a0'
            }}</small>
          </div>

          <!-- Firma -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-firm">Wybierz firmę</label>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div
                class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                :class="{ 'border-red-500 dark:border-red-400': showErrorFirm() }"
              >
                <div
                  class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                >
                  <BuildingOffice2Icon class="h-5 w-5" aria-hidden="true" />
                </div>
                <AutoComplete
                  id="purchase-firm"
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
                class="h-9 w-9 shrink-0 self-start border border-surface-300 bg-surface-50 p-0 text-surface-500 hover:border-primary hover:text-surface-900 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400 dark:hover:text-surface-0 sm:self-center"
                @click="showNewFirmModal = true"
              />
            </div>
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
              {{ showErrorFirm() ? 'Pole jest wymagane.' : '\u00a0' }}
            </small>
          </div>

          <!-- Data zakupu + Kwota -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-date">Data zakupu</label>
              <DatePicker
                id="purchase-date"
                v-model="purchase.purchaseDate"
                :pt="ptDatePickerField"
                show-icon
                date-format="dd.mm.yy"
                :invalid="showErrorDate()"
              />
              <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                showErrorDate() ? 'Pole jest wymagane.' : '\u00a0'
              }}</small>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-amount">Kwota</label>
              <div
                class="purchase-form-amount flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                :class="{ 'border-red-500 dark:border-red-400': showErrorAmount() }"
              >
                <div
                  class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                >
                  <BanknotesIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <InputNumber
                  id="purchase-amount"
                  v-model="purchase.amount"
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

          <!-- Termin spłaty -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-deadline">Termin spłaty</label>
            <DatePicker
              id="purchase-deadline"
              v-model="purchase.paymentDeadline"
              :pt="ptDatePickerField"
              show-icon
              date-format="dd.mm.yy"
              :invalid="showErrorDeadline()"
            />
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
              {{ showErrorDeadline() ? 'Pole jest wymagane.' : '\u00a0' }}
            </small>
          </div>

          <!-- Dodatkowe informacje -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="purchase-other">Dodatkowe informacje</label>
            <Textarea id="purchase-other" v-model="purchase.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
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
</template>
