<script setup lang="ts">
import OfficeButton from "@/components/OfficeButton.vue";
import IconButton from "@/components/IconButton.vue";
import User from "@/assets/types/User";
import { computed, onMounted, ref, watch } from "vue";
import moment from "moment";
import router from "@/router";

import { useUsersStore } from "@/stores/users";
import { useRoute } from "vue-router";
import { useFirmsStore } from "@/stores/firms";
import { usePurchasesStore } from "@/stores/purchases";
import { useCardsStore } from "@/stores/cards";

const userStore = useUsersStore();
const purchaseStore = usePurchasesStore();
const firmStore = useFirmsStore();
const route = useRoute();
const cardStore = useCardsStore();

import { useToast } from "primevue/usetoast";
import Firm from "@/assets/types/Firm";
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import { Purchase } from "@/assets/types/Purchase";
import { Card } from "@/assets/types/Bank";
const toast = useToast();
const selectedUser = ref<User | undefined>();
const selectedFirm = ref<Firm | undefined>();
const selectedCard = ref<Card | undefined>();
const optionCard = ref<Card[]>();

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
  paymentDeadline: new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split(".")
    .reverse()
    .join("-"),
  paymentDate: new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split(".")
    .reverse()
    .join("-"),
  paymentStatus: { name: "TO_PAY", viewName: "Do spłaty" },
  installment: false,
  otherInfo: "",
});

const btnShowError = ref<boolean>(false);
const btnShowBusy = ref<boolean>(false);
const btnShowOk = ref<boolean>(false);
const btnSaveDisabled = ref<boolean>(false);

const isSaveBtnDisabled = computed(() => {
  return (
    cardStore.loadingCards ||
    userStore.loadingUsers ||
    firmStore.loadingFirms ||
    btnSaveDisabled.value
  );
});
const purchaseDateTemp = ref<string>("");
watch(purchaseDateTemp, (newDate: string) => {
  purchase.value.purchaseDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});
const deadlineDateTemp = ref<string>("");
watch(deadlineDateTemp, (newDate: string) => {
  purchase.value.paymentDeadline = moment(new Date(newDate)).format(
    "YYYY-MM-DD"
  );
});
//
//AUTO COMPLETE
//
const filteredFirms = ref<Firm[]>();
const searchFirm = (event: { query: string }) => {
  filteredFirms.value = firmStore.firms.filter((firm) => {
    return firm.name.toLowerCase().includes(event.query.toLowerCase());
  });
};
watch(selectedFirm, (newFirm: Firm | undefined) => {
  if (newFirm) purchase.value.idFirm = newFirm.id;
  else purchase.value.idFirm = 0;
});

//
//CARD
//
watch(selectedUser, () => {
  console.log("WATCH user, ", selectedUser.value);
  if (selectedUser.value && selectedUser.value?.id > 0)
    isEdit.value
      ? (optionCard.value = cardStore.getCardByUser(selectedUser.value?.id))
      : (optionCard.value = cardStore.getCardByUserAndStatus(
          selectedUser.value?.id,
          "ACTIVE"
        ));
});

watch([selectedCard, selectedUser, purchaseDateTemp], () => {
  console.log("WATCH Calculate deadline");
  console.log(
    "WATCH Calculate deadline USER,",
    selectedUser.value && selectedUser.value?.id > 0
  );
  console.log(
    "WATCH Calculate deadline CARD, ",
    selectedCard.value && selectedCard.value?.id > 0
  );
  console.log(
    "WATCH Calculate deadline DATE, ",
    purchaseDateTemp.value,
    purchaseDateTemp.value.length,
    purchaseDateTemp.value.length > 0
  );
  if (
    selectedUser.value &&
    selectedUser.value?.id > 0 &&
    selectedCard.value &&
    selectedCard.value?.id > 0 &&
    purchaseDateTemp.value
  ) {
    calculateDeadline(selectedCard.value, new Date(purchaseDateTemp.value));
  }
});
function calculateDeadline(card: Card, date: Date) {
  console.log("Calculate deadline...");
  const purchaseDate = moment(date);

  // Ustawienie początkowej daty płatności na następny miesiąc
  let deadlineDate = purchaseDate.add(1, "months");

  // Jeśli dzień zakupu jest większy niż dzień zamknięcia karty, przesuń o kolejny miesiąc
  if (purchaseDate.date() > card.closingDay) {
    deadlineDate = deadlineDate.add(1, "months");
  }

  // Ustawienie dnia płatności karty
  deadlineDate = deadlineDate.date(card.repaymentDay);

  // Jeśli przekroczyliśmy koniec roku, ustawienie odpowiedniego roku
  if (deadlineDate.month() === 0 && purchaseDate.month() === 11) {
    deadlineDate = deadlineDate.add(1, "year");
  }

  // Formatowanie i zapisywanie daty płatności
  deadlineDateTemp.value = deadlineDate.format("YYYY-MM-DD");
  console.log("Calculated deadline: ", deadlineDateTemp.value);
}

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
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    // btnSaveDisabled.value = true;
    btnShowBusy.value = true;
    const result = await purchaseStore.addPurchaseDb(purchase.value);

    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zapisano zakup: " + purchase.value?.name,
        life: 3000,
      });
      btnShowBusy.value = false;
      btnShowOk.value = true;
      setTimeout(() => {
        router.push({ name: "PurchasesCurrent" });
      }, 3000);
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
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;
    console.log("editPurchase()");
    setTimeout(() => {
      btnShowError.value = false;
      btnShowOk.value = false;
      btnShowError.value = false;
    }, 5000);
  }
}
//---------------------------------------------MOUNTED--------------------------------------------
onMounted(() => {
  console.log("onMounted GET");
  btnSaveDisabled.value = true;
  if (userStore.users.length === 0) userStore.getUsersFromDb();
  if (firmStore.firms.length === 0) firmStore.getFirmsFromDb();
  cardStore.getCardsFromDb("ALL");
  btnSaveDisabled.value = false;
  if (purchaseStore.purchases.size === 0)
    purchaseStore.getPurchaseCurrentFromDb();
});

