<script setup lang="ts">
import TheMenuLibrary from '../../components/library/TheMenuLibrary.vue'
import {useUserbooksStore} from '../../stores/userbooks'
import UserBookSmall from '../../components/library/UserBookSmall.vue'
import AddEditUserBookDialog from '../../components/library/AddEditUserBookDialog.vue'
import {computed, ref} from 'vue'
import type {UserBook} from '../../types/Book'

const userbookStore = useUserbooksStore()
import {useToast} from 'primevue/usetoast'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'

const toast = useToast()
if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb()

//
//-------------------------------------------------USERBOOK EDIT-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false)
const tempUserbook = ref<UserBook | null>(null)
const editUserbook = (newUserbook: UserBook) => {
  tempUserbook.value = newUserbook
  showUserbookDialog.value = true
}
const submitEditUserbook = async (newUserbook: UserBook) => {
  showUserbookDialog.value = false
  if (newUserbook) {
    const result = await userbookStore.updateUserbookDb(newUserbook)
    if (result) {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zaaktualizowano książkę na półce: ' + newUserbook.book?.title,
        life: 3000,
      })
    }
  }
}
//
//-------------------------------------------------USERBOOK DELETE -------------------------------------------------
//
const showDeleteConfirmationDialog = ref<boolean>(false)
const confirmDelete = (userbook: UserBook) => {
  tempUserbook.value = userbook
  showDeleteConfirmationDialog.value = true
}
const deleteConfirmationMessage = computed(() => {
  if (tempUserbook.value)
    return `Czy chcesz usunąc z półki książkę: <b>${tempUserbook.value?.book?.title}</b>?`
  return 'No message'
})
const submitDelete = async () => {
  console.log('submitDelete()')
  showDeleteConfirmationDialog.value = false
  if (tempUserbook.value) {
    const result = await userbookStore.deleteUserbookDb(tempUserbook.value.id)
    if (result) {
      //update payment
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Usunięto z półki książkę: ' + tempUserbook.value?.book?.title,
        life: 3000,
      })
    }
  }
}
</script>

<template>
  <TheMenuLibrary/>
  <AddEditUserBookDialog
      v-model:visible="showUserbookDialog"
      :id-book="tempUserbook?.id"
      :is-edit="true"
      @save="submitEditUserbook"
      @cancel="showUserbookDialog = false"
  />
  <ConfirmationDialog
      v-model:visible="showDeleteConfirmationDialog"
      :msg="deleteConfirmationMessage"
      label="Usuń"
      @save="submitDelete"
      @cancel="showDeleteConfirmationDialog = false"
  />
  <div>
    <div
        class="flex mt-5 dark:bg-surface-800 bg-surface-300 h-14 justify-center items-center gap-4"
    >
      <p class="text-3xl font-semibold text-primary">Moja półka - aktualnie czytane...</p>
      <div v-if="userbookStore.loadingUserbooks">
        <ProgressSpinner style="width: 30px; height: 30px" stroke-width="5"/>
      </div>
    </div>

    <div class="flex flex-row flex-wrap justify-center">
      <div v-for="ub in userbookStore.getBooksReadNow" :key="ub.id">
        <UserBookSmall :userbook="ub" @edit="editUserbook" @delete="confirmDelete"/>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
