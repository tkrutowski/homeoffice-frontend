<script setup lang="ts">
import { useBooksStore } from "@/stores/books";
import { useRoute } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import router from "@/router";
import IconButton from "@/components/IconButton.vue";
import { useToast } from "primevue/usetoast";
import { Author, Book, Category, Series } from "@/assets/types/Book";
import TheMenuLibrary from "@/components/TheMenuLibrary.vue";
import AddDialog from "@/components/AddDialog.vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";

const bookStore = useBooksStore();
const route = useRoute();

const toast = useToast();
const selectedAuthors = ref<Author[]>([]);
const selectedSeries = ref<Series | undefined>();
const selectedCategories = ref<Category[]>([]);

const book = ref<Book>({
  id: 0,
  series: undefined,
  authors: [],
  categories: [],
  title: "",
  description: "",
  cover: "",
  bookInSeriesNo: "",
});

const btnShowError = ref<boolean>(false);
const btnShowBusy = ref<boolean>(false);
const btnShowOk = ref<boolean>(false);
const btnSaveDisabled = ref<boolean>(false);

const isSaveBtnDisabled = computed(() => {
  return (
    bookStore.loadingBooks ||
    bookStore.loadingSeries ||
    bookStore.loadingAuthors ||
    btnSaveDisabled.value
  );
});
//
//AUTO COMPLETE
//
//AUTHOR
const filteredAuthors = ref<Author[]>();
const searchAuthor = (event: { query: string }) => {
  filteredAuthors.value = bookStore.authors.filter((author) => {
    return author.lastName.toLowerCase().includes(event.query.toLowerCase());
  });
};
watch(selectedAuthors, (newAuthors: Author[] | []) => {
  book.value.authors = newAuthors;
});

//SERIES
const filteredSeries = ref<Series[]>();
const searchSeries = (event: { query: string }) => {
  filteredSeries.value = bookStore.series.filter((series) => {
    return series.title.toLowerCase().includes(event.query.toLowerCase());
  });
};
watch(selectedSeries, (newSeries: Series | undefined) => {
  book.value.series = newSeries;
});

//CATEGORY
const filteredCategories = ref<Category[]>();
const searchCategory = (event: { query: string }) => {
  filteredCategories.value = bookStore.categories.filter((cat) => {
    return cat.name.toLowerCase().includes(event.query.toLowerCase());
  });
};
watch(selectedCategories, (newCategory: Category[] | []) => {
  book.value.categories = newCategory;
});

//
//SAVE
//
function saveFee() {
  submitted.value = true;
  if (isEdit.value) {
    editBook();
  } else {
    newBook();
  }
}
//
//---------------------------------------------------------NEW BOOK----------------------------------------------
//
async function newBook() {
  console.log("newBook()");
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;
    btnShowBusy.value = true;
    book.value.authors = selectedAuthors.value;
    book.value.categories = selectedCategories.value;
    book.value.series = selectedSeries.value;
    const result = await bookStore.addBookDb(book.value);

    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zapisano książkę: " + book.value?.title,
        life: 3000,
      });
      btnShowBusy.value = false;
      btnShowOk.value = true;
      setTimeout(() => {
        resetForm();
      }, 1000);
    } else {
      toast.add({
        severity: "warn",
        summary: "Info",
        detail: "Książka już istnieje w bazie danych.",
        life: 3000,
      });
      btnShowError.value = true;
    }

    btnSaveDisabled.value = false;
    btnShowBusy.value = false;
    submitted.value = false;
    setTimeout(() => {
      btnShowError.value = false;
      btnShowOk.value = false;
    }, 5000);
  }
}

//
//-----------------------------------------------------EDIT BOOK------------------------------------------------
//
const isEdit = ref<boolean>(false);
async function editBook() {
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;
    console.log("editBook()");
    book.value.authors = selectedAuthors.value;
    book.value.categories = selectedCategories.value;
    book.value.series = selectedSeries.value;
    const result = await bookStore.updateBookDb(book.value);

    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zaaktualizowano książkę: " + book.value?.title,
        life: 3000,
      });
      btnShowOk.value = true;
      setTimeout(() => {
        router.push({ name: "Books" });
      }, 3000);
    } else btnShowError.value = true;

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
  if (bookStore.authors.length === 0) bookStore.getAuthorsFromDb();
  if (bookStore.series.length === 0) bookStore.getSeriesFromDb();
  if (bookStore.categories.length === 0) bookStore.getCategoriesFromDb();
  btnSaveDisabled.value = false;
});

