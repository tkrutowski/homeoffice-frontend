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
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';
  import AddFirmDialog from '@/components/share/AddFirmDialog.vue';

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
    if (feeStore.fees.length === 0) feeStore.getFeesFromDb('ALL', true);
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
</script>

<template>
  <TheMenuFinance />
  <AddFirmDialog v-model:visible="showNewFirmModal" @save="newFirm" @cancel="showNewFirmModal = false" />
  <div class="m-4 max-w-4xl mx-auto">
    <form @submit.stop.prevent="saveFee" class="w-full">
      <Panel>
        <template #header>
          <OfficeIconButton
            title="Powrót do listy opłat"
            icon="pi pi-fw pi-list"
            @click="() => router.push({ name: 'Fees' })"
          />
          <div class="w-full flex justify-center">
            <span class="text-3xl">
              {{
                isEdit ? `Edycja opłaty: ${fee?.name}` : route.query.copyFromId ? 'Nowa opłata (kopia)' : 'Nowa opłata'
              }}
            </span>
          </div>
        </template>
        <div class="flex flex-col">
          <!-- ROW-1   NAME -->
          <div class="flex flex-col">
            <label for="name">Nazwa</label>
            <InputText id="name" v-model="fee.name" maxlength="50" :invalid="showErrorName()" />
            <small class="text-red-500">{{ showErrorName() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
          </div>

          <!-- ROW-2   USER -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz użytkownika:</label>
              <Select
                id="input-customer"
                v-model="selectedUser"
                :invalid="showErrorUser()"
                :options="userStore.users"
                :option-label="user => user.firstName + ' ' + user.lastName"
                :onchange="fee.idUser = selectedUser ? selectedUser.id : 0"
                :loading="userStore.loadingUsers"
                required
              />
              <small class="text-red-500">{{ showErrorUser() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
          </div>

          <!-- ROW-3   FIRM -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz firmę:</label>
              <AutoComplete
                id="input-customer"
                v-model="selectedFirm"
                dropdown
                force-selection
                :invalid="showErrorFirm()"
                :suggestions="filteredFirms"
                option-label="name"
                :loading="firmStore.loadingFirms"
                @complete="searchFirm"
              />
              <small class="text-red-500">
                {{ showErrorFirm() ? 'Pole jest wymagane.' : '&nbsp;' }}
              </small>
            </div>
            <OfficeIconButton
              title="Dodaj firmę"
              :icon="firmStore.loadingFirms ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
              style="height: 35px; width: 35px; padding: 0"
              class="mt-1 self-center"
              @click="showNewFirmModal = true"
            />
          </div>

          <!-- ROW-4  NUMBER / DATE  -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="number">Numer umowy:</label>
              <InputText id="number" v-model="fee.feeNumber" :invalid="showErrorNumber()" maxlength="50" />
              <small class="text-red-500">{{ showErrorNumber() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="date">Z data:</label>
              <DatePicker
                id="date"
                v-model="fee.date"
                show-icon
                date-format="yy-mm-dd"
                :class="{ 'p-invalid': showErrorDate() }"
              />
              <small class="text-red-500">{{ showErrorDate() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
          </div>

          <!-- ROW-5   FEE_FREQUENCY -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Częstotliwość opłat:</label>
              <Select
                id="input-customer"
                v-model="selectedFeeFrequency"
                :invalid="showErrorFeeFrequency()"
                :options="feeStore.feeFrequencyTypes"
                option-label="viewName"
                :onchange="fee.feeFrequency = selectedFeeFrequency ? selectedFeeFrequency : null"
                :disabled="isEdit"
                :loading="feeStore.loadingFeeFrequencyType"
              />
              <small class="text-red-500">{{ showErrorFeeFrequency() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="noOfPayment">Ilość opłat:</label>
              <InputNumber
                id="noOfPayment"
                v-model="fee.numberOfPayments"
                mode="decimal"
                show-buttons
                :min="1"
                :max="84"
                :disabled="isEdit"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="amount">Kwota opłaty:</label>
              <InputNumber
                id="amount"
                v-model="fee.amount"
                :invalid="showErrorAmount()"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                :disabled="isEdit"
                mode="currency"
                currency="PLN"
                locale="pl-PL"
                @focus="UtilsService.selectText"
              />
              <small class="text-red-500">{{ showErrorAmount() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
          </div>
          <!-- ROW-6  ACCOUNT NR / FIRST PAYMENT DATE  -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="accountNo">Nr konta:</label>
              <InputMask
                id="accountNo"
                v-model="fee.accountNumber"
                :invalid="showErrorAccountNumber()"
                mask="99 9999 9999 9999 9999 9999 9999"
              />
              <small class="text-red-500">{{ showErrorAccountNumber() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="first">Data pierwszej raty:</label>
              <DatePicker
                id="first"
                v-model="fee.firstPaymentDate"
                :invalid="showErrorFirstDate()"
                show-icon
                date-format="yy-mm-dd"
                :disabled="isEdit"
              />
              <small class="text-red-500">{{ showErrorFirstDate() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
            </div>
          </div>

          <!-- ROW-7  OTHER INFO  -->
          <div class="flex flex-col w-full">
            <label for="input">Dodatkowe informacje:</label>
            <Textarea v-model="fee.otherInfo" rows="5" cols="30" />
          </div>
        </div>

        <!-- ROW-6  BTN SAVE -->
        <div class="flex mt-5 justify-end">
          <OfficeButton
            text="zapisz"
            btn-type="office-save"
            type="submit"
            :loading="btnShowBusy"
            :btn-disabled="isSaveBtnDisabled"
          />
        </div>
      </Panel>
    </form>
  </div>
</template>

<style scoped></style>
