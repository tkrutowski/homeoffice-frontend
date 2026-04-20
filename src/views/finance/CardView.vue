<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { onMounted, ref } from 'vue';
  import { useCardsStore } from '@/stores/cards';
  import { useBanksStore } from '@/stores/banks';
  import { useUsersStore } from '@/stores/users';
  import { useToast } from 'primevue/usetoast';
  import OfficeButton from '@/components/OfficeButton.vue';
  import router from '@/router';
  import IconButton from '@/components/OfficeIconButton.vue';
  import type { User } from '@/types/User';
  import type { Bank, Card } from '@/types/Bank';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';
  import {
    CalendarDaysIcon,
    InformationCircleIcon,
    CreditCardIcon,
    UserIcon,
    BuildingLibraryIcon,
    DocumentTextIcon,
    PhotoIcon,
  } from '@heroicons/vue/24/outline';

  const route = useRoute();
  const cardStore = useCardsStore();
  const bankStore = useBanksStore();
  const userStore = useUsersStore();
  const toast = useToast();

  const card = ref<Card>({
    id: 0,
    idBank: 0,
    idUser: 0,
    name: '',
    activationDate: null,
    limit: 0,
    repaymentDay: 1,
    expirationDate: null,
    otherInfo: '',
    activeStatus: 'ACTIVE',
    cardNumber: '',
    closingDay: 1,
    imageUrl: '',
    multi: false,
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const selectedUser = ref<User | null>(null);

  function onUserChange() {
    if (selectedUser.value) {
      card.value.idUser = selectedUser.value?.id;
    }
  }

  const selectedBank = ref<Bank | null>(null);

  function onBankChange() {
    if (selectedBank.value) {
      card.value.idBank = selectedBank.value?.id;
    }
  }

  //
  //SAVE
  //
  function saveCard() {
    submitted.value = true;
    if (isEdit.value) {
      editCard();
    } else {
      newCard();
    }
  }

  //
  //---------------------------------------------------------NEW CARD----------------------------------------------
  //
  async function newCard() {
    console.log('newCard()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      cardStore
        .addCardDb(card.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano kartę: ' + card.value?.name,
            life: 3000,
          });
          btnShowBusy.value = false;
          setTimeout(() => {
            resetForm();
          }, 1000);
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason);
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Karta o tej nazwię już istnieje w bazie danych.',
              life: 3000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Błąd podczas dodawania książki.',
              life: 3000,
            });
          }
        });

      btnSaveDisabled.value = false;
      btnShowBusy.value = false;
      submitted.value = false;
    }
  }

  //
  //-----------------------------------------------------EDIT CARD------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editCard() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      console.log('editCard()');
      await cardStore
        .updateCardDb(card.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano kartę: ' + card.value?.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: 'Cards' });
          }, 3000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Błąd podczas edycji karty.',
            life: 3000,
          });
          btnSaveDisabled.value = false;
        });
    }
  }

  //---------------------------------------------MOUNTED--------------------------------------------
  onMounted(async () => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    if (userStore.users.length === 0) await userStore.getUsersFromDb();
    if (bankStore.banks.length === 0) await bankStore.getBanksFromDb();
    isEdit.value = route.params.isEdit === 'true';
    const cardId = Number(route.params.cardId as string);
    if (!isEdit.value && cardId === 0) {
      console.log('onMounted NEW CARD');
    } else {
      console.log('onMounted EDIT CARD');
      cardStore
        .getCardFromDb(cardId)
        .then((data: Card | null) => {
          if (data) {
            card.value = data;
            selectedUser.value = userStore.getUser(card.value.idUser);
            selectedBank.value = bankStore.getBank(card.value.idBank);
            // activationDate.value = card.value.activationDate
            // expirationDate.value = card.value.expirationDate
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania kart:', error);
        });
    }
    btnSaveDisabled.value = false;
  });

  function resetForm() {
    card.value = {
      id: 0,
      idBank: 0,
      idUser: 0,
      name: '',
      activationDate: null,
      limit: 0,
      repaymentDay: 1,
      expirationDate: null,
      otherInfo: '',
      activeStatus: 'ACTIVE',
      cardNumber: '',
      closingDay: 1,
      imageUrl: '',
      multi: false,
    };
    selectedBank.value = null;
    selectedUser.value = null;
    submitted.value = false;
    btnSaveDisabled.value = false;
  }

  //
  //------------------------------------------------ERROR----------------------------------------------------------
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
  const isNotValid = () => {
    return (
      showErrorName() ||
      showErrorNumber() ||
      showErrorLimit() ||
      showErrorUser() ||
      showErrorBank() ||
      showErrorExpirationDate() ||
      showErrorActivationDate()
    );
  };
  const showErrorName = () => {
    return submitted.value && card.value.name.length === 0;
  };
  const showErrorNumber = () => {
    return submitted.value && card.value.cardNumber.length === 0;
  };
  const showErrorLimit = () => {
    return submitted.value && card.value.limit == 0;
  };
  const showErrorUser = () => {
    return submitted.value && card.value.idUser <= 0;
  };
  const showErrorBank = () => {
    return submitted.value && card.value.idBank <= 0;
  };
  const showErrorExpirationDate = () => {
    return submitted.value && !card.value.expirationDate;
  };
  const showErrorActivationDate = () => {
    return submitted.value && !card.value.activationDate;
  };

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
      <form class="mx-auto max-w-4xl" @submit.stop.prevent="saveCard">
        <div
          class="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900 dark:shadow-none sm:p-8"
        >
          <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1
              class="min-w-0 flex-1 text-left text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl"
            >
              {{ isEdit ? `Edycja karty: ${card?.name}` : 'Nowa karta' }}
            </h1>
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <IconButton
                title="Powrót do listy kart"
                class="text-orange-500"
                @click="() => router.push({ name: 'Cards' })"
              >
                <template #icon>
                  <CalendarDaysIcon aria-hidden="true" />
                </template>
              </IconButton>
            </div>
          </div>

          <div class="flex flex-col gap-6">
            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-950 sm:p-5"
            >
              <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                <InformationCircleIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                <span>Informacje ogólne</span>
              </h2>
              <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div
                  class="order-1 flex min-h-[9rem] items-center justify-center rounded-lg border border-surface-300 bg-surface-0 p-3 dark:border-surface-600 dark:bg-surface-900 lg:order-none"
                >
                  <img
                    v-if="card.imageUrl.length > 0"
                    :src="card.imageUrl"
                    class="max-h-32 w-auto rounded-md object-contain"
                    alt="Karta"
                  />
                  <img
                    v-else
                    src="@/assets/images/no_card.png"
                    class="max-h-32 w-auto rounded-md object-contain"
                    alt="Karta"
                  />
                </div>

                <div class="lg:col-span-2">
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-col gap-2">
                      <label class="text-sm text-surface-600 dark:text-surface-400" for="card-name">Nazwa</label>
                      <InputText
                        id="card-name"
                        v-model="card.name"
                        maxlength="200"
                        :pt="ptFieldInputText"
                        :class="{ 'p-invalid': showErrorName() }"
                      />
                      <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                        showErrorName() ? 'Pole jest wymagane.' : '\u00a0'
                      }}</small>
                    </div>

                    <div class="grid grid-cols-1 gap-3">
                      <div class="flex flex-col gap-2">
                        <label class="text-sm text-surface-600 dark:text-surface-400" for="card-number">Nr karty</label>
                        <InputText
                          id="card-number"
                          v-model="card.cardNumber"
                          maxlength="20"
                          :pt="ptFieldInputText"
                          :class="{ 'p-invalid': showErrorNumber() }"
                        />
                        <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                          showErrorNumber() ? 'Pole jest wymagane.' : '\u00a0'
                        }}</small>
                      </div>
                      <div class="flex flex-col gap-2">
                        <label class="text-sm text-surface-600 dark:text-surface-400" for="card-image-url"
                          >URL zdjęcia</label
                        >
                        <div
                          class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                        >
                          <div
                            class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                          >
                            <PhotoIcon class="h-5 w-5" aria-hidden="true" />
                          </div>
                          <InputText id="card-image-url" v-model="card.imageUrl" :pt="ptInputNumberAmount" />
                        </div>
                        <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-950 sm:p-5"
            >
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
                  <CreditCardIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
                  <span>Parametry karty</span>
                </h2>
                <div
                  class="flex items-center gap-2 rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 dark:border-surface-600 dark:bg-surface-900"
                >
                  <Checkbox
                    v-model="card.multi"
                    inputId="multiCheckbox"
                    :binary="true"
                    title="Karta może być wybrana przez innego użytkownika."
                  />
                  <label
                    class="text-sm text-surface-700 dark:text-surface-300"
                    for="multiCheckbox"
                    title="Karta może być wybrana przez innego użytkownika."
                  >
                    Multi
                  </label>
                </div>
              </div>
              <div class="flex flex-col gap-5">
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <div class="flex min-w-0 flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-limit"
                      >Limit na karcie</label
                    >
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorLimit() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <CreditCardIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <InputNumber
                        id="card-limit"
                        v-model="card.limit"
                        :pt="ptInputNumberAmount"
                        input-class="w-full"
                        mode="currency"
                        currency="PLN"
                        locale="pl-PL"
                        :invalid="showErrorLimit()"
                        @focus="UtilsService.selectText"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorLimit() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex min-w-0 flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-closing-day"
                      >Dzień zamknięcia</label
                    >
                    <InputNumber
                      id="card-closing-day"
                      v-model="card.closingDay"
                      :pt="ptFieldInputText"
                      mode="decimal"
                      show-buttons
                      :min="1"
                      :max="28"
                    />
                    <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                  </div>

                  <div class="flex min-w-0 flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-repayment-day"
                      >Dzień spłaty</label
                    >
                    <InputNumber
                      id="card-repayment-day"
                      v-model="card.repaymentDay"
                      :pt="ptFieldInputText"
                      mode="decimal"
                      show-buttons
                      :min="1"
                      :max="28"
                    />
                    <small class="min-h-[1.25rem] text-sm text-surface-500 dark:text-surface-400">&nbsp;</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-user"
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
                        id="card-user"
                        v-model="selectedUser"
                        :pt="ptSelectInField"
                        :options="userStore.getUsers"
                        :option-label="data => data.firstName + ' ' + data.lastName"
                        placeholder="Wybierz użytkownika"
                        :loading="userStore.loadingUsers"
                        @change="onUserChange"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorUser() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-bank">Wybierz bank</label>
                    <div
                      class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
                      :class="{ 'border-red-500 dark:border-red-400': showErrorBank() }"
                    >
                      <div
                        class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                      >
                        <BuildingLibraryIcon class="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Select
                        id="card-bank"
                        v-model="selectedBank"
                        :pt="ptSelectInField"
                        :options="bankStore.getSortedBanks"
                        option-label="name"
                        placeholder="Wybierz bank"
                        :loading="bankStore.loadingBanks"
                        @change="onBankChange"
                      />
                    </div>
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorBank() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-activation-date"
                      >Data aktywacji</label
                    >
                    <DatePicker
                      id="card-activation-date"
                      v-model="card.activationDate"
                      :pt="ptDatePickerField"
                      show-icon
                      date-format="yy-mm-dd"
                      :invalid="showErrorActivationDate()"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorActivationDate() ? 'Pole jest wymagane.' : '\u00a0'
                    }}</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm text-surface-600 dark:text-surface-400" for="card-expiration-date"
                      >Data ważności</label
                    >
                    <DatePicker
                      id="card-expiration-date"
                      v-model="card.expirationDate"
                      :pt="ptDatePickerField"
                      show-icon
                      date-format="yy-mm-dd"
                      :invalid="showErrorExpirationDate()"
                    />
                    <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
                      showErrorExpirationDate() ? 'Pole jest wymagane.' : '\u00a0'
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
              <Textarea id="card-other-info" v-model="card.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
            </div>
          </div>

          <div class="mt-8 flex flex-row justify-end gap-2">
            <OfficeButton
              v-if="!isEdit"
              text="Reset"
              type="button"
              btn-type="office-regular"
              :btn-disabled="btnSaveDisabled"
              @click="resetForm()"
            />
            <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :loading="btnShowBusy"
              :btn-disabled="btnSaveDisabled"
            />
          </div>
        </div>
      </form>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