onMounted(async () => {
  btnSaveDisabled.value = true;
  isEdit.value = route.params.isEdit === "true";
  const bookId = Number(route.params.bookId as string);
  if (isEdit.value === false && bookId === -1) {
    book.value = bookStore.tempBook;
    selectedAuthors.value = book.value.authors;
    selectedCategories.value = book.value.categories;
    selectedSeries.value = book.value.series;
  } else if (isEdit.value === false && bookId === 0) {
    console.log("onMounted NEW BOOK");
  } else {
    console.log("onMounted EDIT BOOK");
    bookStore
      .getBookFromDb(bookId)
      .then((data) => {
        if (data) {
          book.value = data;
          selectedAuthors.value = book.value.authors;
          selectedCategories.value = book.value.categories;
          selectedSeries.value = book.value.series;
        }
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania książek:", error);
      });
  }
  btnSaveDisabled.value = false;
});
//
//--------------------------------------------------AUTHOR
//
const showAddModal = ref(false);
async function saveAuthor(firstName: string, lastName: string) {
  console.log("in1: ", firstName);
  console.log("in2: ", lastName);
  showAddModal.value = false;
  if (firstName.length === 0 || lastName.length === 0) {
    showError("Uzupełnij brakujące elementy");
  } else {
    const result: boolean = await bookStore.addAuthorDb({
      id: 0,
      firstName: firstName,
      lastName: lastName,
    });
    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano autora: " + firstName + " " + lastName,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Błąd",
        detail: "Nie dodano autora: " + firstName + " " + lastName,
        life: 3000,
      });
    }
  }
}
//
//--------------------------------------------------CATEGORY
//
const showAddCategoryModal = ref(false);
async function saveCategory(name: string) {
  console.log("in1: ", name);
  showAddCategoryModal.value = false;
  if (name.length === 0) {
    showError("Uzupełnij brakujące elementy");
  } else {
    const result: boolean = await bookStore.addCategoryDb({
      id: 0,
      name: name,
    });
    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano kategorię: " + name,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Błąd",
        detail: "Nie dodano kategorii: " + name,
        life: 3000,
      });
    }
  }
}
//
//----------------------------------------------SEARCH---------------------------------------------
//
const searchUrl = ref<string>("");
const btnSearchShowError = ref<boolean>(false);
const btnSearchShowBusy = ref<boolean>(false);
const btnSearchShowOk = ref<boolean>(false);
const btnSearchDisabled = ref<boolean>(false);

function findBook() {
  console.log("START - findBook(" + searchUrl.value + ")");
  submittedSearch.value = true;
  resetForm();
  if (isSearchNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnSearchShowError.value = true;
    setTimeout(() => (btnSearchShowError.value = false), 5000);
  } else {
    btnSearchDisabled.value = true;
    bookStore.getBookFromUrl(searchUrl.value).then((bookByUrl) => {
      if (!bookByUrl.title) {
        btnSearchDisabled.value = false;
        changeStatusSearchIcon(false, false, true);
        setTimeout(() => changeStatusSearchIcon(false, false, false), 8000);
        toast.add({
          severity: "info",
          summary: "Informacja",
          detail: "Nie znaleziono książki.",
          life: 3500,
        });
      } else {
        btnSearchDisabled.value = false;
        changeStatusSearchIcon(false, true, false);
        setTimeout(() => changeStatusSearchIcon(false, false, false), 8000);
        book.value = bookByUrl;
        selectedAuthors.value = book.value.authors;
        selectedCategories.value = book.value.categories;
        selectedSeries.value = book.value.series;
      }
    });
  }
}
function resetForm() {
  book.value = {
    id: 0,
    series: undefined,
    authors: [],
    categories: [],
    title: "",
    description: "",
    cover: "",
    bookInSeriesNo: "",
  };
  selectedAuthors.value = [];
  selectedCategories.value = [];
  selectedSeries.value = undefined;
  submitted.value = false;
  btnSaveDisabled.value = false;
  btnSaveDisabled.value = false;
}
function changeStatusSearchIcon(busy: boolean, saved: boolean, error: boolean) {
  btnSearchShowBusy.value = busy;
  btnSearchShowError.value = error;
  btnSearchShowOk.value = saved;
}
//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false);
const submittedSearch = ref(false);

