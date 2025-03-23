<script setup lang="ts">
import {ref} from "vue";
import {type Firm} from "@/types/Firm.ts";
import OfficeButton from "@/components/OfficeButton.vue";
import {useToast} from "primevue/usetoast";

const toast = useToast();
const firm = ref<Firm>({
  id: 0,
  name: "",
  phone: "",
  phone2: "",
  fax: "",
  www: "",
  mail: "",
  otherInfo: "",
  address: {
    id: 0,
    city: "",
    street: "",
    zip: "",
  },
});

const emit = defineEmits<{
  (e: 'save', firm: Firm): void
  (e: 'cancel'): void
}>()


const cancel = () => {
  emit('cancel')
}

const submitted = ref(false);
const save = () => {
  submitted.value = true;
  if (!isValid()) {
    showError("Uzupełnij brakujące elementy");
  } else {
    emit('save', firm.value)
    reset()
  }
}

const reset = () => {
  firm.value = {
    id: 0,
    name: "",
    phone: "",
    phone2: "",
    fax: "",
    www: "",
    mail: "",
    otherInfo: "",
    address: {
      id: 0,
      city: "",
      street: "",
      zip: "",
    },
  }
}

//
//-----------------------------------------------------ERROR-------------------------------------------------------
//

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
    const {zip} = firm.value.address;
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
  <Dialog :style="{ width: '750px' }" :modal="true">
    <template #header>
      <p class="text-xl text-center mx-auto"> Nowa firma </p>
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
            showErrorZip() ? "Format 61754 lub 61-754." : "&nbsp;"
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
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton
            text="Anuluj"
            btn-type="office-regular"
            @click="cancel"
            @abort="cancel"
        ></OfficeButton>
        <OfficeButton text="zapisz" btn-type="office-save" @click="save"></OfficeButton>
      </div>
    </template>
  </Dialog>
</template>
