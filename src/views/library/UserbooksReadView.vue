<script setup lang="ts">
import TheMenuLibrary from "@/components/TheMenuLibrary.vue";
import { useUserbooksStore } from "@/stores/userbooks";
import UserBookSmall from "@/components/UserBookSmall.vue";
import OfficeButton from "@/components/OfficeButton.vue";
import { ref } from "vue";
import { UserBook } from "@/assets/types/Book";
import AddEditUserBookDialog from "@/components/AddEditUserBookDialog.vue";
import { useToast } from "primevue/usetoast";
const toast = useToast();
const userbookStore = useUserbooksStore();
const selectedYear = ref<number>(new Date().getFullYear());
const displayedYear = ref<number>(new Date().getFullYear());
const userbooks = ref<UserBook[]>([]);
if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb();

async function getUserbooks() {
  userbooks.value = userbookStore.getUserbooksByDate(selectedYear.value);
  displayedYear.value = selectedYear.value;
}

function getTotalAudiobook(edition: string): number {
  return userbooks.value.filter((ub) => ub.editionType.name === edition).length;
}

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false);
const tempUserbook = ref<UserBook>();
const editUserbook = (newUserbook: UserBook) => {
  tempUserbook.value = newUserbook;
  showUserbookDialog.value = true;
};
const submitEditUserbook = async (newUserbook: UserBook) => {
  showUserbookDialog.value = false;
  if (newUserbook) {
    const result = await userbookStore.updateUserbookDb(newUserbook);
    if (result) {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zaaktualizowano książkę na półce: " + newUserbook.book?.title,
        life: 3000,
      });
    }
  }
};
</script>

<template>
  <TheMenuLibrary />
  <AddEditUserBookDialog
    v-model:visible="showUserbookDialog"
    :id-book="tempUserbook?.id"
    :is-edit="true"
    @save="submitEditUserbook"
    @cancel="showUserbookDialog = false"
  />
  <div>
    <div class="info-bar mt-5">
      <h2 class="mb-4">Moja półka - przeczytane...</h2>
      <div v-if="userbookStore.loadingUserbooks">
        <ProgressSpinner
          class="ml-2"
          style="width: 35px; height: 35px"
          stroke-width="5"
        />
      </div>
    </div>

    <Toolbar class="m-6">
      <template #start
        ><p class="color-orange mt-auto mb-auto">
          ROK: {{ displayedYear }}
        </p></template
      >

      <template #center>
        <InputNumber
          v-model="selectedYear"
          :min="2010"
          :max="2030"
          show-buttons
          :format="false"
          buttonLayout="horizontal"
        />
      </template>

      <template #end>
        <OfficeButton
          text="wyszukaj"
          btn-type="office"
          :btn-disabled="userbookStore.loadingUserbooks"
          :is-busy-icon="userbookStore.loadingUserbooks"
          @click="getUserbooks"
        />
      </template>
    </Toolbar>

    <div class="flex flex-row flex-wrap justify-content-center">
      <div v-for="ub in userbooks" :key="ub.id">
        <UserBookSmall :userbook="ub" @edit="editUserbook" />
      </div>
    </div>
  </div>
  <Toolbar class="sticky-toolbar">
    <template #start>
      <div class="flex flex-column color-orange">
        <p class="mb-1">
          <small>Audiobook:</small>
          {{ getTotalAudiobook("AUDIOBOOK") }}
        </p>
        <p class="mb-1">
          <small>Ebooki:</small>
          {{ getTotalAudiobook("EBOOK") }}
        </p>
        <p class="mb-1">
          <small>Papierowe:</small>
          {{ getTotalAudiobook("BOOK") }}
        </p>
      </div>
    </template>

    <template #end>
      <p class="mb-1 color-orange">
        RAZEM:
        {{
          getTotalAudiobook("AUDIOBOOK") +
          getTotalAudiobook("EBOOK") +
          getTotalAudiobook("BOOK")
        }}
      </p>
    </template>
  </Toolbar>
</template>

<style scoped>
.info-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  text-align: center;
  padding-top: 10px;
  width: inherit;
  background-color: #1e1e1e;
}
</style>
