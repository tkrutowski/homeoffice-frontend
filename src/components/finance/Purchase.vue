<script setup lang="ts">
import { useLoansStore } from "@/stores/loans";
import { useBanksStore } from "@/stores/banks";
import { useUsersStore } from "@/stores/users";
import { useCardsStore } from "@/stores/cards";
import { useFirmsStore } from "@/stores/firms";
import { usePurchasesStore } from "@/stores/purchases";
import { useRoute } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import moment from "moment";
import OfficeButton from "@/components/OfficeButton.vue";
import { useToast } from "primevue/usetoast";
import TheMenu from "@/components/TheMenu.vue";
import router from "@/router";
import { Card } from "@/types/Bank";
import {User} from "@/types/User";
import { Purchase } from "@/types/Purchase";
import {Firm} from "@/types/Firm";

const userStore = useUsersStore();
const loanStore = useLoansStore();
const bankStore = useBanksStore();
const firmStore = useFirmsStore();
const purchaseStore = usePurchasesStore();
const cardStore = useCardsStore();
const route = useRoute();

const toast = useToast();
const selectedUser = ref<User | undefined>();
const selectedCard = ref<Card | undefined>();
const selectedFirm = ref<Firm | undefined>();

const purchase = ref<Purchase>({
  id: 0,
  idCard: 0,
  idFirm: 0,
  idUser: 0,
  name: "",
  purchaseDate: new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split(".")
    .reverse()
    .join("-"),
  amount: 0,
  paymentDeadline: "",
  paymentDate: "",
  otherInfo: "",
  paymentStatus: { name: "TO_PAY", viewName: "Do spłaty" },
  installment: false,
});

const btnShowError = ref<boolean>(false);
const btnShowBusy = ref<boolean>(false);
const btnShowOk = ref<boolean>(false);
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
function createDate(year: number, month: number, day: number) {
  const date = moment().set({ year: year, month: month, date: day });
  console.log("createdDate: ", date);
  return date;
}
const isCardSelected = computed(() => {
  console.log("isCardSelected");
  return purchase.value.idCard > 0;
});
const calculateDeadline = async () => {
  console.log("calculateDeadline: ", moment(purchase.value.purchaseDate));
  const purchaseDate = moment(purchase.value.purchaseDate);
  const card = await cardStore.getCardFromDb(purchase.value.idCard);

  if (card) {
    console.log("!!!!!!  CARD: ", card);
    console.log("!!!!!!  PURCHASE: ", purchase.value);
    console.log("!!!!!!  IF > : ", purchaseDate.date() > card.closingDay);
    console.log("!!!!!!  IF < : ", purchaseDate.date() < card.closingDay);
    if (purchaseDate.date() > card.closingDay) {
      if (purchaseDate.month() === 11) {
        purchase.value.paymentDeadline = createDate(
          purchaseDate.year() + 1,
          1,
          card.repaymentDay
        ).format("YYYY-MM-DD");
      } else if (purchaseDate.month() === 12) {
        purchase.value.paymentDeadline = createDate(
          purchaseDate.year() + 1,
          2,
          card.repaymentDay
        ).format("YYYY-MM-DD");
      } else {
        purchase.value.paymentDeadline = createDate(
          purchaseDate.year(),
          purchaseDate.month() + 2,
          card.repaymentDay
        ).format("YYYY-MM-DD");
      }
    } else if (purchaseDate.date() < card.closingDay) {
      if (purchaseDate.month() === 12)
        purchase.value.paymentDeadline = createDate(
          purchaseDate.year() + 1,
          1,
          card.repaymentDay
        ).format("YYYY-DD-MM");
      else {
        purchase.value.paymentDeadline = createDate(
          purchaseDate.year(),
          purchaseDate.month() + 1,
          card.repaymentDay
        ).format("YYYY-MM-DD");
      }
    }
  }
  console.log("calculatedDeadline: ", purchase.value.paymentDeadline);
};
function onUserChange() {
  if (selectedUser.value) {
    purchase.value.idUser = selectedUser.value?.id;
  }
}
function onCardChange() {
  if (selectedCard.value) {
    purchase.value.idCard = selectedCard.value?.id;
  }
}
function onFirmChange() {
  if (selectedFirm.value) {
    purchase.value.idFirm = selectedFirm.value?.id;
  }
}
const loanDateTemp = ref<string>("");
watch(loanDateTemp, (newDate: string) => {
  purchase.value.purchaseDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});
