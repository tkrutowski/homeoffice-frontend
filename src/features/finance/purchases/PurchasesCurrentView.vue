<script setup lang="ts">
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import PurchaseCurrentItemGroup from '@/features/finance/purchases/PurchaseCurrentItemGroup.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { computed, onMounted, ref, watch } from 'vue';
  import { PaymentStatus } from '@/features/finance/payments/types';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import BankCsvImportControl from '@/features/finance/transactions/BankCsvImportControl.vue';
  import { useToast } from 'primevue/usetoast';
  import type { Purchase } from '@/features/finance/purchases/types';
  import type { UserName } from '@/types/User.ts';
  import { useUsersStore } from '@/stores/users.ts';
  import { useAuthorizationStore } from '@/stores/authorization.ts';
  import { usePurchasesCurrentQuery } from '@/features/finance/purchases/queries/usePurchasesQueries';
  import { useUpdatePurchaseStatusMutation } from '@/features/finance/purchases/queries/usePurchasesMutations';
  import router from '@/router';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const toast = useToast();
  const userStore = useUsersStore();
  const authorizationStore = useAuthorizationStore();
  const updatePurchaseStatusMutation = useUpdatePurchaseStatusMutation();

  // Bez uprawnienia WRITE_ALL użytkownik może wybrać (i widzieć) tylko siebie — pole jest wtedy zablokowane.
  const canSelectAnyUser = computed(() => authorizationStore.hasAccessFinancePurchaseWriteAll);

  /** Ostatni wybrany użytkownik — po powrocie z formularza (router.back) odtwarzamy Select i odświeżamy dane */
  const PURCHASES_CURRENT_USER_STORAGE_KEY = 'purchasesCurrentSelectedUserId';

  const selectedUser = ref<UserName | null>(null);
  const purchasesToPay = ref<Purchase[]>([]);

  const userSelectOptions = computed<UserName[]>(() =>
    canSelectAnyUser.value ? userStore.userNames : userStore.loggedUserName ? [userStore.loggedUserName] : []
  );

  UtilsService.getTypesForFinance();
  onMounted(async () => {
    await Promise.all([
      userStore.userNames.length === 0 ? userStore.getUserNamesFromDb() : Promise.resolve(),
      userStore.loggedUserName ? Promise.resolve() : userStore.getLoggedUserNameFromDb(),
    ]);
    selectedUser.value = userStore.loggedUserName;
    await restorePurchasesCurrentUser();
  });

  const purchasesCurrentQuery = usePurchasesCurrentQuery(computed(() => selectedUser.value?.id ?? null));
  const purchasesCurrent = computed(() => purchasesCurrentQuery.data.value ?? new Map<string, Purchase[]>());
  const loadingCurrent = computed(() => purchasesCurrentQuery.isFetching.value);

  const totalAmount = computed(() => {
    let sum = 0;
    purchasesCurrent.value.forEach(purchases => {
      purchases.forEach(p => {
        sum += Number(p.amount);
      });
    });
    return sum;
  });

  const totalAmountToPay = computed(() => purchasesToPay.value.reduce((acc, p) => acc + Number(p.amount), 0));

  const selectedPurchaseIds = computed(() => purchasesToPay.value.map(p => p.id));

  function togglePurchaseToPay(purchase: Purchase) {
    const exists = purchasesToPay.value.some(p => p.id === purchase.id);
    if (exists) purchasesToPay.value = purchasesToPay.value.filter(p => p.id !== purchase.id);
    else purchasesToPay.value = [...purchasesToPay.value, purchase];
  }

  function removeFromSelection(purchaseId: number) {
    purchasesToPay.value = purchasesToPay.value.filter(p => p.id !== purchaseId);
  }

  async function restorePurchasesCurrentUser() {
    if (!canSelectAnyUser.value) return;
    const saved = sessionStorage.getItem(PURCHASES_CURRENT_USER_STORAGE_KEY);
    if (!saved) return;
    const savedId = Number(saved);
    const user = userStore.userNames.find((u: UserName) => u.id === savedId);
    if (!user) {
      sessionStorage.removeItem(PURCHASES_CURRENT_USER_STORAGE_KEY);
      return;
    }
    selectedUser.value = user;
    await getCurrentPurchaseByUser();
  }

  function onUserSelectChange() {
    purchasesToPay.value = [];
  }

  function goToNewPurchase() {
    if (selectedUser.value?.id) {
      sessionStorage.setItem(PURCHASES_CURRENT_USER_STORAGE_KEY, String(selectedUser.value.id));
    }
    router.push({ name: 'Purchase', params: { isEdit: 'false', purchaseId: 0 } });
  }

  //--------------------------------------GET PURCHASE
  async function getCurrentPurchaseByUser() {
    purchasesToPay.value = [];
    if (!selectedUser.value) return;
    await purchasesCurrentQuery.refetch();
    sessionStorage.setItem(PURCHASES_CURRENT_USER_STORAGE_KEY, String(selectedUser.value.id));
  }

  function onPurchasesImported() {
    if (selectedUser.value) void getCurrentPurchaseByUser();
  }

  //--------------------------------------ZAMIANA ZAZNACZONYCH ZAKUPÓW NA KREDYT
  function goToConvertSelectedToLoan() {
    if (purchasesToPay.value.length === 0) return;
    router.push({
      name: 'LoanFromPurchases',
      params: { purchaseIds: purchasesToPay.value.map(p => p.id).join(',') },
    });
  }

  async function applyUserIdFromRouteQuery() {
    const raw = route.query.userId;
    const rawUserId = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
    const userId = rawUserId ? Number(rawUserId) : null;
    if (!userId || Number.isNaN(userId)) return;
    // Bez WRITE_ALL nie wolno przełączyć się na cudzego usera przez ?userId= w URL.
    if (!canSelectAnyUser.value) return;

    if (userStore.userNames.length === 0) await userStore.getUserNamesFromDb();
    const user = userStore.userNames.find((u: UserName) => u.id === userId);
    if (user) {
      selectedUser.value = user;
      await getCurrentPurchaseByUser();
    }
    await router.replace({ name: 'PurchasesCurrent', query: {} });
  }

  watch(
    () => route.query.userId,
    q => {
      const raw = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : null;
      if (raw) void applyUserIdFromRouteQuery();
    },
    { immediate: true }
  );

  //
  //----------------------------------------PAY SELECTED-------------------------------------------
  //
  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const changeStatusConfirmationMessage = computed(() => {
    const purchasesToPaySnapshot = purchasesToPay.value;
    const amountAll = purchasesToPaySnapshot.reduce((acc: number, curr: Purchase) => acc + Number(curr.amount), 0);
    if (purchasesToPaySnapshot && purchasesToPaySnapshot.length > 0) {
      const purchaseNamesListHtml = `
      <ul style="padding-left: 20px; list-style-type: none;">
        ${purchasesToPaySnapshot
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
    const purchasesToPaySnapshot: Purchase[] = Array.of(...purchasesToPay.value);

    const results = await Promise.allSettled(
      purchasesToPaySnapshot.map((purchase: Purchase) =>
        updatePurchaseStatusMutation.mutateAsync({ purchaseId: purchase.id, status: newStatus })
      )
    );

    results.forEach((result, index) => {
      const purchase = purchasesToPaySnapshot[index];
      if (result.status === 'fulfilled') {
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

    purchasesToPay.value = [];
    showStatusChangeConfirmationDialog.value = false;
    console.log('END - submitMultiChangeStatus()');
  };
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitMultiChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />

  <MainPageShell :scroll-default-slot="false">
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
            <BankCsvImportControl @purchases-saved="onPurchasesImported" />
            <OfficeIconButton
              title="Zamień zaznaczone zakupy na kredyt"
              class="text-blue-500"
              icon="pi pi-sync"
              :btn-disabled="purchasesToPay.length == 0"
              @click="goToConvertSelectedToLoan"
            />
            <OfficeIconButton
              title="Odświerz listę zakupów"
              class="text-green-500"
              :icon="loadingCurrent ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
              :btn-disabled="selectedUser === null"
              @click="getCurrentPurchaseByUser"
            />
            <OfficeIconButton
              class="text-red-500"
              title="Oznacz wybrane zakupy jako opłacone."
              icon="pi pi-save"
              :btn-disabled="purchasesToPay.length == 0"
              @click="showStatusChangeConfirmationDialog = true"
            />
          </div>
        </template>

        <template #center>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <Select
              id="input-customer"
              v-model="selectedUser"
              :options="userSelectOptions"
              :option-label="user => user.firstName + ' ' + user.lastName"
              :loading="userStore.loadingUserNames || userStore.loadingLoggedUserName"
              :disabled="!canSelectAnyUser"
              @change="onUserSelectChange"
              required
            />
            <OfficeIconButton
              title="Wyszukaj zakupy dla wybranego użytkownika"
              class="text-orange-500"
              icon="pi pi-search"
              :btn-disabled="loadingCurrent || selectedUser === null"
              :loading="loadingCurrent"
              @click="getCurrentPurchaseByUser"
            />
          </div>
        </template>

        <template #end>
          <div class="flex flex-col text-sm">
            <p class="mb-1">
              <small>Zaznaczone:</small>
              {{ UtilsService.formatCurrency(totalAmountToPay) }}
            </p>
            <p class="mb-1">
              RAZEM:
              {{ UtilsService.formatCurrency(totalAmount) }}
            </p>
          </div>
        </template>
      </Toolbar>
      <div class="mx-6 min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden py-2">
        <div v-for="[key] in purchasesCurrent" :key="key">
          <PurchaseCurrentItemGroup
            :deadline-date="key"
            :purchases="purchasesCurrent.get(key) ?? []"
            :selected-purchase-ids="selectedPurchaseIds"
            :on-toggle-selection="togglePurchaseToPay"
            :on-remove-from-selection="removeFromSelection"
          />
        </div>
        <h1 v-if="purchasesCurrent.size === 0" class="flex justify-center mt-5 mb-5">Wszystko spłacone</h1>
      </div>
    </div>
  </MainPageShell>
</template>
