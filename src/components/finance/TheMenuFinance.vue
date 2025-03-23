<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuthorizationStore} from '@/stores/authorization.ts'
import router from '@/router'
import {useRoute} from 'vue-router';
import {useLoansStore} from "@/stores/loans.ts";
import {useFeeStore} from "@/stores/fee.ts";
import {usePaymentStore} from "@/stores/payments.ts";
import {useCardsStore} from "@/stores/cards.ts";
import OfficeIconButton from "@/components/OfficeIconButton.vue";

const loansStore = useLoansStore()
const feeStore = useFeeStore()
const paymentStore = usePaymentStore()
const cardsStore = useCardsStore()
const route = useRoute();
const authorizationStore = useAuthorizationStore()

const activeMenu = computed(() => {
  console.log('activeMenu', route.path)
  if (route.path.includes('/home')) return 'dashboard';
  if (route.path.includes('/finance/loan')) return 'loan';
  if (route.path.includes('/finance/fee')) return 'fee';
  if (route.path.includes('/finance/payment')) return 'payment';
  if (route.path.includes('/finance/purchase')) return 'purchase';
  if (route.path.includes('/finance/card')) return 'card';
  if (route.path.includes('/finance/firm')) return 'firm';
  return null; // Jeśli nie pasuje do żadnego menu
});

const allLoading = computed(() => {
  return loansStore.loadingLoans || feeStore.loadingFees || paymentStore.loadingPayments || cardsStore.loadingCards
});

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    // disabled: !authorizationStore.hasAccessFinance,
    // to: { name: "Home" },
    command: () => {
      router.push({name: 'Home'})
    },
  },
  {
    label: 'Tablica',
    icon: 'pi pi-fw pi-clipboard',
    class: `${activeMenu.value === 'dashboard' ? 'active' : ''}`,
    // disabled: !authorizationStore.hasAccessLibrary,
    // to: { name: "Home" },
    // command: () => {
    //   router.push({ name: "LibraryHome" });
    // },
  },
  {
    label: 'Kredyty',
    icon: 'pi pi-fw pi-euro',
    class: `${activeMenu.value === 'loan' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinanceLoan,
    items: [
      {
        label: 'Nowy kredyt',
        icon: 'pi pi-fw pi-file',
        command: () => {
          router.push({
            name: 'Loan',
            params: {isEdit: 'false', loanId: 0},
          })
        },
      },
      {
        label: 'Lista kredytów',
        icon: 'pi pi-fw pi-list',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'Loans'}).href)) {
            const redirect = JSON.stringify({name: 'Loans'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'Loans'})
          }
        },
      },
    ],
  },
  {
    label: 'Opłaty',
    icon: 'pi pi-fw pi-euro',
    class: `${activeMenu.value === 'fee' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinanceFee,
    items: [
      {
        label: 'Nowa opłata',
        icon: 'pi pi-fw pi-file',
        command: () => {
          router.push({
            name: 'Fee',
            params: {isEdit: 'false', feeId: 0},
          })
        },
      },
      {
        label: 'Lista opłat',
        icon: 'pi pi-fw pi-list',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'Fees'}).href)) {
            const redirect = JSON.stringify({name: 'Fees'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'Fees'})
          }
        },
      },
    ],
  },
  {
    label: 'Płatności',
    icon: 'pi pi-fw pi-euro',
    class: `${activeMenu.value === 'payment' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinancePayment,
    items: [
      {
        label: 'Lista płatności',
        icon: 'pi pi-fw pi-list',
        command: () => {
          router.push({name: 'Payments'})
        },
      },
    ],
  },
  {
    label: 'Zakupy',
    icon: 'pi pi-fw pi-euro',
    class: `${activeMenu.value === 'purchase' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinancePurchase,
    items: [
      {
        label: 'Nowy zakup',
        icon: 'pi pi-fw pi-file',
        command: () => {
          router.push({
            name: 'Purchase',
            params: {isEdit: 'false', purchaseId: 0},
          })
        },
      },
      {
        label: 'Lista bierzących',
        icon: 'pi pi-fw pi-list',
        command: () => {
          router.push({name: 'PurchasesCurrent'})
        },
      },
    ],
  },
  {
    label: 'Karty',
    icon: 'pi pi-fw pi-credit-card',
    class: `${activeMenu.value === 'card' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinanceFee,
    items: [
      {
        label: 'Nowa karta',
        icon: 'pi pi-fw pi-file',
        command: () => {
          router.push({
            name: 'Card',
            params: {isEdit: 'false', cardId: 0},
          })
        },
      },
      {
        label: 'Lista kart',
        icon: 'pi pi-fw pi-list',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'Cards'}).href)) {
            const redirect = JSON.stringify({name: 'Cards'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'Cards'})
          }
        },
      },
    ],
  },
  {
    label: 'Firmy',
    icon: 'pi pi-fw pi-building',
    class: `${activeMenu.value === 'firm' ? 'active' : ''}`,
    disabled: !authorizationStore.hasAccessFinanceFirm,
    items: [
      {
        label: 'Nowa firma',
        icon: 'pi pi-fw pi-file',
        command: () => {
          router.push({
            name: 'Firm',
            params: {isEdit: 'false', firmId: 0},
          })
        },
      },
      {
        label: 'Lista firm',
        icon: 'pi pi-fw pi-list',
        command: () => {
          if (window.location.href.includes(router.resolve({name: 'Firms'}).href)) {
            const redirect = JSON.stringify({name: 'Firms'})
            router.push({path: '/refresh', query: {redirect: redirect}})
          } else {
            router.push({name: 'Firms'})
          }
        },
      },
    ],
  },
])
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <img alt="logo" src="@/assets/logo_mini.png" height="30" class="mr-2"/>
    </template>
    <template #end>
      <div class="flex flex-row gap-4">
        <OfficeIconButton class="cursor-default" icon="pi pi-check-square" severity="success" :loading="allLoading"
                          title="Określa, czy wyświetlane dane są aktualne."/>
        <div v-if="!authorizationStore.isAuthenticatedOrToken">
          <router-link :to="{ name: 'login' }" style="text-decoration: none">
            <Button class="font-bold uppercase tracking-wider" size="small" outlined>zaloguj</Button>
          </router-link>
        </div>
        <div v-else>
          <Button
              class="font-bold uppercase tracking-wider"
              icon="pi pi-power-off"
              outlined
              label="wyloguj"
              icon-pos="right"
              :onclick="authorizationStore.logout"
          />
        </div>

      </div>
    </template>
  </Menubar>
</template>
