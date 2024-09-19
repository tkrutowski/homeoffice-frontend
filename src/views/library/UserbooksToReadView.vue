<script setup lang="ts">
import TheMenuLibrary from "@/components/library/TheMenuLibrary.vue";
import { useUserbooksStore } from "@/stores/userbooks";
import UserBookSmall from "@/components/library/UserBookSmall.vue";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import { UserBook } from "@/assets/types/Book";
import AddEditUserBookDialog from "@/components/library/AddEditUserBookDialog.vue";
const toast = useToast();
const userbookStore = useUserbooksStore();
if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb();

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
      <h2 class="mb-4">Moja półka - książki w poczekalni...</h2>
      <div v-if="userbookStore.loadingUserbooks">
        <ProgressSpinner
          class="ml-2"
          style="width: 35px; height: 35px"
          stroke-width="5"
        />
      </div>
    </div>

    <div class="flex flex-row flex-wrap justify-center">
      <div v-for="ub in userbookStore.getBooksToRead" :key="ub.id">
        <UserBookSmall :userbook="ub" @edit="editUserbook" />
      </div>
    </div>
  </div>
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
  background-color: var(--p-surface-200); /* lub dowolny inny kolor dla jasnego motywu */
}
/* Dla ciemnego motywu */
.p-dark .info-bar {
  background-color: var(--p-surface-800); /* lub dowolny inny kolor dla ciemnego motywu */
}
</style>
