<script setup lang="ts">
  import moment from 'moment';
  import { nextTick, ref, computed, watch } from 'vue';
  import { UtilsService } from '@/service/UtilsService.ts';
  import router from '@/router';
  import { type Installment, type Payment, PaymentStatus } from '@/types/Payment.ts';
  import { useToast } from 'primevue/usetoast';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import ContextMenu from 'primevue/contextmenu';

  import { usePaymentStore } from '@/stores/payments.ts';
  import { useUsersStore } from '@/stores/users.ts';
  import { useLoansStore } from '@/stores/loans.ts';
  import { useFeeStore } from '@/stores/fee.ts';
  import { TranslationService } from '@/service/TranslationService.ts';
  import type { StatusType } from '@/types/StatusType.ts';
  import type { Loan } from '@/types/Loan';
  import type { Fee } from '@/types/Fee';

  /** Kolejka: `getLoansByYearAndStatusAndUser` / `getFeesByYearAndStatusAndUser` zerują globalny stan store — nie mogą się przeplatać między instancjami `UserPayments`. */
  let bankFirmColumnMutex = Promise.resolve();
  function runBankFirmColumnLoadSequentially(fn: () => Promise<void>): Promise<void> {
    const run = bankFirmColumnMutex.then(fn);
    bankFirmColumnMutex = run.catch(() => {});
    return run;
  }

  const paymentStore = usePaymentStore();
  const userStore = useUsersStore();
  const loansStore = useLoansStore();
  const feeStore = useFeeStore();
  const toast = useToast();

  const props = defineProps({
    idUser: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  });

  const selectedPayment = ref<Payment | null>(null);
  const selectedYear = ref<number>(props.year);
  const payments = ref<Payment[]>([]);

  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const selectedPaymentTemp = ref<Payment | null>(null);

  const dataTableRef = ref(null);
  const cm = ref<InstanceType<typeof ContextMenu> | null>(null);
  /** Indeks `th` kolumny bieżącego miesiąca: Nazwa, Bank, Dzień, potem miesiące 1–12 */
  const todayIndex = ref<number>(moment().month() + 3);

  const onRowSelect = (event: any) => {
    const payment = event.data.paymentType === 'LOAN' ? 'PaymentLoan' : 'PaymentFee';
    router.push({
      name: payment,
      params: { id: event.data.id },
    });
  };

  const onRowContextMenu = (event: any) => {
    selectedPaymentTemp.value = event.data;
    if (cm.value) {
      cm.value.show(event.originalEvent);
    }
  };

  /** Zielony / żółty / czerwony wg reguł biznesowych; neutralne stany bez tych trzech kolorów */
  type MonthCellState = 'no-credit' | 'paid-on-time' | 'paid-late' | 'unpaid-overdue' | 'unpaid-pending';

  const getMonthCellState = (installments: Installment[], month: number): MonthCellState => {
    const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
        pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline?.getMonth() + 1 === month
    );
    const paymentDeadline = installment?.paymentDeadline;
    if (!paymentDeadline) return 'no-credit';

    const date = moment(installment?.paymentDate).format('yyyy-MM-DD');
    const isPaid = !date.startsWith('Invalid');
    if (isPaid) {
      const deadline = moment(installment?.paymentDeadline);
      const paymentDate = moment(installment?.paymentDate);
      if (paymentDate.isAfter(deadline)) return 'paid-late';
      return 'paid-on-time';
    }
    const deadline = moment(installment?.paymentDeadline);
    if (moment().isAfter(deadline)) return 'unpaid-overdue';
    return 'unpaid-pending';
  };

  const getPaymentCellWrapperClass = (state: MonthCellState): string => {
    const base =
      'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 py-1 relative overflow-hidden px-0.5 text-sm tabular-nums';
    switch (state) {
      case 'no-credit':
        return `${base} bg-surface-0 text-surface-400 dark:bg-surface-950 dark:text-surface-500`;
      case 'paid-on-time':
        return `${base} border-l-[3px] border-l-emerald-500 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent bg-surface-0 text-emerald-700 dark:border-l-emerald-400 dark:from-emerald-400/15 dark:bg-surface-950 dark:text-emerald-300`;
      case 'paid-late':
        return `${base} border-l-[3px] border-l-amber-500 bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent bg-surface-0 text-amber-800 dark:border-l-amber-400 dark:from-amber-400/15 dark:bg-surface-950 dark:text-amber-200`;
      case 'unpaid-overdue':
        return `${base} border-l-[3px] border-l-red-500 bg-gradient-to-r from-red-500/20 via-red-500/5 to-transparent bg-surface-0 text-red-600 dark:border-l-red-400 dark:from-red-400/15 dark:bg-surface-950 dark:text-red-400`;
      case 'unpaid-pending':
        return `${base} border-l-[3px] border-l-surface-400 bg-gradient-to-r from-surface-400/15 via-surface-400/5 to-transparent bg-surface-0 text-surface-700 dark:border-l-surface-500 dark:from-surface-500/10 dark:bg-surface-950 dark:text-surface-300`;
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
  };

  /**
   * Podświetlenie nagłówka tylko dla aktualnego miesiąca w aktualnym roku.
   * Przy przeglądaniu archiwalnych lat nie wyróżniamy miesiąca "dzisiejszego".
   */
  const isCurrentCalendarMonth = (month: number) => {
    const now = moment();
    return selectedYear.value === now.year() && month === now.month() + 1;
  };

  const getMonthAmountHeaderShellClass = (month: number) => {
    const shell = 'flex w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center min-h-[3.25rem]';
    return isCurrentCalendarMonth(month)
      ? `${shell} rounded-t-md border-b-2 border-primary bg-primary/10 dark:bg-primary/20`
      : shell;
  };

  const getMonthAmountHeaderTitleClass = (month: number) =>
    isCurrentCalendarMonth(month) ? 'font-semibold text-primary' : 'font-semibold text-surface-800 dark:text-surface-0';

  const getAmount = (installments: Installment[], month: number) => {
    const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
        pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline.getMonth() + 1 === month
    );

    return installment === undefined
      ? ''
      : +installment.installmentAmountPaid === 0
        ? UtilsService.formatCurrency(installment.installmentAmountToPay)
        : UtilsService.formatCurrency(installment.installmentAmountPaid);
  };

  const getDate = (installments: Installment[], month: number) => {
    const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
        pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline?.getMonth() + 1 === month
    );
    if (!installment) return '';

    const paymentDate = installment?.paymentDate;
    if (paymentDate) {
      const date = moment(paymentDate).format('yyyy-MM-DD');
      const isPaid = !date.startsWith('Invalid');
      return isPaid ? date : '';
    }
    return '';
  };

  const calculateTotal = (month: number) => {
    return payments.value
      ?.map(value => value.installments)
      .flatMap(value => value)
      .filter(
        (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline.getMonth() + 1 === month
      )
      .map(value => value.installmentAmountToPay)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  };
  const calculateTotalPaid = (month: number) => {
    return payments.value
      ?.map(value => value.installments)
      .flatMap(value => value)
      .filter(
        (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline.getMonth() + 1 === month
      )
      .map(value => value.installmentAmountPaid)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  };
  const calculateTotalToPay = (month: number) => {
    return payments.value
      ?.map(value => value.installments)
      .flatMap(value => value)
      .filter(
        (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value && pay.paymentDeadline.getMonth() + 1 === month
      )
      .map(value => (value.paymentStatus === PaymentStatus.TO_PAY ? value.installmentAmountToPay : 0))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  };

  /** Nazwy z lokalnego wyniku API (patrz `loadLoansAndFeesForBankFirmColumn`), nie ze `getLoan`/`getFee` na pustym store. */
  const bankNameByLoanId = ref<Map<number, string>>(new Map());
  const firmNameByFeeId = ref<Map<number, string>>(new Map());

  const findBankOrFirmName = (payment: Payment) => {
    let result = '';
    if (payment.paymentType === 'LOAN' && payment.installments.length > 0) {
      const firstInstallment = payment.installments[0];
      if (UtilsService.isLoanInstallment(firstInstallment)) {
        result = bankNameByLoanId.value.get(firstInstallment.idLoan) ?? '';
      }
    }

    if (payment.paymentType === 'FEE' && payment.installments.length > 0) {
      const firstInstallment = payment.installments[0];
      if (UtilsService.isFeeInstallment(firstInstallment)) {
        result = firmNameByFeeId.value.get(firstInstallment.idFee) ?? '';
      }
    }

    if (result.length > 20) {
      return result.slice(0, 15) + '...';
    }

    return result;
  };

  const getUserFullName = (id: number) => {
    return userStore.getUserFullName(id);
  };

  const changeStatusConfirmationMessage = computed(() => {
    if (selectedPaymentTemp.value) {
      const status = selectedPaymentTemp.value.paymentStatus;
      return `Czy chcesz zmienić status ${selectedPaymentTemp.value.paymentType === 'LOAN' ? 'kredytu' : 'opłaty'}: <b>${selectedPaymentTemp.value.name}</b> na <b>${
        status === PaymentStatus.PAID ? 'Do spłaty' : 'Spłacony'
      }</b>?`;
    }
    return 'No message';
  });

  const submitChangeStatus = async () => {
    if (selectedPaymentTemp.value) {
      const newStatus =
        selectedPaymentTemp.value.paymentStatus === PaymentStatus.PAID ? PaymentStatus.TO_PAY : PaymentStatus.PAID;

      try {
        if (selectedPaymentTemp.value.paymentType === 'LOAN') {
          await loansStore.updateLoanStatusDb(selectedPaymentTemp.value.id, newStatus);
        } else {
          await feeStore.updateFeeStatusDb(selectedPaymentTemp.value.id, newStatus);
        }

        // Aktualizacja statusu w paymentStore
        paymentStore.updatePaymentStatus(
          selectedPaymentTemp.value.id,
          props.idUser,
          selectedPaymentTemp.value.paymentType,
          newStatus
        );

        // Odświeżenie danych z paymentStore aby mieć pewność synchronizacji
        await nextTick();
        payments.value = [...paymentStore.getPaymentsByUserID(props.idUser?.toString())];

        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: `Zmieniono status ${selectedPaymentTemp.value.paymentType === 'LOAN' ? 'kredytu' : 'opłaty'}: ${selectedPaymentTemp.value.name}`,
          life: 3000,
        });
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: error?.message,
          detail: `Błąd podczas zmiany statusu ${selectedPaymentTemp.value.paymentType === 'LOAN' ? 'kredytu' : 'opłaty'}: ${selectedPaymentTemp.value.name}`,
          life: 3000,
        });
      }
    }
    showStatusChangeConfirmationDialog.value = false;
  };

  /** Ładuje kredyty/opłaty użytkownika dla roku i zapisuje nazwy banku/firmy w mapach (store list kredytów nie jest wypełniany na widoku płatności). */
  const loadLoansAndFeesForBankFirmColumn = async () => {
    const year = props.year;
    const idUser = props.idUser;
    await runBankFirmColumnLoadSequentially(async () => {
      const status: StatusType = 'ALL';
      const [loans, fees] = await Promise.all([
        loansStore.getLoansByYearAndStatusAndUser(year, status, idUser),
        feeStore.getFeesByYearAndStatusAndUser(year, status, idUser),
      ]);
      bankNameByLoanId.value = new Map(loans.map((l: Loan) => [l.id, l.bank?.name ?? '']));
      firmNameByFeeId.value = new Map(fees.map((f: Fee) => [f.id, f.firm?.name ?? '']));
    });
  };

  const syncPaymentsAndScroll = async () => {
    moment.locale('pl');
    selectedYear.value = props.year;
    payments.value = paymentStore.getPaymentsByUserID(props.idUser?.toString());
    await loadLoansAndFeesForBankFirmColumn();
    await nextTick();
    scrollToToday();
  };

  watch(
    () => [props.year, props.idUser] as const,
    () => {
      void syncPaymentsAndScroll();
    },
    { immediate: true }
  );

  const scrollToToday = () => {
    if (dataTableRef.value) {
      const container = (dataTableRef.value as any).$el.querySelector(
        '.p-datatable-table-container'
      ) as HTMLElement | null;

      if (container) {
        const columns = container.querySelectorAll('thead.p-datatable-thead > tr > th');

        const frozenColumnsCount = 2;
        const frozenColumnsWidth = Array.from(columns)
          .slice(0, frozenColumnsCount)
          .reduce((total, col) => total + (col as HTMLElement).offsetWidth, 0);

        const target = columns[todayIndex.value] as HTMLElement;

        if (target) {
          container.scrollTo({
            left: target.offsetLeft - frozenColumnsWidth,
            behavior: 'smooth',
          });
        }
      }
    }
  };
