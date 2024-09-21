<script setup lang="ts">
import {Ref, ref, watch} from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import {useBooksStore} from "@/stores/books";
import {Series} from "@/types/Book";


const bookStore = useBooksStore();
const emit = defineEmits<{
  (e: "save", series: Series): void;
  (e: "cancel"): void;
}>();
const props = defineProps({
  idSeries: {
    type: Number,
    require: true,
    default: 0,
  },
  isEdit: {
    type: Boolean,
    require: false,
    default: true,
  },
});
const submitted = ref(false);
const series = ref<Series>({
  id: 0,
  title: "",
  description: "",
  url: "",
  checkDate: undefined,
  hasNewBooks: false
});


const urlLegimi = ref<string>("");
const urlUpolujEbooka = ref<string>("");
const urlLubimyCzytac = ref<string>("");

const getUrl = (url:string, searchText:string, variable: Ref<string>) => {
  const array = url.split(";;");
  const filteredArray = array.filter(value => value.includes(searchText));
  // Sprawdzenie, czy wynikowa tablica jest pusta
  variable.value = filteredArray.length > 0 ? filteredArray : "";
}

watch(
    () => props.idSeries,
    async (id: number) => {
      if (props.isEdit && id > 0) {
        series.value = await bookStore.getSeriesByIdFromDb(id);
        getUrl(series.value.url, 'legimi.pl', urlLegimi);
        getUrl(series.value.url, 'upolujebooka.pl', urlUpolujEbooka);
        getUrl(series.value.url, 'lubimyczytac.pl', urlLubimyCzytac);
      }
    }
);
const isValid = () => {
  return !(
      showErrorTitle() ||
      showErrorUrlLegimi() ||
      showErrorUpolujEbooka() ||
      showErrorLubimyCzytac()
  );
};
const showErrorTitle = () => {
  return submitted.value && series.value.title.length === 0
};
const showErrorUrlLegimi = () => {
  const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
  return (
      submitted.value && urlLegimi.value.length > 0 && !regex.test(urlLegimi.value)
  );
};
const showErrorUpolujEbooka = () => {
  const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
  return (
      submitted.value && urlUpolujEbooka.value.length > 0 && !regex.test(urlUpolujEbooka.value)
  );
};
const showErrorLubimyCzytac = () => {
  const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
  return (
      submitted.value && urlLubimyCzytac.value.length > 0 && !regex.test(urlLubimyCzytac.value)
  );
};

const submit = () => {
  submitted.value = true;
  if (isValid()) {
    let combineUrl = "";
    if(urlLegimi.value.length > 0) {
      combineUrl = urlLegimi.value +  ";;" ;
    }
    if (urlUpolujEbooka.value.length > 0) {
      combineUrl += urlUpolujEbooka.value +  ";;" ;
    }
    if (urlLubimyCzytac.value.length > 0) {
      combineUrl +=  urlLubimyCzytac.value +  ";;" ;
    }
    if (combineUrl.endsWith(";;")) {
      combineUrl = combineUrl.slice(0, -2);
    }
    series.value.url=combineUrl;
    emit("save", series.value);
    submitted.value = false;
  }
};


const cancel = () => {
  emit("cancel");
};
</script>

<template>
  <Dialog modal class="max-w-5xl w-1/2 mx-auto" close-on-escape @abort="cancel">
    <template #header>
      <h3>
        {{
          $props.isEdit
              ? "Edytuj serię"
              : "Dodaj nową serię"
        }}
      </h3>
    </template>
    <Fieldset class="w-full " legend="Seria">
          <!-- ROW-1   TITLE -->
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-title"
              >Nazwa:</label
              >
              <InputText
                  id="input-title"
                  v-model="series.title"
                  :class="{ 'p-invalid': showErrorTitle() }"
              />
              <small class="p-error">{{
                  showErrorTitle() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
            </div>

          <!-- ROW-2   URL Legimi -->
          <div class="flex flex-col w-full">
            <label class="ml-2 mb-1" for="input-legimi"
            >URL Legimi:</label
            >
            <InputText
                id="input-legimi"
                v-model="urlLegimi"
                :class="{ 'p-invalid': showErrorUrlLegimi() }"
            />
            <small class="p-error">{{
                showErrorUrlLegimi() ? "Wpisz popraawny adres www." : "&nbsp;"
              }}</small>
          </div>

          <!-- ROW-3   URL UpolujEbooka -->
          <div class="flex flex-col w-full">
            <label class="ml-2 mb-1" for="input-upoluj"
            >URL upolujebooka.pl:</label
            >
            <InputText
                id="input-upoluj"
                v-model="urlUpolujEbooka"
                :class="{ 'p-invalid': showErrorUpolujEbooka() }"
            />
            <small class="p-error">{{
                showErrorUpolujEbooka() ? "Wpisz popraawny adres www." : "&nbsp;"
              }}</small>
          </div>

          <!-- ROW-4   URL lubimy czytac -->
          <div class="flex flex-col w-full">
            <label class="ml-2 mb-1" for="input-lubimy"
            >URL lubimyczytac.pl:</label
            >
            <InputText
                id="input-lubimy"
                v-model="urlLubimyCzytac"
                :class="{ 'p-invalid': showErrorLubimyCzytac() }"
            />
            <small class="p-error">{{
                showErrorLubimyCzytac() ? "Wpisz popraawny adres www." : "&nbsp;"
              }}</small>
          </div>


      <!-- ROW- DESCRIPTION  -->
      <div class="flex flex-col w-full">
        <label class="ml-2 mb-1" for="description">Opis:</label>
        <Textarea id="description" v-model="series.description" fluid rows="3" cols="30"/>
      </div>

    </Fieldset>


    <template #footer>
      <div class="w-full flex justify-between">

      <div class="flex gap-2 items-center">
        <i v-if="series.hasNewBooks" class="pi pi-book" style="color: var(--p-green-700); font-size: 1.5rem"></i>
        <i v-else class="pi pi-book"  style="color: var(--p-red-500); font-size: 1.5rem"></i>
          <span >Data sprawdzenia: {{series.checkDate}} </span>
      </div>
      <div class="flex gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel"/>
        <OfficeButton text="Zapisz" btn-type="office-save" @click="submit"/>
      </div>
      </div>
    </template>
  </Dialog>
</template>