const showError = (msg: string) => {
  toast.add({
    severity: "error",
    summary: "Error Message",
    detail: msg,
    life: 3000,
  });
};
const isSearchNotValid = () => {
  return showErrorUrl();
};
const isNotValid = () => {
  return (
    showErrorTitle() ||
    showErrorAuthor() ||
    showErrorCategory() ||
    showErrorCover()
  );
};
const showErrorUrl = () => {
  return submittedSearch.value && searchUrl.value.length === 0;
};
const showErrorTitle = () => {
  return submitted.value && book.value.title.length === 0;
};
const showErrorAuthor = () => {
  return submitted.value && book.value.authors.length === 0;
};
const showErrorCategory = () => {
  return submitted.value && book.value.categories.length === 0;
};
const showErrorCover = () => {
  return submitted.value && book.value.cover.length === 0;
};
</script>

<template>
  <Toast />
  <TheMenuLibrary />
  <AddDialog
    v-model:visible="showAddModal"
    label2="Nazwisko:"
    msg="Dodaj autora"
    label1="Imię:"
    @save="saveAuthor"
    @cancel="showAddModal = false"
  />
  <AddDialog
    v-model:visible="showAddCategoryModal"
    msg="Dodaj kategorię"
    label1="Nazwa:"
    @save="saveCategory"
    @cancel="showAddCategoryModal = false"
  />

  <div class="m-4">
    <form @submit.stop.prevent="saveFee">
      <Panel>
        <template #header>
          <IconButton
            v-tooltip.right="{
              value: 'Powrót do listy książek',
              showDelay: 500,
              hideDelay: 300,
            }"
            icon="pi-fw pi-list"
            @click="() => router.push({ name: 'Books' })"
          />
          <div class="w-full flex justify-content-center">
            <h2 class="color-green">
              {{ isEdit ? `Edycja książki: ${book?.title}` : "Nowa książka" }}
            </h2>
          </div>
        </template>
        <div v-if="!isEdit" class="flex flex-column grid ebook">
          <!-- URL -->
          <div class="flex flex-column">
            <label class="color-orange" for="url">URL:</label>
            <InputText
              id="url"
              v-model="searchUrl"
              :class="{ 'p-invalid': showErrorUrl() }"
            />
            <small class="p-error">{{
              showErrorUrl() ? "Pole jest wymagane." : "&nbsp;"
            }}</small>
          </div>

          <!--   BTN SEARCH -->
          <div class="flex flex-row">
            <div class="flex col justify-content-center">
              <OfficeButton
                text="wyszukaj"
                type="button"
                btn-type="office"
                :is-busy-icon="btnSearchShowBusy"
                :is-error-icon="btnSearchShowError"
                :is-ok-icon="btnSearchShowOk"
                :btn-disabled="btnSearchDisabled"
                @click="findBook()"
              />
            </div>
          </div>
        </div>

        <!--  --------------------------------------------------------BOOK---------------------------------      -->
        <div class="flex flex-row grid">
          <div class="flex flex-column col-12 xl:col-8">
            <!-- ROW-1   TITLE -->
            <div class="flex flex-column col-12 ebook">
              <label class="color-orange" for="title">Tytuł:</label>
              <InputText
                id="title"
                v-model="book.title"
                maxlength="50"
                :class="{ 'p-invalid': showErrorTitle() }"
              />
              <small class="p-error">{{
                showErrorTitle() ? "Pole jest wymagane." : "&nbsp;"
              }}</small>
            </div>

            <!-- ROW-2   AUTHOR -->
            <div class="flex flex-row ebook gap-2 w-max">
              <div class="flex flex-column">
                <label class="color-orange" for="author">Wybierz autora:</label>
                <AutoComplete
                  id="input-customer"
                  v-model="selectedAuthors"
                  class="m-auto w-full"
                  dropdown
                  multiple
                  force-selection
                  :class="{ 'p-invalid': showErrorAuthor() }"
                  :suggestions="filteredAuthors"
                  :option-label="
                    (author) => author.firstName + ' ' + author.lastName
                  "
                  @complete="searchAuthor"
                />
                <small class="p-error">{{
                  showErrorAuthor() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
              <OfficeIconButton
                v-tooltip.right="{
                  value: 'Dodaj autora',
                  showDelay: 500,
                  hideDelay: 300,
                }"
                :icon="
                  bookStore.loadingAuthors ? 'pi-spin pi-spinner' : 'pi-plus'
                "
                style="height: 42px; width: 42px; padding: 0"
                class="mt-1 align-self-center"
                @click="showAddModal = true"
              />
              <div v-if="bookStore.loadingAuthors" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>

            <!-- ROW-3  SERIES / NUMBER  -->
            <div class="flex-row flex ebook">
              <div class="flex flex-column col-12 md:col-9">
                <label class="color-orange" for="series">Seria:</label>
                <AutoComplete
                  id="input-customer"
                  v-model="selectedSeries"
                  dropdown
                  force-selection
                  :suggestions="filteredSeries"
                  field="title"
                  @complete="searchSeries"
                />
              </div>
              <div v-if="bookStore.loadingSeries" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>

              <div class="flex flex-column col-12 md:col-3">
                <label class="color-orange" for="seriesNo">Cześć:</label>
                <InputText
                  id="seriesNo"
                  v-model="book.bookInSeriesNo"
                  maxlength="5"
                />
              </div>
            </div>

            <!-- ROW-4   CATEGORY -->
            <div class="flex flex-row ebook gap-2">
              <div class="flex flex-column">
                <label class="color-orange" for="category"
                  >Wybierz kategorię:</label
                >
                <AutoComplete
                  id="category"
                  v-model="selectedCategories"
                  dropdown
                  multiple
                  force-selection
                  :class="{ 'p-invalid': showErrorCategory() }"
                  :suggestions="filteredCategories"
                  field="name"
                  @complete="searchCategory"
                />
                <small class="p-error">{{
                  showErrorCategory() ? "Pole jest wymagane." : "&nbsp;"
                }}</small>
              </div>
              <OfficeIconButton
                v-tooltip.right="{
                  value: 'Dodaj kategorię',
                  showDelay: 500,
                  hideDelay: 300,
                }"
                :icon="
                  bookStore.loadingCategories ? 'pi-spin pi-spinner' : 'pi-plus'
                "
                style="height: 42px; width: 42px; padding: 0"
                class="mt-1 align-self-center"
                @click="showAddCategoryModal = true"
              />
              <div v-if="bookStore.loadingCategories" class="mt-4">
                <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 40px; height: 40px"
                  stroke-width="5"
                />
              </div>
            </div>
          </div>

          <!-- ROW-   COVER -->
          <div class="flex flex-column m-auto ebook w-auto">
            <img
              v-if="book.cover.length > 0"
              :src="book.cover"
              height="500"
              width="333"
              alt="Okładka do książki"
            />
            <img
              v-else
              src="@/assets/images/no_cover.jpg"
              height="300"
              width="300"
              alt="Okładka do książki"
            />
          </div>
        </div>

        <!-- ROW-5   URL -->
        <div class="flex flex-column ebook">
          <label class="color-orange" for="cover">URL okładki:</label>
          <InputText
            id="cover"
            v-model="book.cover"
            :class="{ 'p-invalid': showErrorCover() }"
          />
          <small class="p-error">{{
            showErrorCover() ? "Pole jest wymagane." : "&nbsp;"
          }}</small>
        </div>

        <!-- ROW-7  OTHER INFO  -->
        <div class="flex flex-column col-12 ebook">
          <label class="color-orange" for="description"
            >Dodatkowe informacje:</label
          >
          <Textarea
            id="description"
            v-model="book.description"
            rows="5"
            cols="30"
          />
        </div>

        <!-- ROW-8  BTN SAVE -->
        <div class="flex flex-row justify-content-center gap-2">
          <OfficeButton
            v-if="!isEdit"
            text="Reset"
            type="button"
            btn-type="office"
            @click="resetForm()"
          />
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
      </Panel>
    </form>
  </div>
</template>

<style scoped>
.ebook {
  background-color: #1a1a1a !important;
  color: rgb(238, 127, 0) !important;
  border-radius: 10px;
  padding: 0.5rem 1.5rem 0.5rem 1.5rem !important;
  margin: 0.5rem !important;
}
</style>