</script>

<template>
  <Panel class="mt-5">
    <template #header>
      <div class="w-full flex justify-center">
        <p class="m-0 text-3xl">
          {{ getUserFullName(idUser) }}
        </p>
        <div v-if="paymentStore.loadingPayments">
          <ProgressSpinner class="ml-3" style="width: 40px; height: 40px" stroke-width="5" />
        </div>
      </div>
    </template>

    <ConfirmationDialog
      v-model:visible="showStatusChangeConfirmationDialog"
      :msg="changeStatusConfirmationMessage"
      @save="submitChangeStatus"
      @cancel="showStatusChangeConfirmationDialog = false"
    />

    <ContextMenu
      ref="cm"
      :model="[
        {
          label: 'Zmień status',
          icon: 'pi pi-refresh',
          command: () => (showStatusChangeConfirmationDialog = true),
        },
      ]"
    />

    <DataTable
      ref="dataTableRef"
      v-model:selection="selectedPayment"
      :loading="paymentStore.loadingPayments"
      :sort-order="1"
      :value="payments"
      removable-sort
      scrollable
      selection-mode="single"
      sort-field="paymentDay"
      table-style="min-width: 50rem"
      @row-select="onRowSelect"
      @row-contextmenu="onRowContextMenu"
      contextMenu
      size="small"
    >
      <template #empty>
        <p v-if="!paymentStore.loadingPayments" class="text-red-500 text-3xl">Nie znaleziono opłat...</p>
      </template>

      <!--  NAME    -->
      <Column
        field="name"
        header="Nazwa"
        :sortable="true"
        style="min-width: 130px"
        header-class="user-payment-leading"
        class="user-payment-leading"
        footer-class="user-payment-leading"
      >
        <template #body="{ data, field }">
          <div class="name">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  BANK/FIRM    -->
      <Column
        field="bank"
        header="Bank/Firma"
        :sortable="true"
        style="min-width: 150px"
        header-class="user-payment-leading"
        class="user-payment-leading"
        footer-class="user-payment-leading"
      >
        <template #body="{ data }">
          <div class="name">
            {{ findBankOrFirmName(data) }}
          </div>
        </template>
      </Column>

      <!--  PAYMENT DAY    -->
      <Column
        field="paymentDay"
        header="Dzień"
        :sortable="true"
        style="width: 85px"
        header-class="user-payment-leading"
        class="user-payment-leading"
        footer-class="user-payment-leading"
      >
        <template #body="{ data, field }">
          <div class="day">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  MONTHS: kwota + data zapłaty w jednej kolumnie -->
      <div v-for="number in 12" :key="number">
        <Column
          field="amount"
          header-style="min-width: 120px;"
          header-class="user-payment"
          class="user-payment p-column-data-zapl"
        >
          <template #header>
            <div :class="getMonthAmountHeaderShellClass(number)">
              <span :class="getMonthAmountHeaderTitleClass(number)">
                {{ TranslationService.translateMonth(number) }}
              </span>
            </div>
          </template>
          <template #body="slotProps">
            <div :class="getPaymentCellWrapperClass(getMonthCellState(slotProps.data.installments, number))">
              <span>{{ getAmount(slotProps.data.installments, number) }}</span>
              <span class="text-xs leading-tight opacity-90">{{ getDate(slotProps.data.installments, number) }}</span>
            </div>
          </template>
        </Column>
      </div>

      <ColumnGroup type="footer">
        <Row>
          <Column :colspan="2" frozen footer-class="user-payment-leading">
            <template #footer>
              <div class="flex flex-col gap-1 py-1.5 text-left text-xs font-medium leading-tight">
                <span class="text-surface-600 dark:text-surface-400">Razem</span>
                <span class="text-emerald-600 dark:text-emerald-400">Zapłacono</span>
                <span class="text-red-600 dark:text-red-400">Do zapłaty</span>
              </div>
            </template>
          </Column>
          <Column footer-class="user-payment-leading" />
          <div v-for="number in 12" :key="'foot-' + number">
            <Column footer-class="user-payment user-payment-footer-summary p-column-data-zapl">
              <template #footer>
                <div
                  class="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 py-1.5 text-center tabular-nums"
                >
                  <span class="text-sm font-semibold text-surface-800 dark:text-surface-100">{{
                    UtilsService.formatCurrency(calculateTotal(number))
                  }}</span>
                  <span class="text-sm text-emerald-600 dark:text-emerald-400">{{
                    UtilsService.formatCurrency(calculateTotalPaid(number))
                  }}</span>
                  <span class="text-sm text-red-600 dark:text-red-400">{{
                    UtilsService.formatCurrency(calculateTotalToPay(number))
                  }}</span>
                </div>
              </template>
            </Column>
          </div>
        </Row>
      </ColumnGroup>
    </DataTable>
  </Panel>
</template>

<style scoped>
  .name {
    padding: 0.3rem 0 0.3rem 0;
    text-align: left;
  }

  .day {
    padding: 0.3rem 0 0.3rem 0;
    text-align: center;
  }

  :deep(.p-datatable-column-footer) {
    margin-left: 1rem;
  }

  :deep(.p-datatable-tbody > tr:hover > td) {
    @apply bg-surface-200/90 dark:bg-surface-700/60 transition-colors duration-150;
  }

  /* Komórki miesięcy mają własne tło/gradient, więc hover trzeba doświetlić na wrapperze wewnętrznym. */
  :deep(.p-datatable-tbody > tr:hover > td.user-payment > div) {
    @apply brightness-125 contrast-125 dark:brightness-150 dark:contrast-125 transition duration-150;
  }
</style>
