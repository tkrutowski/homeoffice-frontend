<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import moment from 'moment';
  import { storeToRefs } from 'pinia';
  import { useToast } from 'primevue/usetoast';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import TransactionCategorySelect from '@/components/finance/TransactionCategorySelect.vue';
  import { useBankCsvImportStore } from '@/stores/bankCsvImport';
  import { useBankTransactionsStore } from '@/stores/bankTransactions';
  import { useFirmsStore } from '@/stores/firms';
  import { useUsersStore } from '@/stores/users';
  import { useCardsStore } from '@/stores/cards';
  import { UtilsService } from '@/service/UtilsService';
  import { TransactionType } from '@/types/BankTransaction';
  import type { BankTransactionImportRow, PurchaseImportRow } from '@/types/BankCsvImport';
  import { ptDatePickerField, ptSelectInField } from '@/config/formFieldPt';

  const emit = defineEmits<{
    'transactions-saved': [];
    'purchases-saved': [];
  }>();

  const toast = useToast();
  const importStore = useBankCsvImportStore();
  const bankStore = useBankTransactionsStore();
  const firmsStore = useFirmsStore();
  const usersStore = useUsersStore();
  const cardsStore = useCardsStore();

  const {
    status,
    isBusy,
    isReady,
    reviewDialogVisible,
    importResult,
    transactionRows,
    purchaseRows,
    selectedTransactions,
    selectedPurchases,
    savingTransactions,
    savingPurchases,
    lastTransactionSaveSummary,
    lastPurchaseSaveSummary,
    errorMessage,
  } = storeToRefs(importStore);

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const hideExistingRows = ref(false);

  const visibleTransactionRows = computed(() =>
    hideExistingRows.value ? transactionRows.value.filter(r => !r.exists) : transactionRows.value
  );

  const visiblePurchaseRows = computed(() =>
    hideExistingRows.value ? purchaseRows.value.filter(r => !r.exists) : purchaseRows.value
  );

  const transactionTypeOptions = Object.values(TransactionType).map(value => ({
    value,
    label: UtilsService.formatTransactionType(value),
  }));

  const sortedFirms = computed(() => [...firmsStore.firms].sort((a, b) => a.name.localeCompare(b.name)));
  const sortedUsers = computed(() =>
    [...usersStore.users].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    )
  );
  const sortedCards = computed(() => [...cardsStore.cards].sort((a, b) => a.name.localeCompare(b.name)));

  const ptCellSelect = {
    ...ptSelectInField,
    root: { class: 'h-9 min-w-[8rem] w-full border-0 shadow-none' },
  };

  const ptCellInput = {
    root: {
      class:
        'h-9 w-full min-w-[6rem] rounded-md border border-surface-300 bg-surface-0 px-2 text-sm ' +
        'dark:border-surface-600 dark:bg-surface-950',
    },
  };

  const ptCellDatePicker = {
    ...ptDatePickerField,
    pcInputText: ptCellInput,
  };

  function parseRowDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = moment(value, 'YYYY-MM-DD', true);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  function setTransactionDate(row: BankTransactionImportRow, date: Date | null) {
    row.transactionDate = date ? moment(date).format('YYYY-MM-DD') : '';
  }

  function setPurchaseDate(row: PurchaseImportRow, date: Date | null) {
    row.purchaseDate = date ? moment(date).format('YYYY-MM-DD') : '';
  }

  function rowClass(data: BankTransactionImportRow | PurchaseImportRow) {
    return data.exists ? 'opacity-60 bg-surface-100 dark:bg-surface-900' : '';
  }

  function isRowSelectable(data: BankTransactionImportRow | PurchaseImportRow) {
    return !data.exists;
  }

  async function loadDictionaries() {
    await Promise.all([
      firmsStore.firms.length === 0 ? firmsStore.getFirmsFromDb() : Promise.resolve(),
      usersStore.users.length === 0 ? usersStore.getUsersFromDb() : Promise.resolve(),
      cardsStore.cards.length === 0 ? cardsStore.getCardsFromDb('ALL') : Promise.resolve(),
      bankStore.categories.length === 0 ? bankStore.getCategoriesFromDb() : Promise.resolve(),
      bankStore.labels.length === 0 ? bankStore.getLabelsFromDb() : Promise.resolve(),
    ]);
  }

  watch(reviewDialogVisible, visible => {
    if (visible) {
      hideExistingRows.value = false;
      void loadDictionaries();
    }
  });

  watch(
    selectedTransactions,
    sel => {
      const filtered = sel.filter(r => !r.exists);
      if (filtered.length !== sel.length) {
        importStore.selectedTransactions = filtered;
      }
    },
    { deep: true }
  );

  watch(
    selectedPurchases,
    sel => {
      const filtered = sel.filter(r => !r.exists);
      if (filtered.length !== sel.length) {
        importStore.selectedPurchases = filtered;
      }
    },
    { deep: true }
  );

  watch(errorMessage, msg => {
    if (msg && status.value === 'error') {
      toast.add({ severity: 'error', summary: 'Import CSV', detail: msg, life: 5000 });
      importStore.clearImport();
    }
  });

  function onImportButtonClick() {
    if (isReady.value) {
      importStore.openReviewDialog();
      return;
    }
    if (!isBusy.value) {
      fileInputRef.value?.click();
    }
  }

  async function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    try {
      await importStore.startImport(file);
    } catch {
      // errorMessage watch shows toast and clears
    }
  }

  function showSaveToast(summary: { saved: number; failed: number; errors: string[] }, entityLabel: string) {
    if (summary.saved === 0 && summary.failed === 0 && summary.errors.length > 0) {
      toast.add({
        severity: 'warn',
        summary: entityLabel,
        detail: summary.errors[0],
        life: 5000,
      });
      return;
    }

    const severity = summary.failed > 0 ? 'warn' : 'success';
    toast.add({
      severity,
      summary: entityLabel,
      detail: `Zapisano: ${summary.saved}, błędy: ${summary.failed}`,
      life: 4000,
    });
  }

  async function saveTransactions() {
    const summary = await importStore.saveSelectedTransactions();
    showSaveToast(summary, 'Transakcje');
    if (summary.saved > 0) {
      emit('transactions-saved');
    }
  }

  async function savePurchases() {
    const summary = await importStore.saveSelectedPurchases();
    showSaveToast(summary, 'Zakupy');
    if (summary.saved > 0) {
      emit('purchases-saved');
    }
  }

  function finishImport() {
    importStore.clearImport();
  }

  function onDialogHide() {
    importStore.closeReviewDialog();
  }