//
//SAVE
//
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
  console.log("newPurchase()");
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;

    const result = await purchaseStore.addPurchaseDb(purchase.value);

    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zapisano zakup: " + purchase.value?.name,
        life: 3000,
      });
      btnShowOk.value = true;
      // setTimeout(() => {
      //   router.push({ name: "Loans" });
      // }, 3000);
    } else btnShowError.value = true;

    setTimeout(() => {
      btnShowError.value = false;
      btnShowOk.value = false;
    }, 5000);
  }
}

//
//-----------------------------------------------------EDIT PURCHASE------------------------------------------------
//
const isEdit = ref<boolean>(false);
async function editPurchase() {
  // if (!isValid()) {
  //   showError("Uzupełnij brakujące elementy");
  //   btnShowError.value = true;
  //   setTimeout(() => (btnShowError.value = false), 5000);
  // } else {
  //   btnSaveDisabled.value = true;
  //   console.log("editLoan()");
  //   const result = await purchaseStore.up.updateLoanDb(loan.value);
  //
  //   if (result) {
  //     toast.add({
  //       severity: "success",
  //       summary: "Potwierdzenie",
  //       detail: "Zaaktualizowano kredyt: " + loan.value?.name,
  //       life: 3000,
  //     });
  //     btnShowOk.value = true;
  //     setTimeout(() => {
  //       router.push({ name: "Loans" });
  //     }, 3000);
  //   } else btnShowError.value = true;
  //
  //   // btnSaveDisabled.value = false;
  //   setTimeout(() => {
  //     btnShowError.value = false;
  //     btnShowOk.value = false;
  //     btnShowError.value = false;
  //   }, 5000);
  // }
}

onMounted(() => {
  console.log("onMounted GET");
  btnSaveDisabled.value = true;
  userStore.refreshUsers();
  bankStore.getBanksFromDb();
  btnSaveDisabled.value = false;
});

onMounted(async () => {
  // console.log("onMounted EDIT", route.params);
  btnSaveDisabled.value = true;
  isEdit.value = route.params.isEdit === "true";
  if (isEdit.value === false) {
    console.log("onMounted NEW LOAN");
    // invoiceDateTemp.value = loan.value.invoiceDate;
    // sellDateTemp.value = loan.value.sellDate;
  } else {
    console.log("onMounted EDIT LOAN");
    const loanId = Number(route.params.id as string);
    loanStore
      .getLoanFromDb(loanId)
      .then((data) => {
        if (data) {
          // loan.value = data;
          // selectedBank.value = loan.value.bank;
          // selectedUser.value = loan.value.user;
          // loanDateTemp.value = loan.value.date;
        }
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania kredytu:", error);
      });
  }
  btnSaveDisabled.value = false;
});

//
//ERROR
//
const submitted = ref(false);

const showError = (msg: string) => {
  toast.add({
    severity: "error",
    summary: "Error Message",
    detail: msg,
    life: 3000,
  });
};
const isValid = () => {
  return false;
  // return loan.value.bank.id > 0 && loan.value. > 0;
};
const showErrorName = () => {
  return submitted.value && purchase.value.name.length > 0;
};
const showErrorUser = () => {
  return submitted.value && purchase.value.idUser <= 0;
};
const showErrorCard = () => {
  return submitted.value && purchase.value.idCard <= 0;
};
const showErrorFirm = () => {
  return submitted.value && purchase.value.idFirm <= 0;
};
const showErrorAmount = () => {
  return submitted.value && purchase.value.amount > 0;
};
</script>

