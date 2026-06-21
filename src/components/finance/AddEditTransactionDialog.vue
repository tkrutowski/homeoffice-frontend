<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import moment from 'moment';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import { useBankTransactionsStore } from '@/stores/bankTransactions';
  import { useFirmsStore } from '@/stores/firms';
  import { useUsersStore } from '@/stores/users';
  import type {
    BankTransaction,
    BankTransactionCreatePayload,
    TransactionCategoryCreatePayload,
    TransactionCategoryDto,
  } from '@/types/BankTransaction';
  import type { Firm } from '@/types/Firm';
  import { ptDatePickerField, ptFieldInputText, ptSelectInField } from '@/config/formFieldPt';
  import AddFirmDialog from '@/components/share/AddFirmDialog.vue';
  import AddTransactionCategoryDialog from '@/components/finance/AddTransactionCategoryDialog.vue';
  import TransactionCategorySelect from '@/components/finance/TransactionCategorySelect.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { UtilsService } from '@/service/UtilsService';

  const props = defineProps<{
    visible: boolean;
    editTransaction?: BankTransaction | null;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    saved: [];
  }>();

  const bankStore = useBankTransactionsStore();
  const firmStore = useFirmsStore();
  const usersStore = useUsersStore();
  const toast = useToast();

  const keepOpen = ref(false);
  const submitted = ref(false);
  const saving = ref(false);
  const showNewFirmModal = ref(false);
  const showNewLabelModal = ref(false);
  const showNewCategoryModal = ref(false);

  const selectedCategory = ref<TransactionCategoryDto | null>(null);
  const selectedLabels = ref<{ id: number; name: string }[]>([]);
  const selectedFirm = ref<Firm | null>(null);
  const transactionDate = ref<Date>(new Date());
  const description = ref('');
  const amount = ref<number | null>(0);

  const isEdit = computed(() => !!props.editTransaction?.id);
  const dialogTitle = computed(() => (isEdit.value ? 'Edytuj transakcję' : 'Dodaj transakcję'));
  const showErrorFirm = computed(() => submitted.value && !selectedFirm.value);

  const fieldControlPt = {
    root: {
      class:
        'h-[2.75rem] w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };

  const ptDatePickerAligned = {
    ...ptDatePickerField,
    pcInputText: fieldControlPt,
  };

  const ptFieldInputAligned = {
    ...ptFieldInputText,
    root: fieldControlPt.root,
  };

  const ptSelectAligned = {
    ...ptSelectInField,
    root: {
      class: 'flex h-full min-w-0 flex-1 rounded-none border-0 shadow-none',
    },
  };

  function resetForm() {
    selectedCategory.value = null;
    selectedLabels.value = [];
    selectedFirm.value = null;
    transactionDate.value = new Date();
    description.value = '';
    amount.value = 0;
    submitted.value = false;
  }

  function fillFromTransaction(t: BankTransaction) {
    selectedCategory.value = t.transactionCategory ? bankStore.resolveTransactionCategory(t.transactionCategory) : null;
    selectedLabels.value = t.transactionLabel ? [...t.transactionLabel] : [];
    selectedFirm.value = firmStore.getFirm(t.idFirm);
    transactionDate.value = t.transactionDate ? moment(t.transactionDate).toDate() : new Date();
    description.value = t.description ?? '';
    amount.value = Number(t.amount);
  }

  watch(
    () => props.visible,
    v => {
      if (v) {
        if (firmStore.firms.length === 0) void firmStore.getFirmsFromDb();
        if (bankStore.categories.length === 0) void bankStore.getCategoriesFromDb();
        if (props.editTransaction) fillFromTransaction(props.editTransaction);
        else resetForm();
      }
    }
  );

  watch(
    () => props.editTransaction,
    t => {
      if (props.visible && t) fillFromTransaction(t);
    }
  );

  function close() {
    emit('update:visible', false);
    if (!keepOpen.value) resetForm();
  }

  function onVisibleChange(v: boolean) {
    emit('update:visible', v);
    if (!v) resetForm();
  }

  function isInvalid() {
    return !selectedCategory.value || !selectedFirm.value || amount.value === null || amount.value === undefined;
  }

  async function newFirm(firm: Firm) {
    showNewFirmModal.value = false;
    try {
      await firmStore.addFirmDb(firm);
      const created = firmStore.firms.find(f => f.name === firm.name) ?? firmStore.firms.at(-1) ?? null;
      if (created) selectedFirm.value = created;
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano firmę: ' + firm.name,
        life: 3000,
      });
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania firmy.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać firmy.',
        life: 5000,
      });
    }
  }

  async function newCategory(payload: TransactionCategoryCreatePayload) {
    showNewCategoryModal.value = false;
    try {
      const created = await bankStore.addCategoryDb(payload);
      selectedCategory.value = created;
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano kategorię: ' + created.name,
        life: 3000,
      });
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania kategorii.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać kategorii.',
        life: 5000,
      });
    }
  }

  async function newLabel(name: string) {
    showNewLabelModal.value = false;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const created = await bankStore.addLabelDb(trimmed);
      if (!selectedLabels.value.some(l => l.id === created.id)) {
        selectedLabels.value = [...selectedLabels.value, created];
      }
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano etykietę: ' + created.name,
        life: 3000,
      });
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania etykiety.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać etykiety.',
        life: 5000,
      });
    }
  }

  async function save() {
    submitted.value = true;
    if (isInvalid()) {
      toast.add({ severity: 'error', summary: 'Błąd', detail: 'Uzupełnij wymagane pola.', life: 4000 });
      return;
    }

    const loggedUser = usersStore.getLoggedUser;
    const payload: BankTransactionCreatePayload = {
      idFirm: selectedFirm.value!.id,
      idUser: props.editTransaction?.idUser ?? loggedUser?.id,
      purchaseId: props.editTransaction?.purchaseId ?? null,
      description: description.value,
      transactionDate: moment(transactionDate.value).format('YYYY-MM-DD'),
      amount: String(amount.value),
      transactionCategory: selectedCategory.value!,
      transactionLabel: selectedLabels.value,
    };

    saving.value = true;
    try {
      if (isEdit.value && props.editTransaction) {
        await bankStore.updateTransactionDb({ ...payload, id: props.editTransaction.id });
        toast.add({ severity: 'success', summary: 'Zapisano', detail: 'Transakcja zaktualizowana.', life: 3000 });
      } else {
        await bankStore.addTransactionDb(payload);
        toast.add({ severity: 'success', summary: 'Dodano', detail: 'Transakcja dodana.', life: 3000 });
      }
      emit('saved');
      if (keepOpen.value && !isEdit.value) {
        description.value = '';
        amount.value = 0;
        submitted.value = false;
      } else {
        close();
      }
    } catch {
      toast.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się zapisać transakcji.', life: 4000 });
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <AddFirmDialog v-model:visible="showNewFirmModal" @save="newFirm" @cancel="showNewFirmModal = false" />

  <AddTransactionCategoryDialog
    v-model:visible="showNewCategoryModal"
    @save="newCategory"
    @cancel="showNewCategoryModal = false"
  />

  <AddDialog
    v-model:visible="showNewLabelModal"
    msg="Nowa etykieta"
    label1="Nazwa etykiety"
    @save="newLabel"
    @cancel="showNewLabelModal = false"
  />

  <Dialog
    :visible="visible"
    :modal="false"
    position="top"
    :header="dialogTitle"
    class="w-full max-w-[min(96rem,calc(100vw-2rem))]"
    :pt="{
      root: { class: 'border border-surface-200 dark:border-surface-700 shadow-lg' },
      header: { class: 'bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700' },
      content: { class: 'bg-surface-0 dark:bg-surface-950 pb-1' },
      footer: { class: 'bg-surface-0 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-700 pt-4' },
    }"
    @update:visible="onVisibleChange"
  >
    <div class="flex flex-wrap items-start gap-4 pt-4">
      <div class="flex min-w-[12rem] flex-1 flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Kategoria</label>
        <div class="flex h-[2.75rem] items-center gap-2">
          <div
            class="flex h-full min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
            :class="{ 'border-red-500 dark:border-red-400': submitted && !selectedCategory }"
          >
            <TransactionCategorySelect
              v-model="selectedCategory"
              :categories="bankStore.categories"
              :loading="bankStore.loadingCategories"
              :invalid="submitted && !selectedCategory"
            />
          </div>
          <OfficeIconButton
            title="Dodaj kategorię"
            :icon="bankStore.loadingCategories ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
            class="h-9 w-9 shrink-0 border border-surface-300 bg-surface-50 p-0 text-surface-500 hover:border-primary hover:text-surface-900 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400 dark:hover:text-surface-0"
            @click="showNewCategoryModal = true"
          />
        </div>
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">
          {{ submitted && !selectedCategory ? 'Pole jest wymagane.' : '\u00a0' }}
        </small>
      </div>

      <div class="flex min-w-[9rem] flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Data</label>
        <DatePicker v-model="transactionDate" date-format="dd/mm/yy" class="w-full" :pt="ptDatePickerAligned" />
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">&nbsp;</small>
      </div>

      <div class="flex min-w-[12rem] flex-[2] flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Notatka (opcjonalnie)</label>
        <InputText v-model="description" placeholder="Wpisz notatkę" class="w-full" :pt="ptFieldInputAligned" />
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">&nbsp;</small>
      </div>

      <div class="flex min-w-[10rem] flex-1 flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Etykiety (opcjonalnie)</label>
        <div class="flex h-[2.75rem] items-center gap-2">
          <div
            class="flex h-full min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
          >
            <MultiSelect
              v-model="selectedLabels"
              :options="bankStore.labels"
              option-label="name"
              placeholder="Wybierz etykiety…"
              :loading="bankStore.loadingLabels"
              filter
              filter-placeholder="Szukaj…"
              class="h-full min-w-0 flex-1"
              :pt="ptSelectAligned"
            />
          </div>
          <OfficeIconButton
            title="Dodaj etykietę"
            :icon="bankStore.loadingLabels ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
            class="h-9 w-9 shrink-0 border border-surface-300 bg-surface-50 p-0 text-surface-500 hover:border-primary hover:text-surface-900 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400 dark:hover:text-surface-0"
            @click="showNewLabelModal = true"
          />
        </div>
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">&nbsp;</small>
      </div>

      <div class="flex min-w-[10rem] flex-1 flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Firma</label>
        <div class="flex h-[2.75rem] items-center gap-2">
          <div
            class="flex h-full min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-50 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
            :class="{ 'border-red-500 dark:border-red-400': showErrorFirm }"
          >
            <Select
              v-model="selectedFirm"
              :options="firmStore.firms"
              option-label="name"
              placeholder="Wybierz firmę…"
              :loading="firmStore.loadingFirms"
              filter
              filter-placeholder="Szukaj…"
              :invalid="showErrorFirm"
              class="h-full min-w-0 flex-1"
              :pt="ptSelectAligned"
            />
          </div>
          <OfficeIconButton
            title="Dodaj firmę"
            :icon="firmStore.loadingFirms ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
            class="h-9 w-9 shrink-0 border border-surface-300 bg-surface-50 p-0 text-surface-500 hover:border-primary hover:text-surface-900 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400 dark:hover:text-surface-0"
            @click="showNewFirmModal = true"
          />
        </div>
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">
          {{ showErrorFirm ? 'Pole jest wymagane.' : '\u00a0' }}
        </small>
      </div>

      <div class="flex min-w-[8rem] flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Kwota</label>
        <InputNumber
          v-model="amount"
          mode="decimal"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          :invalid="submitted && (amount === null || amount === undefined)"
          class="w-full"
          :pt="{ pcInputText: fieldControlPt }"
          input-class="h-full w-full text-right"
          @focus="UtilsService.selectText"
        />
        <small class="min-h-[1rem] text-xs text-red-600 dark:text-red-400">&nbsp;</small>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-3">
        <div v-if="!isEdit" class="flex items-center gap-2">
          <Checkbox v-model="keepOpen" input-id="keep-open" binary />
          <label for="keep-open" class="text-sm text-surface-600 dark:text-surface-400">
            Zostaw otwarte, aby dodać kolejne
          </label>
        </div>
        <div v-else />

        <div class="flex gap-2">
          <Button label="Anuluj" severity="secondary" outlined @click="close" />
          <Button :label="isEdit ? 'Zapisz' : 'Dodaj transakcję'" :loading="saving" @click="save" />
        </div>
      </div>
    </template>
  </Dialog>
</template>
