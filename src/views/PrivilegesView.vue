<script setup lang="ts">
import {useUsersStore} from '../stores/users'
import {onMounted, ref} from 'vue'
import {useToast} from 'primevue/usetoast'
import type {Privilege, Role, User} from '../types/User'
import TheMenu from '../components/TheMenu.vue'
import OfficeButton from '../components/OfficeButton.vue'
import type {SelectChangeEvent} from 'primevue/select'
import type {DataTableRowEditSaveEvent} from 'primevue/datatable'
import type {AxiosError} from "axios";

const userStore = useUsersStore()
const selectedUser = ref<User | null>(null)
const toast = useToast()

const statuses = ref(['NULL', 'READ', 'READ_ALL', 'WRITE', 'WRITE_ALL', 'DELETE', 'DELETE_ALL'])

const privileges = ref<Privilege[]>([])

const onUserChange = (event: SelectChangeEvent) => {
  const {value} = event
  userStore
      .getPrivilegesByUserFromDb(value.id)
      .then((privilegeList: Privilege[]) => (privileges.value = privilegeList))
}

const onRowEditSave = (event: DataTableRowEditSaveEvent) => {
  const {newData} = event
  userStore
      .updatePrivilegeDb(newData)
      .then(() => {
        toast.add({
          severity: 'info',
          summary: 'Informacja',
          detail: `Zmieniono uprawnienia dla roli: ${newData.role.name}`,
          life: 3500,
        })
        if (selectedUser.value?.id) {
          userStore
              .getPrivilegesByUserFromDb(selectedUser.value.id)
              .then((privilegeList: Privilege[]) => (privileges.value = privilegeList))
        }
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Informacja',
          detail: `Błąd podczas zmieniony uprawnień dla roli: ${newData.role.name}`,
          life: 3500,
        })
      })
}
const editingRows = ref([])

const addExistingRoleToUserDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)
const notUserRoles = ref<Role[]>([])
const selectedRole = ref<Role | null>(null)

const addExistingRole = async () => {
  notUserRoles.value = await userStore.getNotUserRoles(privileges.value.map((value) => value.role))
  submitted.value = false
  addExistingRoleToUserDialog.value = true
}
const saveRole = async () => {
  submitted.value = true
  if (selectedRole.value && selectedUser.value) {
    await userStore.addPrivilegesToUserFromDb(
        selectedUser.value.id,
        selectedRole.value.id,
    ).then(() => {
      if (selectedUser.value && selectedRole.value) {
      toast.add({
        severity: 'info',
        summary: 'Informacja',
        detail: `Dodano uprawnienie: ${selectedRole.value.name}`,
        life: 3500,
      })
        userStore
            .getPrivilegesByUserFromDb(selectedUser.value.id)
            .then((privilegeList: Privilege[]) => (privileges.value = privilegeList))
      }
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Błąd podczas dodawania upawnień.',
        life: 3000,
      })
    })
    addExistingRoleToUserDialog.value = false
  }
}
const hideDialog = () => {
  addExistingRoleToUserDialog.value = false
  submitted.value = false
}
const selectedPrivilege = ref<Privilege | null>(null)
const deletePrivilegeDialog = ref<boolean>(false)
const confirmDeletePrivilege = () => {
  deletePrivilegeDialog.value = true
}
const deletePrivilege = async () => {
  if (selectedPrivilege.value && selectedUser.value) {
    await userStore.deletePrivilegesFromUserFromDb(
        selectedUser.value.id,
        selectedPrivilege.value.role.id,
    ).then(() => {
      toast.add({
        severity: 'info',
        summary: 'Informacja',
        detail: 'Uprawnienie usunięte.',
        life: 3500,
      })
      if (selectedUser.value) {
        userStore
            .getPrivilegesByUserFromDb(selectedUser.value.id)
            .then((privilegeList: Privilege[]) => (privileges.value = privilegeList))
      }
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: `Błąd podczas usuwanie upawnienia: ${selectedRole.value?.name}`,
        life: 3000,
      })
    })
    deletePrivilegeDialog.value = false
    selectedPrivilege.value = null
  }
}
onMounted(async () => {
  await userStore.getUsersFromDb()
})
</script>

