<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {type Firm} from "@/types/Firm.ts";
import OfficeButton from "@/components/OfficeButton.vue";
import {useToast} from "primevue/usetoast";
import router from "@/router";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import type {AxiosError} from "axios";
import {useFirmsStore} from "@/stores/firms.ts";
import TheMenuFinance from "@/components/finance/TheMenuFinance.vue";

const firmStore = useFirmsStore();
const route = useRoute();

const toast = useToast();
const firm = ref<Firm>({
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
      firmStore.loadingFirms ||
      btnSaveDisabled.value
  );
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
  console.log("newFirm()");
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
  } else {
    btnSaveDisabled.value = true;
    await firmStore.addFirmDb(firm.value).then(() => {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano firmę: " + firm.value.name,
        life: 3000,
      });
      setTimeout(() => {
        btnSaveDisabled.value = false
        router.push({name: "Firms"});
      }, 3000);
    }).catch((reason: AxiosError) => {
      console.error(reason);
      toast.add({
        severity: "error",
        summary: "Błąd podczas dodawania firmy.",
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
//-----------------------------------------------------EDIT FRIMA------------------------------------------------
//
const isEdit = ref<boolean>(false);

async function editFirm() {
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
  } else {
    btnSaveDisabled.value = true;
    await firmStore.updateFirmDb(firm.value)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Zaaktualizowano dane firmy: " + firm.value.name,
            life: 3000,
          });
          setTimeout(() => {
            router.push({name: "Firms"});
          }, 3000);
        }).catch((reason: AxiosError) => {
          toast.add({
            severity: "error",
            summary: "Błąd podczas edycji firmy.",
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
    console.log("onMounted NEW FIRM");
  } else {
    console.log("onMounted EDIT FIRM");
    const firmId = Number(route.params.firmId as string);
    firmStore
        .getFirmFromDb(firmId)
        .then((data) => {
          if (data) {
            firm.value = data;
          }
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania firmy:", error);
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
        firm.value.name.length > 0
    );
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
    return !firm.value.mail.includes("@");
  }
  return false;
};
</script>

<template>
  <TheMenuFinance/>

  <div class="m-4 max-w-6xl mx-auto">
    <form
        class="col-12 col-md-9 col-xl-6 align-self-center"
        @submit.stop.prevent="saveFirm"
    >
      <Panel>
        <template #header>
          <OfficeIconButton
              title="Powrót do listy firm"
              icon="pi pi-fw pi-table"
              @click="() => router.push({ name: 'Firms' })"
          />
          <div class="w-full flex justify-center gap-4">
             <span class="text-3xl">
              {{ isEdit ? `Edycja danych firmy` : "Nowa firma" }}
            </span>
            <div v-if="firmStore.loadingFirms">
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
            <label for="input" class="ml-2">Nazwa firmy</label>
            <InputText
                id="input"
                v-model="firm.name"
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
                  v-model="firm.address.street"
                  maxlength="100"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="zip">Kod</label>
              <InputText
                  id="zip"
                  v-model="firm.address.zip"
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
                  v-model="firm.address.city"
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
                  v-model="firm.phone"
                  maxlength="30"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="phone2">Telefon 2</label>
              <InputText
                  id="phone2"
                  v-model="firm.phone2"
                  maxlength="30"
              />
            </div>
            <div class="flex flex-col w-full">
              <label class="ml-2" for="fax">Fax</label>
              <InputText
                  id="fax"
                  v-model="firm.fax"
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
                  v-model="firm.mail"
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
                  v-model="firm.www"
                  maxlength="100"
              />
            </div>
          </div>

          <!-- ROW-6  OTHER INFO  -->
          <div class="row">
            <div class="flex flex-col">
              <label class="ml-2" for="input">Dodatkowe informacje:</label>
              <Textarea v-model="firm.otherInfo" rows="4" cols="30"/>
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

<style scoped></style>