</script>

<template>
  <input
    ref="fileInputRef"
    type="file"
    accept=".csv"
    class="hidden"
    aria-hidden="true"
    tabindex="-1"
    @change="onFileSelected"
  />

  <OfficeIconButton
    class="text-primary"
    title="Importuj transakcje/zakupy z pliku CSV Millenium Bank"
    icon="pi pi-upload"
    :loading="isBusy"
    :btn-disabled="isBusy"
    :attention="isReady"
    @click="onImportButtonClick"
  />

  <Dialog
    v-model:visible="reviewDialogVisible"
    header="Podgląd importu CSV Millenium Bank"
    :style="{ width: '90vw' }"
    :pt="{
      root: { class: 'border border-surface-200 dark:border-surface-700' },
      header: { class: 'bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700' },
      content: { class: 'bg-surface-0 dark:bg-surface-950' },
      footer: { class: 'bg-surface-0 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-700' },
    }"
    @hide="onDialogHide"
  >
    <div v-if="importResult" class="flex flex-col gap-6 py-2">
      <div
        class="grid gap-2 rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm dark:border-surface-700 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-4"
      >
        <p>
          <span class="text-surface-600 dark:text-surface-400">Przetworzono:</span>
          <span class="ml-2 font-medium tabular-nums">{{ importResult.totalProcessed }}</span>
        </p>
        <p>
          <span class="text-surface-600 dark:text-surface-400">Transakcje:</span>
          <span class="ml-2 font-medium tabular-nums">{{ importResult.transactionCount }}</span>
        </p>
        <p>
          <span class="text-surface-600 dark:text-surface-400">Zakupy:</span>
          <span class="ml-2 font-medium tabular-nums">{{ importResult.purchaseCount }}</span>
        </p>
        <p>
          <span class="text-surface-600 dark:text-surface-400">Duplikaty:</span>
          <span class="ml-2 font-medium tabular-nums">{{ importResult.duplicateCount }}</span>
        </p>
      </div>

      <Message v-for="(err, idx) in importResult.errors" :key="idx" severity="warn" class="w-full">
        {{ err }}
      </Message>

      <section class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-surface-800 dark:text-surface-100">Transakcje bankowe</h3>
          <div class="flex items-center gap-2">
            <Checkbox v-model="hideExistingRows" input-id="hide-existing-rows" binary />
            <label for="hide-existing-rows" class="cursor-pointer text-sm text-surface-600 dark:text-surface-400">
              Ukryj wiersze już w bazie
            </label>
          </div>
        </div>

        <p v-if="transactionRows.length === 0" class="text-sm text-surface-600 dark:text-surface-400">
          Brak transakcji do importu.
        </p>

        <p v-else-if="visibleTransactionRows.length === 0" class="text-sm text-surface-600 dark:text-surface-400">
          Wszystkie transakcje są już w bazie (ukryte).
        </p>

        <template v-else>
          <DataTable
            v-model:selection="selectedTransactions"
            :value="visibleTransactionRows"
            data-key="_rowKey"
            :meta-key-selection="false"
            :row-class="rowClass"
            :is-data-selectable="isRowSelectable"
            scrollable
            scroll-height="320px"
            size="small"
            class="border border-surface-200 dark:border-surface-700"
          >
            <Column selection-mode="multiple" header-style="width: 3rem" />

            <Column header="Firma" style="min-width: 10rem">
              <template #body="{ data }">
                <Select
                  v-model="data.idFirm"
                  :options="sortedFirms"
                  option-label="name"
                  option-value="id"
                  placeholder="Firma"
                  filter
                  filter-placeholder="Szukaj…"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Użytkownik" style="min-width: 10rem">
              <template #body="{ data }">
                <Select
                  v-model="data.idUser"
                  :options="sortedUsers"
                  :option-label="(u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`"
                  option-value="id"
                  placeholder="Użytkownik"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Opis" style="min-width: 12rem">
              <template #body="{ data }">
                <InputText v-model="data.description" :disabled="data.exists" class="w-full" :pt="ptCellInput" />
              </template>
            </Column>

            <Column header="Data" style="min-width: 9rem">
              <template #body="{ data }">
                <DatePicker
                  :model-value="parseRowDate(data.transactionDate)"
                  date-format="dd/mm/yy"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellDatePicker"
                  @update:model-value="setTransactionDate(data, $event as Date | null)"
                />
              </template>
            </Column>

            <Column header="Kwota" style="min-width: 8rem">
              <template #body="{ data }">
                <InputText v-model="data.amount" :disabled="data.exists" class="w-full text-right" :pt="ptCellInput" />
              </template>
            </Column>

            <Column header="Typ operacji" style="min-width: 11rem">
              <template #body="{ data }">
                <Select
                  v-model="data.transactionType"
                  :options="transactionTypeOptions"
                  option-label="label"
                  option-value="value"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Etykiety" style="min-width: 11rem">
              <template #body="{ data }">
                <MultiSelect
                  v-model="data.transactionLabel"
                  :options="bankStore.labels"
                  option-label="name"
                  placeholder="Etykiety"
                  filter
                  filter-placeholder="Szukaj…"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Kategoria" style="min-width: 12rem">
              <template #body="{ data }">
                <div
                  class="min-h-9 rounded-md border border-surface-300 bg-surface-0 dark:border-surface-600 dark:bg-surface-950"
                  :class="{ 'border-red-500 dark:border-red-400': !data.exists && !data.transactionCategory }"
                >
                  <TransactionCategorySelect
                    v-model="data.transactionCategory"
                    :categories="bankStore.categories"
                    :loading="bankStore.loadingCategories"
                    :invalid="!data.exists && !data.transactionCategory"
                  />
                </div>
              </template>
            </Column>

            <Column header="Saldo" style="min-width: 8rem">
              <template #body="{ data }">
                <InputText v-model="data.balance" :disabled="data.exists" class="w-full text-right" :pt="ptCellInput" />
              </template>
            </Column>
          </DataTable>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              label="Zapisz zaznaczone transakcje"
              icon="pi pi-save"
              size="small"
              :loading="savingTransactions"
              :disabled="savingTransactions || selectedTransactions.length === 0"
              @click="saveTransactions"
            />
            <Message
              v-if="lastTransactionSaveSummary"
              :severity="lastTransactionSaveSummary.failed > 0 ? 'warn' : 'success'"
              class="m-0 flex-1"
            >
              Zapisano: {{ lastTransactionSaveSummary.saved }}, błędy:
              {{ lastTransactionSaveSummary.failed }}
              <span v-if="lastTransactionSaveSummary.errors.length" class="mt-1 block text-xs">
                {{ lastTransactionSaveSummary.errors.slice(0, 3).join(' · ') }}
              </span>
            </Message>
          </div>
        </template>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="text-base font-semibold text-surface-800 dark:text-surface-100">Zakupy</h3>

        <p v-if="purchaseRows.length === 0" class="text-sm text-surface-600 dark:text-surface-400">
          Brak zakupów do importu.
        </p>

        <p v-else-if="visiblePurchaseRows.length === 0" class="text-sm text-surface-600 dark:text-surface-400">
          Wszystkie zakupy są już w bazie (ukryte).
        </p>

        <template v-else>
          <DataTable
            v-model:selection="selectedPurchases"
            :value="visiblePurchaseRows"
            data-key="_rowKey"
            :meta-key-selection="false"
            :row-class="rowClass"
            :is-data-selectable="isRowSelectable"
            scrollable
            scroll-height="320px"
            size="small"
            class="border border-surface-200 dark:border-surface-700"
          >
            <Column selection-mode="multiple" header-style="width: 3rem" />

            <Column header="Karta" style="min-width: 10rem">
              <template #body="{ data }">
                <Select
                  v-model="data.idCard"
                  :options="sortedCards"
                  option-label="name"
                  option-value="id"
                  placeholder="Karta"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Firma" style="min-width: 10rem">
              <template #body="{ data }">
                <Select
                  v-model="data.idFirm"
                  :options="sortedFirms"
                  option-label="name"
                  option-value="id"
                  placeholder="Firma"
                  filter
                  filter-placeholder="Szukaj…"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Użytkownik" style="min-width: 10rem">
              <template #body="{ data }">
                <Select
                  v-model="data.idUser"
                  :options="sortedUsers"
                  :option-label="(u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`"
                  option-value="id"
                  placeholder="Użytkownik"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellSelect"
                />
              </template>
            </Column>

            <Column header="Nazwa" style="min-width: 12rem">
              <template #body="{ data }">
                <InputText v-model="data.name" :disabled="data.exists" class="w-full" :pt="ptCellInput" />
              </template>
            </Column>

            <Column header="Data zakupu" style="min-width: 9rem">
              <template #body="{ data }">
                <DatePicker
                  :model-value="parseRowDate(data.purchaseDate)"
                  date-format="dd/mm/yy"
                  :disabled="data.exists"
                  class="w-full"
                  :pt="ptCellDatePicker"
                  @update:model-value="setPurchaseDate(data, $event as Date | null)"
                />
              </template>
            </Column>

            <Column header="Kwota" style="min-width: 8rem">
              <template #body="{ data }">
                <InputText v-model="data.amount" :disabled="data.exists" class="w-full text-right" :pt="ptCellInput" />
              </template>
            </Column>

            <Column header="Info" style="min-width: 12rem">
              <template #body="{ data }">
                <InputText v-model="data.otherInfo" :disabled="data.exists" class="w-full" :pt="ptCellInput" />
              </template>
            </Column>
          </DataTable>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              label="Zapisz zaznaczone zakupy"
              icon="pi pi-save"
              size="small"
              :loading="savingPurchases"
              :disabled="savingPurchases || selectedPurchases.length === 0"
              @click="savePurchases"
            />
            <Message
              v-if="lastPurchaseSaveSummary"
              :severity="lastPurchaseSaveSummary.failed > 0 ? 'warn' : 'success'"
              class="m-0 flex-1"
            >
              Zapisano: {{ lastPurchaseSaveSummary.saved }}, błędy: {{ lastPurchaseSaveSummary.failed }}
              <span v-if="lastPurchaseSaveSummary.errors.length" class="mt-1 block text-xs">
                {{ lastPurchaseSaveSummary.errors.slice(0, 3).join(' · ') }}
              </span>
            </Message>
          </div>
        </template>
      </section>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Gotowe" severity="secondary" outlined @click="finishImport" />
      </div>
    </template>
  </Dialog>
</template>