<template>
  <TheMenu/>
  <div class="card flex flex-col justify-center items-center">
    <Select
        v-model="selectedUser"
        :options="userStore.users"
        :optionLabel="(user) => user.lastName + ' ' + user.firstName"
        placeholder="Wybierz użytkownika"
        :loading="userStore.loadingUsers"
        @change="onUserChange"
        class="w-full md:w-56 mt-5"
    />
    <Toolbar class="mt-6" style="width: 50rem">
      <template #start>
        <OfficeButton
            btn-type="office-regular"
            text="Dodaj"
            icon="pi pi-plus"
            class="mr-2"
            @click="addExistingRole"
            :disabled="selectedUser === null"
        />
        <OfficeButton
            btn-type="office-save"
            text="usuń"
            icon="pi pi-trash"
            @click="confirmDeletePrivilege"
            :disabled="!selectedPrivilege"
        />
      </template>
    </Toolbar>
    <DataTable
        v-model:editingRows="editingRows"
        :value="privileges"
        editMode="row"
        dataKey="role.name"
        @row-edit-save="onRowEditSave"
        v-model:selection="selectedPrivilege"
        :loading="userStore.loadingPrivileges"
        :pt="{
        table: { style: 'width: 50rem' },
        column: {},
      }"
    >
      <Column selectionMode="single" style="width: 3rem" :exportable="false"></Column>
      <Column field="role.name" header="Rola" style="width: 30%"></Column>
      <Column field="read" header="Odczyt" style="width: 20%">
        <template #editor="{ data, field }">
          <Select v-model="data[field]" :options="statuses" placeholder="Wybierz..." fluid/>
        </template>
      </Column>
      <Column field="write" header="Zapis" style="width: 20%">
        <template #editor="{ data, field }">
          <Select v-model="data[field]" :options="statuses" placeholder="Wybierz..." fluid/>
        </template>
      </Column>
      <Column field="delete" header="Usuwanie" style="width: 20%">
        <template #editor="{ data, field }">
          <Select v-model="data[field]" :options="statuses" placeholder="Wybierz..." fluid/>
        </template>
      </Column>
      <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
      ></Column>
    </DataTable>
  </div>

  <Dialog
      v-model:visible="addExistingRoleToUserDialog"
      :style="{ width: '450px' }"
      header="Dodawanie istniejącej roli"
      :modal="true"
  >
    <div class="flex flex-col gap-6">
      <div>
        <label for="role" class="block small ml-1">Istniejące role</label>
        <Select
            id="role"
            v-model="selectedRole"
            :options="notUserRoles"
            optionLabel="name"
            placeholder="Wybierz role"
            fluid
        ></Select>
      </div>
    </div>
    <template #footer>
      <OfficeButton
          btn-type="office-regular"
          icon="pi pi-times"
          @click="hideDialog"
          text="Anuluj"
      />
      <OfficeButton btn-type="office-save" text="Dodaj" icon="pi pi-check" @click="saveRole"/>
    </template>
  </Dialog>
  <Dialog
      v-model:visible="deletePrivilegeDialog"
      :style="{ width: '450px' }"
      header="Potwierdzenie"
      :modal="true"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl"/>
      <span
      >Czy na pewno chcesz usunąć uprawnienie <b>{{ selectedPrivilege?.role.name }}</b
      >?</span
      >
    </div>
    <template #footer>
      <OfficeButton
          btn-type="office-regular"
          icon="pi pi-times"
          text="Nie"
          @click="deletePrivilegeDialog = false"
      />
      <OfficeButton btn-type="office-save" icon="pi pi-check" text="tak" @click="deletePrivilege"/>
    </template>
  </Dialog>
</template>
<style scoped></style>
