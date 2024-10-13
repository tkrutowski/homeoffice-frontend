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
    // disabled: !authorizationStore.hasAccessFinance,
    // to: { name: "Home" },
    command: () => {
      router.push({ name: "Home" });
    },
  },
  {
    label: "Tablica",
    icon: "pi pi-fw pi-clipboard",
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    // command: () => {
    //   router.push({ name: "LibraryHome" });
    // },
  },
  {
    label: "Kredyty",
    icon: "pi pi-fw pi-euro",
    disabled: !authorizationStore.hasAccessFinanceLoan,
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
    disabled: !authorizationStore.hasAccessFinanceFee,
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
    disabled: !authorizationStore.hasAccessFinancePayment,
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
    disabled: !authorizationStore.hasAccessFinancePurchase,
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
  }, {
    label: "Karty",
    icon: "pi pi-fw pi-credit-card",
    disabled: !authorizationStore.hasAccessFinanceFee,
    items: [
      {
        label: "Nowa karta",
        icon: "pi pi-fw pi-file",
        // to: { name: "Invoice", params: { isEdit: "false", invoiceId: 0 } },
        command: () => {
          router.push({
            name: "Card",
            params: { isEdit: "false", cardId: 0 },
          });
        },
      },
      {
        label: "Lista kart",
        icon: "pi pi-fw pi-list",
        // to: { name: "Invoices" },
        command: () => {
          router.push({ name: "Cards" });
        },
      },
    ],
  },
]);
</script>

<template>
  <Menubar :model="items" class="main-menu">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2" />
    </template>
    <template #end>
      <div v-if="!authorizationStore.isAuthenticatedOrToken">
        <router-link :to="{ name: 'login' }" style="text-decoration: none">
          <OfficeButton
            size="sm"
            class="my-2 ml-2 my-sm-0"
            btn-type="office-regular"
            text="zaloguj się"
          />
        </router-link>
      </div>
      <div v-else>
        <OfficeButton
          size="sm"
          class="my-2 ml-2 my-sm-0"
          btn-type="office-regular"
          text="wyloguj"
          :onclick="authorizationStore.logout"
        />
      </div>
    </template>
  </Menubar>
</template>
<style scoped></style>
