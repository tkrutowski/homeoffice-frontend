<script setup lang="ts">
import {ref, watch} from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import Calendar from "primevue/calendar";
import {useBookstoreStore} from "@/stores/bookstores";
import {useUserbooksStore} from "@/stores/userbooks";
import {useBooksStore} from "@/stores/books";
import {Bookstore, UserBook} from "@/assets/types/Book";
import moment from "moment/moment";
import {UtilsService} from "@/service/UtilsService";

UtilsService.getTypesForLibrary();

const bookstoreStore = useBookstoreStore();
const userbookStore = useUserbooksStore();
const bookStore = useBooksStore();
// if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb();
const emit = defineEmits<{
  (e: "save", userbook: UserBook): void;
  (e: "cancel"): void;
}>();
const props = defineProps({
  idBook: {
    type: Number,
    require: true,
    default: 0,
  },
  isEdit: {
    type: Boolean,
    require: false,
    default: false,
  },
});
const submitted = ref(false);
const selectedBookstore = ref<Bookstore | undefined>();
const userbook = ref<UserBook>({
  id: 0,
  idUser: 0,
  book: undefined,
  idBookstore: 0,
  editionType: {name: "BOOK", viewName: ""},
  readingStatus: {name: "NOT_READ", viewName: ""},
  ownershipStatus: {name: "READ_ONLY", viewName: ""},
  readFrom: "",
  readTo: "",
  info: "",
});

watch(
    () => props.idBook,
    async (id: number) => {
      console.log("WATCH");
      if (!props.isEdit && id > 0) {
        console.log("NEW USERBOOK");
        userbook.value.book = await bookStore.getBookFromDb(id);
      }
      if (props.isEdit && id > 0) {
        console.log("EDIT USERBOOK");
        const result = await userbookStore.getUserbookFromDb(id);
        if (result) {
          userbook.value = result;
          selectedBookstore.value = bookstoreStore.getBookstore(
              userbook.value.idBookstore
          );
          readingDateFrom.value = userbook.value.readFrom;
          readingDateTo.value = userbook.value.readTo;
          console.log("userbook: ", result);
        }
      }
    }
);
const readingDateFrom = ref<string>("");
watch(readingDateFrom, (newDate: string) => {
  console.log("date from ", newDate);
  if (userbook.value)
    userbook.value.readFrom = moment(new Date(newDate)).format("YYYY-MM-DD");
});
const readingDateTo = ref<string>("");
watch(readingDateTo, (newDate: string) => {
  if (userbook.value)
    userbook.value.readTo = moment(new Date(newDate)).format("YYYY-MM-DD");
});
const isValid = () => {
  console.log("valid ", showErrorBookstore());
  return (
      showErrorBookstore() ||
      showErrorOwnership() ||
      showErrorDateFrom() ||
      showErrorDateTo() ||
      showErrorReadingStatus() ||
      showErrorEditionType()
  );
};
const showErrorBookstore = () => {
  return submitted.value && userbook.value.idBookstore === 0;
};
const showErrorOwnership = () => {
  return (
      submitted.value && userbook.value.ownershipStatus.viewName.length === 0
  );
};
const showErrorEditionType = () => {
  return submitted.value && userbook.value.editionType.viewName.length === 0;
};
const showErrorReadingStatus = () => {
  return submitted.value && userbook.value.readingStatus.viewName.length === 0;
};
const showErrorDateFrom = () => {
  return (
      submitted.value &&
      (userbook.value.readingStatus.name === "READ_NOW" ||
          userbook.value.readingStatus.name === "READ") &&
      userbook.value.readFrom.length === 0
  );
};
const showErrorDateTo = () => {
  return (
      submitted.value &&
      userbook.value.readingStatus.name === "READ" &&
      userbook.value.readTo.length === 0
  );
};
const submit = () => {
  submitted.value = true;
  if (!isValid()) {
    emit("save", userbook.value);
    submitted.value = false;
    reset();
  }
};

function reset() {
  userbook.value = {
    id: 0,
    idUser: 0,
    book: undefined,
    idBookstore: 0,
    editionType: {name: "BOOK", viewName: ""},
    readingStatus: {name: "NOT_READ", viewName: ""},
    ownershipStatus: {name: "READ_ONLY", viewName: ""},
    readFrom: "",
    readTo: "",
    info: "",
  };
  selectedBookstore.value = undefined;
  readingDateFrom.value = "";
  readingDateTo.value = "";
}