onMounted(async () => {
  // console.log("onMounted EDIT", route.params);
  btnSaveDisabled.value = true;
  isEdit.value = route.params.isEdit === "true";
  if (isEdit.value === false) {
    console.log("onMounted NEW FEE");
  } else {
    console.log("onMounted EDIT FEE");
    const purchaseId = Number(route.params.feeId as string);
    purchaseStore
      .getPurchaseFromDb(purchaseId)
      .then((data) => {
        if (data) {
          purchase.value = data;
          console.log("onMounted PURCHSE", purchase.value);
          selectedFirm.value = firmStore.getFirm(purchase.value.idFirm);
          selectedCard.value = cardStore.getCard(purchase.value.idCard);
          selectedUser.value = userStore.getUser(purchase.value.idUser);
          purchaseDateTemp.value = purchase.value.purchaseDate;
          deadlineDateTemp.value = purchase.value.paymentDeadline;
        }
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania opłaty:", error);
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
    severity: "error",
    summary: "Error Message",
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
  return submitted.value && purchaseDateTemp.value.length === 0;
};
const showErrorDeadline = () => {
  return submitted.value && deadlineDateTemp.value.length === 0;
};
</script>

<template>
  <Toast />
  <TheMenuFinance />

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
            @click="() => router.push({ name: 'PurchasesCurrent' })"
          />
          <div class="w-full flex justify-content-center">
            <h3 class="color-green">
              {{ isEdit ? `Edycja zakupu: ${purchase?.name}` : "Nowy zakup" }}
            </h3>
          </div>
        </template>
        <div class="flex flex-row grid">
          <div class="flex flex-column col-12 col-xl-6 m-auto">
            <!-- ROW-1   NAME -->
            <div class="flex flex-column col-12">
              <label for="name">Nazwa</label>
              <InputText
                id="name"
                v-model="purchase.name"
                maxlength="50"
                :class="{ 'p-invalid': showErrorName() }"
              />
              <small class="p-error">{{
                showErrorName() ? "Pole jest wymagane." : "&nbsp;"
              }}</small>
            </div>

            <!-- ROW-2   USER -->
            <div class="flex flex-row">
              <div class="flex flex-column col-12">
                <label for="input-customer">Wybierz użytkownika:</label>
                <Dropdown
                  id="input-customer"
                  v-model="selectedUser"
                  :class="{ 'p-invalid': showErrorUser() }"
                  :options="userStore.users"
                  :option-label="(user) => user.firstName + ' ' + user.lastName"
                  :onchange="
                    (purchase.idUser = selectedUser ? selectedUser.id : 0)
                  "
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
                <label for="input-customer">Wybierz kartę:</label>
                <Dropdown
                  id="input-customer"
                  v-model="selectedCard"
                  :class="{ 'p-invalid': showErrorCard() }"
                  :options="optionCard"
                  option-label="name"
                  :onchange="
                    (purchase.idCard = selectedCard ? selectedCard.id : 0)
                  "
                  required
                />
                <small class="p-error">{{
                  showErrorUser() ? "Pole jest wymagane." : "&nbsp;"
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

            <!-- ROW-4   FIRM -->
            <div class="flex flex-row">
              <div class="flex flex-column col-12">
                <label for="input-customer">Wybierz firmę:</label>
                <AutoComplete
                  id="input-customer"
                  v-model="selectedFirm"
                  dropdown
                  force-selection
                  :class="{ 'p-invalid': showErrorFirm() }"
                  :suggestions="filteredFirms"
                  field="name"
                  @complete="searchFirm"
                />
                <!--                  @input="fee.firm = selectedFirm ? selectedFirm : undefined"-->
                <small class="p-error">
                  {{ showErrorFirm() ? "Pole jest wymagane." : "&nbsp;" }}
                </small>
              </div>
              <div v-if="firmStore.loadingFirms" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>

            <!-- ROW-4  DATE  -->
            <div class="flex-row flex">
              <div class="flex flex-column col-12">
                <label for="date">Data zakupu:</label>
                <Calendar
                  id="date"
                  v-model="purchaseDateTemp"
                  show-icon
                  date-format="yy-mm-dd"
                  :class="{ 'p-invalid': showErrorDate() }"
                />
                <small class="p-error">{{
                  showErrorDate() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
            </div>

            <!-- ROW-6  AMOUNT  -->
            <div class="flex-row flex">
              <div class="flex flex-column col-12">
                <label for="amount">Kwota:</label>
                <InputNumber
                  id="amount"
                  v-model="purchase.amount"
                  :class="{ 'p-invalid': showErrorAmount() }"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  :disabled="isEdit"
                />
                <small class="p-error">{{
                  showErrorAmount() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
            </div>

            <!-- ROW-4  DEADLINE  -->
            <div class="flex-row flex">
              <div class="flex flex-column col-12">
                <label for="date">Termin spłaty:</label>
                <Calendar
                  id="date"
                  v-model="deadlineDateTemp"
                  show-icon
                  date-format="yy-mm-dd"
                  :class="{ 'p-invalid': showErrorDeadline() }"
                />
                <small class="p-error">{{
                  showErrorDate() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
            </div>

            <!-- ROW-7  OTHER INFO  -->
            <div class="flex-row flex grid">
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
