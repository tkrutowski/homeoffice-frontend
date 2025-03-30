<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import {useToast} from "primevue/usetoast";
import router from "@/router";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import type {AxiosError} from "axios";
import TheMenuFinance from "@/components/finance/TheMenuFinance.vue";
import type {Bank} from "@/types/Bank.ts";
import {useBanksStore} from "@/stores/banks.ts";

const bankStore = useBanksStore();
const route = useRoute();

const toast = useToast();
const bank = ref<Bank>({
  id: 0,
  name: "",
  phone: "",
  phone2: "",
  fax:"",
  www:"",
  mail: "",
  otherInfo: "",
  address: {
    id: 0,
    city: "",
    street: "",
    zip: "",
  },
});

const btnSaveDisabled = ref<boolean>(false);
const btnShowBusy = ref<boolean>(false);

const isSaveBtnDisabled = computed(() => {
  return (
      bankStore.loadingBanks ||
      btnSaveDisabled.value
  );
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
  console.log("newBank()");
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
  } else {
    btnSaveDisabled.value = true;
    await bankStore.addBankDb(bank.value).then(() => {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano bank: " + bank.value.name,
        life: 3000,
      });
      setTimeout(() => {
        btnSaveDisabled.value = false
        router.push({name: "Banks"});
      }, 3000);
    }).catch((reason: AxiosError) => {
      console.error(reason);
      btnSaveDisabled.value = false
      toast.add({
        severity: "error",
        summary: "Błąd podczas dodawania banku.",
        detail: (reason?.response?.data as { message: string }).message,
        life: 5000,
      });
    }).finally(() => {
      btnShowBusy.value = false;
    })
    submitted.value = false;
  }
}

//
//-----------------------------------------------------EDIT BANK------------------------------------------------
//
const isEdit = ref<boolean>(false);

async function editBank() {
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
  } else {
    btnSaveDisabled.value = true;
    await bankStore.updateBankDb(bank.value)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Zaaktualizowano dane banku: " + bank.value.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({name: "Banks"});
          }, 3000);
        }).catch((reason: AxiosError) => {
          toast.add({
            severity: "error",
            summary: "Błąd podczas edycji banku.",
            detail: (reason?.response?.data as { message: string }).message,
            life: 5000,
          });
        });
  }
}

onMounted(async () => {
  console.log("onMounted EDIT", route.params);
  btnSaveDisabled.value = true;
  isEdit.value = route.params.isEdit === "true";
  if (!isEdit.value) {
    console.log("onMounted NEW BANK");
  } else {
    console.log("onMounted EDIT BANK");
    const bankId = Number(route.params.bankId as string);
    bankStore
        .getBankFromDb(bankId)
        .then((data) => {
          if (data) {
            bank.value = data;
          }
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania banku:", error);
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
    severity: "error",
    summary: "Error Message",
    detail: msg,
    life: 5000,
  });
};
const isValid = () => {
    return (
        bank.value.name.length > 0
    );
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
    return !bank.value.mail.includes("@");
  }
  return false;
};
</script>

<template>
  <TheMenuFinance/>

  <div class="m-4 max-w-6xl mx-auto">
    <form
        class="col-12 col-md-9 col-xl-6 align-self-center"
        @submit.stop.prevent="saveBank"
    >
      <Panel>
        <template #header>
          <OfficeIconButton
              title="Powrót do listy banków"
              icon="pi pi-fw pi-table"
              @click="() => router.push({ name: 'Banks' })"
          />
          <div class="w-full flex justify-center gap-4">
             <span class="text-3xl">
              {{ isEdit ? `Edycja danych banku` : "Nowy bank" }}
            </span>
            <div v-if="bankStore.loadingBanks">
              <ProgressSpinner
                  class="ml-3"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
              />
            </div>
          </div>
        </template>

        <!-- ROW-1 NAME  -->
          <div class="flex flex-col w-full">
            <label for="input" class="ml-2">Nazwa banku</label>
            <InputText
                id="input"
                v-model="bank.name"
                maxlength="100"
                :invalid="showErrorName()"
            />
            <small class="p-error">{{
                showErrorName() ? "Pole jest wymagane." : "&nbsp;"
              }}</small>
          </div>

          <!-- ROW-2  ADDRESS  -->
          <div class="flex-row flex gap-4">
            <div class="flex flex-col w-full">
              <label class="ml-2" for="street">Ulica</label>
              <InputText
                  id="street"
                  v-model="bank.address.street"
                  maxlength="100"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="zip">Kod</label>
              <InputText
                  id="zip"
                  v-model="bank.address.zip"
                  maxlength="6"
                  :invalid="showErrorZip()"
              />
              <small class="p-error">{{
                  showErrorZip() ? "Prawidłowy format to: 61-754" : "&nbsp;"
                }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="city">Miasto</label>
              <InputText
                  id="city"
                  v-model="bank.address.city"
                  maxlength="100"
              />
            </div>
          </div>

          <!-- ROW-3  PHONE  -->
          <div class="flex-row flex gap-4 mb-3">
            <div class="flex flex-col w-full">
              <label class="ml-2" for="phone">Telefon</label>
              <InputText
                  id="phone"
                  v-model="bank.phone"
                  maxlength="30"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="phone2">Telefon 2</label>
              <InputText
                  id="phone2"
                  v-model="bank.phone2"
                  maxlength="30"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="fax">Fax</label>
              <InputText
                  id="fax"
                  v-model="bank.fax"
                  maxlength="30"
              />
            </div>
          </div>

          <!-- ROW-4  MAIL / PHONE  -->
        <div class="flex-row flex gap-4">
        <div class="flex flex-col w-full">
              <label class="ml-2" for="mail">E-mail</label>
              <InputText
                  id="mail"
                  v-model="bank.mail"
                  :invalid="showErrorMail()"
                  maxlength="100"
              />
              <small class="p-error">{{
                  showErrorMail() ? "Niepoprawny format." : "&nbsp;"
                }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="www">WWW</label>
              <InputText
                  id="www"
                  v-model="bank.www"
                  maxlength="100"
              />
            </div>
          </div>

          <!-- ROW-6  OTHER INFO  -->
          <div class="row">
            <div class="flex flex-col">
              <label class="ml-2" for="input">Dodatkowe informacje:</label>
              <Textarea v-model="bank.otherInfo" rows="4" cols="30"/>
            </div>
          </div>

          <!-- ROW-7  BTN SAVE -->
          <div class="flex mt-5 justify-center">
            <OfficeButton
                text="zapisz"
                btn-type="office-save"
                type="submit"
                :is-busy-icon="btnShowBusy"
                :btn-disabled="isSaveBtnDisabled"
            />
          </div>
      </Panel>
    </form>
  </div>
</template>