const cancel = () => {
  reset();
  emit("cancel");
};
</script>

<template>
  <Dialog modal class="max-w-5xl mx-auto" close-on-escape @abort="cancel">
    <template #header>
      <h2>
        {{
          $props.isEdit
              ? "Edytuj książkę na półce"
              : "Dodaj nową książkę na półkę"
        }}
      </h2>
    </template>
    <Fieldset class="w-full " legend="Książka">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-start-1 col-span-4">
          <!-- ROW-1   BOOKSTORE -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-bookstore"
              >Wybierz księgarnię:</label
              >
              <Dropdown
                  id="input-bookstore"
                  v-model="selectedBookstore"
                  :class="{ 'p-invalid': showErrorBookstore() }"
                  :options="bookstoreStore.bookstores"
                  option-label="name"
                  :onchange="
                (userbook.idBookstore = selectedBookstore
                  ? selectedBookstore.id
                  : 0)
              "
                  required
              />
              <small class="p-error">{{
                  showErrorBookstore() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
            </div>
            <div v-if="bookstoreStore.loadingBookstore" class="mt-4">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-2 OWNERSHIP -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-ownership"
              >Wybierz własność:</label
              >
              <Dropdown
                  id="input-ownership"
                  v-model="userbook.ownershipStatus"
                  :class="{ 'p-invalid': showErrorOwnership() }"
                  :options="userbookStore.ownershipStatus"
                  option-label="viewName"
                  required
              />
              <small class="p-error">{{
                  showErrorOwnership() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
            </div>
            <div v-if="userbookStore.loadingOwnership" class="mt-4">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-3 EDITION -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-edition"
              >Wybierz rodzaj:</label
              >
              <Dropdown
                  id="input-edition"
                  v-model="userbook.editionType"
                  :class="{ 'p-invalid': showErrorEditionType() }"
                  :options="userbookStore.editionTypes"
                  option-label="viewName"
                  required
              />
              <small class="p-error">{{
                  showErrorEditionType() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
            </div>
            <div v-if="userbookStore.loadingEditionType" class="mt-4">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-4 READ STATUS -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-read">Stan czytania:</label>
              <Dropdown
                  id="input-read"
                  v-model="userbook.readingStatus"
                  :class="{ 'p-invalid': showErrorReadingStatus() }"
                  :options="userbookStore.readingStatuses"
                  option-label="viewName"
                  required
              />
              <small class="p-error">{{
                  showErrorReadingStatus() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
            </div>
            <div v-if="userbookStore.loadingReadingStatus" class="mt-4">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-5  DATE FROM DATE TO  -->
          <div class="flex-row flex gap-4">
            <div class="flex-row flex w-full">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="date-from">Czytana od:</label>
                <Calendar
                    id="date-from"
                    v-model="readingDateFrom"
                    show-icon
                    date-format="yy-mm-dd"
                    :class="{ 'p-invalid': showErrorDateFrom() }"
                />
                <small class="p-error">{{
                    showErrorDateFrom() ? "Pole jest wymagane." : "&nbsp;"
                  }}</small>
              </div>
            </div>

            <div class="flex-row flex w-full">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="date-to">Czytana do:</label>
                <Calendar
                    id="date-to"
                    v-model="readingDateTo"
                    show-icon
                    date-format="yy-mm-dd"
                    :class="{ 'p-invalid': showErrorDateTo() }"
                />
                <small class="p-error">{{
                    showErrorDateTo() ? "Pole jest wymagane." : "&nbsp;"
                  }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW-   COVER -->
        <div class="col-start-5 col-span-2">
          <img
              v-if="userbook.book && userbook.book.cover.length > 0"
              :src="userbook.book?.cover"
              height="500"
              width="333"
              alt="Okładka do książki"
          />
          <img
              v-else
              src="@/assets/images/no_cover.jpg"
              alt="Okładka do książki"
          />
        </div>
      </div>
    </Fieldset>

    <!-- ROW-7  OTHER INFO  -->
    <Fieldset legend="Dodatkowe informacje">
      <Textarea v-model="userbook.info" fluid rows="3" cols="30"/>
    </Fieldset>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel"/>
        <OfficeButton text="Zapisz" btn-type="office-save" @click="submit"/>
      </div>
    </template>
  </Dialog>
</template>
