import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useFirmsStore } from '@/stores/firms';
import type { Firm } from '@/types/Firm';
import type {
  TransactionCategoryCreatePayload,
  TransactionCategoryDto,
  TransactionLabelDto,
} from '@/features/finance/transactions/types';
import {
  useCreateTransactionCategoryMutation,
  useCreateTransactionLabelMutation,
} from '@/features/finance/transactions/queries/useTransactionsMutations';

/**
 * Wspólna logika szybkiego dodawania firmy/kategorii/etykiety transakcji z poziomu
 * przycisku "+" (używana w AddEditTransactionDialog i BankCsvImportControl).
 * Odpowiada za wywołanie store/mutacji oraz toasty sukcesu/błędu; decyzję, gdzie
 * przypisać nowo utworzoną wartość, pozostawia wywołującemu (zwraca utworzony obiekt
 * albo `null`, gdy zapis się nie powiódł).
 */
export function useQuickAddTransactionDictionaries() {
  const toast = useToast();
  const firmsStore = useFirmsStore();
  const createCategoryMutation = useCreateTransactionCategoryMutation();
  const createLabelMutation = useCreateTransactionLabelMutation();

  const showNewFirmModal = ref(false);
  const showNewCategoryModal = ref(false);
  const showNewLabelModal = ref(false);

  async function createFirm(firm: Firm): Promise<Firm | null> {
    try {
      await firmsStore.addFirmDb(firm);
      const created = firmsStore.firms.find(f => f.name === firm.name) ?? firmsStore.firms.at(-1) ?? null;
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano firmę: ' + firm.name,
        life: 3000,
      });
      return created;
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania firmy.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać firmy.',
        life: 5000,
      });
      return null;
    }
  }

  async function createCategory(payload: TransactionCategoryCreatePayload): Promise<TransactionCategoryDto | null> {
    try {
      const created = await createCategoryMutation.mutateAsync(payload);
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano kategorię: ' + created.name,
        life: 3000,
      });
      return created;
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania kategorii.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać kategorii.',
        life: 5000,
      });
      return null;
    }
  }

  async function createLabel(name: string): Promise<TransactionLabelDto | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      const created = await createLabelMutation.mutateAsync(trimmed);
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano etykietę: ' + created.name,
        life: 3000,
      });
      return created;
    } catch (reason) {
      const axiosError = reason as AxiosError<{ message?: string }>;
      toast.add({
        severity: 'error',
        summary: 'Błąd podczas dodawania etykiety.',
        detail: axiosError?.response?.data?.message ?? 'Nie udało się dodać etykiety.',
        life: 5000,
      });
      return null;
    }
  }

  return {
    showNewFirmModal,
    showNewCategoryModal,
    showNewLabelModal,
    createFirm,
    createCategory,
    createLabel,
  };
}
