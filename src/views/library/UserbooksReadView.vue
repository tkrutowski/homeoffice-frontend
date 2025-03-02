<script setup lang="ts">
import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue'
import {useUserbooksStore} from '@/stores/userbooks'
import UserBookSmall from '@/components/library/UserBookSmall.vue'
import {computed, ref} from 'vue'
import type {UserBook} from '@/types/Book'
import AddEditUserBookDialog from '@/components/library/AddEditUserBookDialog.vue'
import {useToast} from 'primevue/usetoast'
import type {AxiosError} from "axios";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";

const toast = useToast()
const userbookStore = useUserbooksStore()
const selectedYear = ref<number>(new Date().getFullYear())
const displayedYear = ref<number>(new Date().getFullYear())
const userbooks = ref<UserBook[]>([])
if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb()

async function getUserbooks() {
  userbooks.value = userbookStore.getUserbooksByDate(selectedYear.value)
  displayedYear.value = selectedYear.value
}

function getTotalAudiobook(edition: string): number {
  return userbooks.value.filter((ub: UserBook) => ub.editionType === edition).length
}

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false)
const tempUserbook = ref<UserBook>()
const editUserbook = (newUserbook: UserBook) => {
  tempUserbook.value = newUserbook
  showUserbookDialog.value = true
}
const submitEditUserbook = async (newUserbook: UserBook) => {
  showUserbookDialog.value = false
  if (newUserbook) {
    await userbookStore.updateUserbookDb(newUserbook)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano książkę na półce: ' + newUserbook.book?.title,
            life: 3000,
          })
        }).catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji książki na półkę.',
            life: 3000,
          })
        })
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
    await userbookStore.deleteUserbookDb(tempUserbook.value.id).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Usunięto z półki książkę: ' + tempUserbook.value?.book?.title,
        life: 3000,
      })
      getUserbooks();//reset
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Błąd podczas usuwania książki z półki: ' + tempUserbook.value?.book?.title,
        life: 3000,
      })
    })
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

  <Toolbar class="m-6 text-color">
    <template #start
    ><p class="mt-auto mb-auto">ROK: {{ displayedYear }}</p></template
    >
    <template #center>
      <InputNumber
          v-model="selectedYear"
          :min="2010"
          :max="2040"
          show-buttons
          :format="false"
          button-layout="horizontal"
      />
    </template>

    <template #end>
      <Button
          class="font-bold uppercase tracking-wider"
          outlined
          size="small"
          :disabled="userbookStore.loadingUserbooks"
          :loading="userbookStore.loadingUserbooks"
          @click="getUserbooks"
      >wyświetl
      </Button>
    </template>
  </Toolbar>

    <div class="flex flex-row flex-wrap justify-center">
      <div v-for="ub in userbooks" :key="ub.id">
        <UserBookSmall :userbook="ub" @edit="editUserbook" @delete="confirmDelete"/>
      </div>
    </div>
  </div>
  <Toolbar class="sticky-toolbar m-6">
    <template #start>
      <div class="flex flex-row text-color gap-3">
        <p class="mb-1">
          <small>Audiobook:</small>
          {{ getTotalAudiobook('AUDIOBOOK') }}
        </p>
        <p class="mb-1">
          <small>Ebooki:</small>
          {{ getTotalAudiobook('EBOOK') }}
        </p>
        <p class="mb-1">
          <small>Papierowe:</small>
          {{ getTotalAudiobook('BOOK') }}
        </p>
      </div>
    </template>

    <template #end>
      <p class="mb-1 text-color">
        RAZEM:
        {{
          getTotalAudiobook('AUDIOBOOK') + getTotalAudiobook('EBOOK') + getTotalAudiobook('BOOK')
        }}
      </p>
    </template>
  </Toolbar>
</template>

<style scoped></style>
