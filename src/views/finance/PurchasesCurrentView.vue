<script setup lang="ts">
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import PurchaseCurrentItemGroup from '@/components/finance/PurchaseCurrentItemGroup.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { usePurchasesStore } from '@/stores/purchases';
  import { computed, onMounted, ref, watch } from 'vue';
  import { PaymentStatus } from '@/types/Payment';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useToast } from 'primevue/usetoast';
  import type { Purchase } from '@/types/Purchase.ts';
  import type { User } from '@/types/User.ts';
  import { useUsersStore } from '@/stores/users.ts';
  import router from '@/router';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const purchasesStore = usePurchasesStore();
  const toast = useToast();
  const userStore = useUsersStore();

  /** Ostatnia osoba z listy „bieżących” — po powrocie z formularza (router.back) odtwarzamy Select i odświeżamy dane */
  const PURCHASES_CURRENT_USER_STORAGE_KEY = 'purchasesCurrentSelectedUsername';

  UtilsService.getTypesForFinance();
  onMounted(async () => {
    purchasesStore.clearPurchasesToPay();
    if (userStore.users.length <= 0) await userStore.getUsersFromDb();
    await restorePurchasesCurrentUser();
  });
  const selectedUser = ref<User | null>(userStore.getLoggedUser);
  const purchases = ref<Map<string, Purchase[]>>(new Map<string, Purchase[]>());

  async function restorePurchasesCurrentUser() {
    const saved = sessionStorage.getItem(PURCHASES_CURRENT_USER_STORAGE_KEY);
    if (!saved) return;
    const user = userStore.users.find((u: User) => u.username === saved);
    if (!user) {
      sessionStorage.removeItem(PURCHASES_CURRENT_USER_STORAGE_KEY);
      return;
    }
    selectedUser.value = user;
    await getCurrentPurchaseByUser();
  }

  function onUserSelectChange() {
    purchases.value.clear();
    purchasesStore.clearPurchasesCurrentMap();
  }

  function goToNewPurchase() {
    if (selectedUser.value?.username) {
      sessionStorage.setItem(PURCHASES_CURRENT_USER_STORAGE_KEY, selectedUser.value.username);
    }
    purchasesStore.setPurchaseAddContext({
      origin: 'current',
      currentListUserId: selectedUser.value?.id ?? null,
    });
    router.push({ name: 'Purchase', params: { isEdit: 'false', purchaseId: 0 } });
  }

  //--------------------------------------GET PURCHASE
  async function getCurrentPurchaseByUser() {
    purchases.value.clear();
    if (selectedUser.value) {
      purchases.value = await purchasesStore.getPurchaseCurrentFromDb(selectedUser.value?.username);
      sessionStorage.setItem(PURCHASES_CURRENT_USER_STORAGE_KEY, selectedUser.value.username);
    }
  }

  async function applyUsernameFromRouteQuery() {
    const raw = route.query.username;
    const username = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
    if (!username || typeof username !== 'string') return;

    if (userStore.users.length === 0) await userStore.getUsersFromDb();
    const user = userStore.users.find((u: User) => u.username === username);
    if (user) {
      selectedUser.value = user;
      await getCurrentPurchaseByUser();
    }
    await router.replace({ name: 'PurchasesCurrent', query: {} });
  }

  watch(
    () => route.query.username,
    q => {
      const username = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : null;
      if (username) void applyUsernameFromRouteQuery();
    },
    { immediate: true }
  );

  //
  //----------------------------------------PAY SELECTED-------------------------------------------
  //
  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const changeStatusConfirmationMessage = computed(() => {
    const purchasesToPay = purchasesStore.purchasesToPay;
    const amountAll = purchasesToPay.reduce((acc: number, curr: Purchase) => acc + Number(curr.amount), 0);
    console.log('amountAll', amountAll);
    if (purchasesToPay && purchasesToPay.length > 0) {
      const purchaseNamesListHtml = `
      <ul style="padding-left: 20px; list-style-type: none;">
        ${purchasesToPay
          .map(
            purchase =>
              `<li style="text-indent: -20px; margin-left: 50px;">- ${purchase.name}: ${UtilsService.formatCurrency(purchase.amount)}</li>`
          )
          .join('')}
        </BR>
        <li style="text-indent: -30px; margin-left: 50px;">RAZEM: ${UtilsService.formatCurrency(amountAll)}</li>
      </ul>
    `;

      return `Czy chcesz oznaczyć poniższe zakupy jako <b>spłacone</b>?${purchaseNamesListHtml}`;
    }
    return 'No message';
  });
  const submitMultiChangeStatus = async () => {
    console.log('START - submitMultiChangeStatus()');
    let newStatus: PaymentStatus = PaymentStatus.PAID;
    const purchasesToPay: Purchase[] = Array.of(...purchasesStore.purchasesToPay);

    const results: Awaited<true | false>[] = await Promise.all(
      purchasesToPay.map((purchase: Purchase) => purchasesStore.payForPurchaseDb(purchase.id, newStatus))
    );

    console.log('RESULTS:', results);
    results.forEach((result: boolean, index: number) => {
      const purchase = purchasesToPay[index];
      if (result) {
        purchasesStore.delPurchaseToPay(purchase);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Oznaczono jako spłacony zakup: ' + purchase.name,
          life: 3000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Niepowodzenie',
          detail: 'NIE oznaczono jako spłacony zakup: ' + purchase.name,
          life: 3000,
        });
      }
    });
    showStatusChangeConfirmationDialog.value = false;
    console.log('END - submitMultiChangeStatus()');
  };
