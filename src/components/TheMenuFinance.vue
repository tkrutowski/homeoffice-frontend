<script setup lang="ts">
import { ref } from "vue";
import { useAuthorizationStore } from "@/stores/authorization";
import OfficeButton from "@/components/OfficeButton.vue";
import router from "@/router";

const authorizationStore = useAuthorizationStore();
const items = ref([
  {
    label: "Home",
    icon: "pi pi-fw pi-home",
    disabled: !authorizationStore.hasAccessFinance,
    // to: { name: "Home" },
    command: () => {
      router.push({ name: "Home" });
    },
  },
  {
    label: "Kredyty",
    icon: "pi pi-fw pi-euro",
    // disabled: !authorizationStore.hasAccessFinance,
    items: [
      {
        label: "Nowy kredyt",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Loan",
            params: { isEdit: "false", loanId: 0 },
          });
        },
      },
      {
        label: "Lista kredytów",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "Loans" });
        },
      },
    ],
  },
  {
    label: "Opłaty",
    icon: "pi pi-fw pi-euro",
    // disabled: !authorizationStore.hasAccessFinance,
    items: [
      {
        label: "Nowa opłata",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Fee",
            params: { isEdit: "false", feeId: 0 },
          });
        },
      },
      {
        label: "Lista opłat",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "Fees" });
        },
      },
    ],
  },
  {
    label: "Płatności",
    icon: "pi pi-fw pi-euro",
    // disabled: !authorizationStore.hasAccessFinance,
    items: [
      {
        label: "Lista płatności",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "Payments" });
        },
      },
    ],
  },
  {
    label: "Zakupy",
    icon: "pi pi-fw pi-euro",
    // disabled: !authorizationStore.hasAccessFinance,
    items: [
      {
        label: "Nowy zakup",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Purchase",
            params: { isEdit: "false", purchaseId: 0 },
          });
        },
      },
      {
        label: "Lista bierzących",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "PurchasesCurrent" });
        },
      },
    ],
  },
  // {
  //   label: "Klienci",
  //   icon: "pi pi-fw pi-users",
  //   disabled: !authorizationStore.hasAccessGoAhead,
  //   items: [
  //     {
  //       label: "Nowy",
  //       icon: "pi pi-fw pi-user-plus",
  //       command: () => {
  //         router.push({
  //           name: "Customer",
  //           params: { isEdit: "false", customerId: 0 },
  //         });
  //       },
  //     },
  //     {
  //       label: "Lista klientów",
  //       icon: "pi pi-fw pi-bars",
  //       command: () => {
  //         router.push({ name: "Customers" });
  //       },
  //     },
  //   ],
  // },
]);
</script>

<template>
  <div class="card relative z-2">
    <Menubar :model="items">
      <template #start>
        <img
          alt="logo"
          src="@/assets/HomeOffice.png"
          height="30"
          class="mr-2"
        />
      </template>
      <template #end>
        <div v-if="!authorizationStore.isAuthenticated">
          <router-link :to="{ name: 'login' }" style="text-decoration: none">
            <OfficeButton
              size="sm"
              class="my-2 ml-2 my-sm-0"
              btn-type="office"
              text="zaloguj się"
            />
          </router-link>
        </div>
        <div v-else>
          <OfficeButton
            size="sm"
            class="my-2 ml-2 my-sm-0"
            btn-type="office"
            text="wyloguj"
            :onclick="authorizationStore.logout"
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>
<style scoped>
/* Możesz również stylować inne elementy, takie jak aktywne elementy menu, podmenu itp. */
</style>