<template>
  <TheMenu />

  <div class="m-4">
    <form @submit.stop.prevent="savePurchase">
      <Panel>
        <template #header>
          <IconButton
            v-tooltip.right="{
              value: 'Powrót do listy zakupów',
              showDelay: 500,
              hideDelay: 300,
            }"
            icon="pi-fw pi-list"
            @click="() => router.push({ name: 'Purchases' })"
          />
          <div class="w-full flex justify-content-center">
            <h3 class="color-green">
              {{
                isEdit ? `Edycja zakupu nr: ${purchase?.name}` : "Nowy zakup"
              }}
            </h3>
          </div>
        </template>
        <div class="flex flex-row grid">
          <div class="flex flex-column col-12 col-xl-6">
            <!-- ROW-1   NAME -->
            <div class="flex flex-column col-12 col-md-6">
              <label for="name">Nazwa</label>
              <InputText id="name" v-model="purchase.name" maxlength="50" />
              <small class="p-error">{{
                showErrorName() ? "Pole jest wymagane." : "&nbsp;"
              }}</small>
            </div>

            <!-- ROW-2   USER -->
            <div class="flex flex-row">
              <div class="flex flex-column col-12">
                <label for="input-user">Wybierz użytkownika:</label>
                <Dropdown
                  id="input-user"
                  v-model="selectedUser"
                  :class="{ 'p-invalid': showErrorUser() }"
                  :options="userStore.users"
                  option-label="{{data => data.firstName + ' ' + data.lastName}}}"
                  :onchange="onUserChange"
                  required
                />
                <small class="p-error">{{
                  showErrorUser() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
              <div v-if="userStore.loadingUsers" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>

            <!-- ROW-3   CARD -->
            <div class="flex flex-row">
              <div class="flex flex-column col-12">
                <label for="input-card">Wybierz kartę:</label>
                <Dropdown
                  id="input-card"
                  v-model="selectedCard"
                  :class="{ 'p-invalid': showErrorCard() }"
                  :options="cardStore.cards"
                  option-label="name"
                  :onchange="onCardChange"
                />
                <small class="p-error">{{
                  showErrorCard() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
              <div v-if="cardStore.loadingCards" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>

            <!-- ROW-4 FIRM -->
            <div class="flex flex-row">
              <div class="flex flex-column col-12">
                <label for="input-customer">Wybierz sklep/firmę:</label>
                <Dropdown
                  id="input-customer"
                  v-model="selectedFirm"
                  :class="{ 'p-invalid': showErrorFirm() }"
                  :options="firmStore.firms"
                  option-label="name"
                  :onchange="onFirmChange"
                />
                <small class="p-error">{{
                  showErrorFirm() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
              <div v-if="firmStore.loadingFirms" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>

            <!-- ROW-5  DATE  -->
            <div class="flex-row flex grid">
              <div class="flex flex-column col-12">
                <label for="date">Data zakupu:</label>
                <Calendar
                  id="date"
                  v-model="loanDateTemp"
                  show-icon
                  date-format="yy-mm-dd"
                  :disabled="!isCardSelected"
                  @change="calculateDeadline"
                />
              </div>
            </div>

            <!-- ROW-6  AMOUNT   -->
            <div class="flex-row flex grid">
              <div class="flex flex-column col-12 col-md-6">
                <label for="amount">Kwota</label>
                <InputNumber
                  id="amount"
                  v-model="purchase.amount"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                />
                <small class="p-error">{{
                  showErrorAmount() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
            </div>

            <!-- ROW-7 DEADLINE DATE  -->
            <div class="flex-row flex grid">
              <div class="flex flex-column col-12">
                <label for="date">Termin spłaty:</label>
                <Calendar
                  id="date"
                  v-model="purchase.paymentDeadline"
                  show-icon
                  date-format="yy-mm-dd"
                />
              </div>
            </div>

            <!-- ROW-8  OTHER INFO  -->
            <div class="flex-row flex grid">
              <!--              <div class="col">-->
              <div class="flex flex-column col-12">
                <label for="input">Dodatkowe informacje:</label>
                <Textarea v-model="purchase.otherInfo" rows="5" cols="30" />
              </div>
            </div>
          </div>
        </div>

        <!-- ROW-6  BTN SAVE -->
        <div class="flex flex-row">
          <div class="flex col justify-content-center">
            <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :is-busy-icon="btnShowBusy"
              :is-error-icon="btnShowError"
              :is-ok-icon="btnShowOk"
              :btn-disabled="isSaveBtnDisabled"
            />
          </div>
        </div>
      </Panel>
    </form>
  </div>
</template>

<style scoped></style>