</script>

<template>
  <div class="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden">
    <TheMenuFinance class="shrink-0" />
    <ConfirmationDialog
      v-model:visible="showStatusChangeConfirmationDialog"
      :msg="changeStatusConfirmationMessage"
      @save="submitMultiChangeStatus"
      @cancel="showStatusChangeConfirmationDialog = false"
    />
    <Toolbar
      class="shrink-0 border-b border-surface-200 bg-surface-0 px-6 py-2 dark:border-surface-700 dark:bg-surface-950"
    >
      <template #start>
        <div class="flex flex-row items-center gap-1">
          <OfficeIconButton
            class="text-amber-500"
            title="Dodaj nowy zakup."
            icon="pi pi-plus"
            @click="goToNewPurchase"
          />
          <OfficeIconButton
            title="Odświerz listę zakupów"
            class="text-green-500"
            :icon="purchasesStore.loadingPurchases ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
            :btn-disabled="selectedUser === null"
            @click="getCurrentPurchaseByUser"
          />
          <OfficeIconButton
            class="text-red-500"
            title="Oznacz wybrane zakupy jako opłacone."
            icon="pi pi-save"
            :btn-disabled="purchasesStore.purchasesToPay.length == 0"
            @click="showStatusChangeConfirmationDialog = true"
          />
        </div>
      </template>

      <template #center>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Select
            id="input-customer"
            v-model="selectedUser"
            :options="userStore.getUserByPrivileges"
            :option-label="user => user.firstName + ' ' + user.lastName"
            :loading="userStore.loadingUsers"
            @change="onUserSelectChange"
            required
          />
          <OfficeIconButton
            title="Wyszukaj zakupy dla wybranego użytkownika"
            class="text-orange-500"
            icon="pi pi-search"
            :btn-disabled="purchasesStore.loadingPurchases || selectedUser === null"
            :loading="purchasesStore.loadingPurchases"
            @click="getCurrentPurchaseByUser"
          />
        </div>
      </template>

      <template #end>
        <div class="flex flex-col text-sm">
          <p class="mb-1">
            <small>Zaznaczone:</small>
            {{ UtilsService.formatCurrency(purchasesStore.totalAmountToPay) }}
          </p>
          <p class="mb-1">
            RAZEM:
            {{ UtilsService.formatCurrency(purchasesStore.totalAmount) }}
          </p>
        </div>
      </template>
    </Toolbar>
    <div class="mx-6 min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden py-2">
      <div v-for="[key] in purchasesStore.purchasesCurrent" :key="key">
        <PurchaseCurrentItemGroup :deadline-date="key" />
      </div>
      <h1 v-if="purchasesStore.purchasesCurrent.size === 0" class="flex justify-center mt-5 mb-5">Wszystko spłacone</h1>
    </div>
  </div>
</template>
