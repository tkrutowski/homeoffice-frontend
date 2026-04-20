<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import moment from 'moment';
  import router from '@/router';
  import { UtilsService } from '@/service/UtilsService';
  import type { Loan, LoanInstallment } from '@/types/Loan';
  import PayPaymentDialog from '@/components/finance/PayPaymentDialog.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';

  import { useLoansStore } from '@/stores/loans';
  import { usePaymentStore } from '@/stores/payments';
  import { useToast } from 'primevue/usetoast';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';

  const loansStore = useLoansStore();
  const paymentStore = usePaymentStore();
  const toast = useToast();

  const loan = ref<Loan | null>(null);
  const installments = ref<LoanInstallment[]>([]);
  const isBusy = ref<boolean>(false);

  const props = defineProps({
    id: {
      type: Number,
      required: true,
    },
  });

  const scheduleFilter = ref<'ALL' | 'PAID' | 'TO_PAY'>('TO_PAY');
  const scheduleFilterOptions = [
    { label: 'Wszystkie', value: 'ALL' },
    { label: 'Spłacone', value: 'PAID' },
    { label: 'Do zapłaty', value: 'TO_PAY' },
  ];

  const chartPalette = ref({ primary: 'rgb(249, 115, 22)', track: 'rgb(212, 212, 216)' });
  const chartKey = ref(0);

  function refreshChartPalette() {
    if (typeof document === 'undefined') return;
    const wrap = document.createElement('div');
    wrap.className = document.documentElement.className;
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;pointer-events:none;opacity:0';
    const primaryEl = document.createElement('div');
    primaryEl.className = 'bg-primary h-2 w-2 shrink-0';
    const trackEl = document.createElement('div');
    trackEl.className = 'bg-surface-300 dark:bg-surface-700 h-2 w-2 shrink-0';
    wrap.append(primaryEl, trackEl);
    document.body.appendChild(wrap);
    chartPalette.value = {
      primary: getComputedStyle(primaryEl).backgroundColor || chartPalette.value.primary,
      track: getComputedStyle(trackEl).backgroundColor || chartPalette.value.track,
    };
    document.body.removeChild(wrap);
    chartKey.value += 1;
  }

  const plannedInterest = computed(() => {
    if (loan.value) return (loan.value.amount - loan.value.numberOfInstallments * loan.value.installmentAmount) * -1;
    return 0;
  });
  const realInterest = computed(() => {
    if (loan.value)
      return loan.value.installmentList
        .filter((l: LoanInstallment) => l.paymentStatus === PaymentStatus.PAID)
        .map((installment: LoanInstallment) => installment.installmentAmountPaid - installment.installmentAmountToPay)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);
    return 0;
  });
  const calculateCost = computed(() => {
    if (loan.value)
      return (
        (loan.value.amount - loan.value.loanCost - loan.value.numberOfInstallments * loan.value.installmentAmount) * -1
      );
    return 0;
  });
  const calculatePaid = computed(() => {
    if (loan.value)
      return loan.value.installmentList.filter(
        (installment: LoanInstallment) => installment.paymentStatus === PaymentStatus.PAID
      ).length;
    return 0;
  });

  const paidSum = computed(() => {
    if (!loan.value) return 0;
    return loan.value.installmentList
      .filter((i: LoanInstallment) => i.paymentStatus === PaymentStatus.PAID)
      .reduce((s, i) => s + (Number(i.installmentAmountPaid) || 0), 0);
  });

  const remainingScheduled = computed(() => {
    if (!loan.value) return 0;
    return loan.value.installmentList
      .filter((i: LoanInstallment) => i.paymentStatus !== PaymentStatus.PAID)
      .reduce((s, i) => {
        const toPay = Number(i.installmentAmountToPay) || 0;
        const paidPart = Number(i.installmentAmountPaid) || 0;
        return s + Math.max(0, toPay - paidPart);
      }, 0);
  });

  /** Udział spłaty wg harmonogramu (spójny z donutem), nie `paidSum / loan.amount` — kwota umowy bywa inna niż suma rat. */
  const principalPercent = computed(() => {
    const paid = paidSum.value;
    const rem = remainingScheduled.value;
    const total = paid + rem;
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, (paid / total) * 100));
  });

  const monthsLeft = computed(() => {
    if (!loan.value) return 0;
    return loan.value.installmentList.filter((i: LoanInstallment) => i.paymentStatus !== PaymentStatus.PAID).length;
  });

  const maturityDeadline = computed(() => {
    const list = loan.value?.installmentList;
    if (!list?.length) return null as Date | string | null;
    let max: moment.Moment | null = null;
    for (const i of list) {
      const m = i.paymentDeadline ? moment(i.paymentDeadline) : null;
      if (m?.isValid() && (max === null || m.isAfter(max))) max = m;
    }
    return max?.toDate() ?? list[list.length - 1]?.paymentDeadline ?? null;
  });

  const nextInstallment = computed((): LoanInstallment | null => {
    const list = loan.value?.installmentList;
    if (!list?.length) return null;
    const unpaid = list.filter((i: LoanInstallment) => i.paymentStatus !== PaymentStatus.PAID);
    if (unpaid.length === 0) return null;
    return [...unpaid].sort((a, b) => {
      const ma = a.paymentDeadline ? moment(a.paymentDeadline).valueOf() : Number.POSITIVE_INFINITY;
      const mb = b.paymentDeadline ? moment(b.paymentDeadline).valueOf() : Number.POSITIVE_INFINITY;
      if (ma !== mb) return ma - mb;
      return (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0);
    })[0];
  });

  const nextUnpaidInstallmentId = computed(() => nextInstallment.value?.idLoanInstallment ?? null);

  const loanStatusLabel = computed(() => {
    const s = loan.value?.loanStatus;
    if (s === PaymentStatus.PAID) return 'Spłacony';
    if (s === PaymentStatus.OVER_DUE) return 'Po terminie';
    if (s === PaymentStatus.TO_PAY) return 'Aktywna spłata';
    return '—';
  });

  const installmentsSorted = computed(() => {
    const list = [...installments.value];
    return list.sort((a, b) => {
      const ma = a.paymentDeadline ? moment(a.paymentDeadline).valueOf() : 0;
      const mb = b.paymentDeadline ? moment(b.paymentDeadline).valueOf() : 0;
      if (mb !== ma) return mb - ma;
      return (b.installmentNumber ?? 0) - (a.installmentNumber ?? 0);
    });
  });

  const filteredInstallments = computed(() => {
    const sorted = installmentsSorted.value;
    if (scheduleFilter.value === 'ALL') return sorted;
    if (scheduleFilter.value === 'PAID') return sorted.filter(i => i.paymentStatus === PaymentStatus.PAID);
    return sorted.filter(i => i.paymentStatus !== PaymentStatus.PAID);
  });

  const donutChartData = computed(() => {
    const paid = paidSum.value;
    const rem = remainingScheduled.value;
    if (paid <= 0 && rem <= 0) {
      return {
        labels: ['Brak danych'],
        datasets: [
          {
            data: [1],
            backgroundColor: [chartPalette.value.track],
            borderWidth: 0,
          },
        ],
      };
    }
    return {
      labels: ['Spłacono', 'Pozostało'],
      datasets: [
        {
          data: [paid, rem],
          backgroundColor: [chartPalette.value.primary, chartPalette.value.track],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  });

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx: { raw: number; dataset: { data?: number[] }; dataIndex: number }) {
            const raw = ctx.raw;
            if (ctx.dataset.data?.length === 1) return '';
            return UtilsService.formatCurrency(raw) ?? String(raw);
          },
        },
      },
    },
  };

  const getAmount = computed(() => {
    return installment.value?.installmentAmountPaid
      ? installment.value.installmentAmountPaid
      : installment.value?.installmentAmountToPay;
  });
  const getDate = computed(() => {
    if (!installment.value?.paymentDate) return new Date();
    return installment.value.paymentDate;
  });

  function isNextUnpaid(row: LoanInstallment) {
    return nextUnpaidInstallmentId.value !== null && row.idLoanInstallment === nextUnpaidInstallmentId.value;
  }

  function installmentRowClass(data: LoanInstallment) {
    return isNextUnpaid(data) ? 'bg-primary/5 dark:bg-primary/10' : '';
  }

  function formatInstallmentDeadline(data: LoanInstallment) {
    return UtilsService.formatDateToString(data.paymentDeadline ?? undefined) || '—';
  }

  function formatInstallmentPaymentDate(data: LoanInstallment) {
    if (data.paymentStatus !== PaymentStatus.PAID) return '';
    return UtilsService.formatDateToString(data.paymentDate ?? undefined) || '—';
  }

  const dataTablePt = {
    root: { class: 'border-0' },
    header: { class: 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-900' },
    column: { headerCell: { class: 'text-surface-700 dark:text-surface-200' } },
    tbody: { class: 'text-surface-800 dark:text-surface-100' },
  };

  // ---------------------------------------------EDIT PAYMENT--------------------------------
  const showPaymentModal = ref(false);
  const installment = ref<LoanInstallment>();

  function openPaymentModal(i: LoanInstallment) {
    installment.value = i;
    showPaymentModal.value = true;
  }

  async function savePayment(date: Date, amount: number) {
    isBusy.value = true;
    if (installment.value) {
      installment.value.paymentDate = date;
      installment.value.installmentAmountPaid = amount;
      installment.value.paymentStatus = PaymentStatus.PAID;
      showPaymentModal.value = false;

      await loansStore
        .updateLoanInstallmentDb(installment.value)
        .then(savedLoan => {
          if (savedLoan) {
            installments.value = savedLoan.installmentList;
            paymentStore.updatePayment(savedLoan, 'LOAN');
          }
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaktualizowano płatność.',
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas płatność.',
            life: 3000,
          });
        })
        .finally(() => {
          isBusy.value = false;
          refresh();
        });
    }
  }

  //----------------------------------------------DELETE PAYMENT----------------------------
  const showDeleteConfirmationDialog = ref<boolean>(false);

  const confirmDeletePayment = (i: LoanInstallment) => {
    installment.value = i;
    showDeleteConfirmationDialog.value = true;
  };

  const deleteConfirmationMessage = computed(() => {
    if (installment.value)
      return `Czy chcesz usunąc płatność z dnia: <b>${installment.value?.paymentDate}</b> </br>&emsp;&emsp;&emsp; na kwotę <b>${installment.value?.installmentAmountPaid} zł</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    isBusy.value = true;
    if (installment.value) {
      installment.value.paymentStatus = PaymentStatus.TO_PAY;
      installment.value.paymentDate = null;
      installment.value.installmentAmountPaid = 0;
      showDeleteConfirmationDialog.value = false;
      await loansStore
        .updateLoanInstallmentDb(installment.value)
        .then(savedLoan => {
          if (savedLoan) {
            installments.value = savedLoan.installmentList;
            paymentStore.updatePayment(savedLoan, 'LOAN');
          }
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto płatność.',
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania płatności',
            life: 3000,
          });
        })
        .finally(() => {
          refresh();
          isBusy.value = false;
        });
    }
  };

  const refresh = async () => {
    loan.value = await loansStore.getLoanFromDb(+props.id);
    installments.value = loan.value ? loan.value.installmentList : [];
    await nextTick();
    refreshChartPalette();
  };

  let themeObserver: MutationObserver | null = null;

  onMounted(async () => {
    loansStore.getLoans('ALL');
    await refresh();
    themeObserver = new MutationObserver(() => {
      nextTick(() => refreshChartPalette());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  onBeforeUnmount(() => {
    themeObserver?.disconnect();
    themeObserver = null;
  });

  watch([() => loan.value?.id, paidSum, remainingScheduled], () => {
    nextTick(() => refreshChartPalette());
  });

  interface InfoRow {
    label: string;
    value: string | undefined;
    valueClass?: string;
  }

  const infoRows = computed((): InfoRow[] => {
    const l = loan.value;
    if (!l) return [];
    return [
      { label: 'Nazwa banku', value: l.bank?.name ?? '—' },
      { label: 'Nr kredytu', value: l.loanNumber || '—' },
      { label: 'Nr konta', value: UtilsService.maskAccountNumber(l.accountNumber) || '—' },
      { label: 'Data umowy', value: UtilsService.formatDateToString(l.date ?? undefined) || '—' },
      { label: 'Data pierwszej raty', value: UtilsService.formatDateToString(l.firstPaymentDate ?? undefined) || '—' },
      {
        label: 'Termin całkowitej spłaty',
        value: UtilsService.formatDateToString(maturityDeadline.value ?? undefined) || '—',
      },
      { label: 'Ilość rat', value: String(l.numberOfInstallments ?? '—') },
      {
        label: 'Kwota raty',
        value: UtilsService.formatCurrency(l.installmentAmount),
      },
      {
        label: 'Koszt kredytu',
        value: UtilsService.formatCurrency(l.loanCost),
        valueClass: 'text-red-600 dark:text-red-400',
      },
      {
        label: 'Odsetki planowane',
        value: UtilsService.formatCurrency(plannedInterest.value),
        valueClass: 'text-red-600 dark:text-red-400',
      },
      {
        label: 'Odsetki rzeczywiste',
        value: UtilsService.formatCurrency(realInterest.value),
        valueClass: 'text-red-600 dark:text-red-400',
      },
      {
        label: 'Całkowity koszt kredytu',
        value: UtilsService.formatCurrency(calculateCost.value),
        valueClass: 'text-red-600 dark:text-red-400 font-semibold',
      },
      { label: 'Spłacono (liczba rat)', value: `${calculatePaid.value} z ${l.numberOfInstallments}` },
    ];
  });
</script>

<template>
  <PayPaymentDialog
    v-model:visible="showPaymentModal"
    :amount="getAmount"
    :date="getDate"
    @save="savePayment"
    @cancel="showPaymentModal = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div id="loan-dashboard" class="mx-auto my-3 w-full max-w-[1200px] space-y-4 px-2 sm:px-4">
      <!-- Toolbar -->
      <div class="flex w-full min-w-0 items-center gap-2 sm:gap-4">
        <OfficeIconButton
          title="Powrót do listy"
          icon="pi pi-fw pi-list"
          class="shrink-0 text-primary"
          @click="() => router.push({ name: 'Loans' })"
        />
        <div class="flex min-w-0 flex-1 items-center justify-center gap-3">
          <h3
            class="m-0 min-w-0 text-center text-lg font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-xl"
          >
            Szczegóły kredytu
          </h3>
          <div v-if="loansStore.loadingLoans" class="shrink-0">
            <ProgressSpinner class="h-8 w-8" stroke-width="4" />
          </div>
        </div>
        <OfficeButton
          class="shrink-0"
          text="zamknij"
          btn-type="office-regular"
          :btn-disabled="isBusy"
          :loading="isBusy"
          @click="() => router.back()"
        />
      </div>

      <!-- Hero -->
      <Card
        :pt="{
          root: {
            class:
              'border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950 overflow-hidden',
          },
          body: { class: 'p-4 sm:p-6' },
        }"
      >
        <template #content>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <h2
                class="m-0 break-words text-xl font-bold uppercase leading-tight tracking-wide text-surface-900 dark:text-surface-0 sm:text-2xl"
              >
                {{ loan?.name ?? '—' }}
              </h2>
              <p class="m-0 text-sm font-medium uppercase tracking-wide text-primary">Status: {{ loanStatusLabel }}</p>
            </div>
            <div class="shrink-0 text-left lg:text-right">
              <p class="m-0 text-3xl font-bold tabular-nums text-primary sm:text-4xl">
                {{ principalPercent.toFixed(0) }}%
              </p>
              <p class="m-0 mt-1 text-xs font-medium uppercase tracking-wide text-surface-600 dark:text-surface-400">
                Spłacono wg harmonogramu
              </p>
            </div>
          </div>
          <div class="mt-4">
            <ProgressBar :value="principalPercent" :show-value="false" class="h-3" />
          </div>
          <div class="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:gap-4 sm:text-sm">
            <div class="text-surface-600 dark:text-surface-400">
              <span class="font-semibold uppercase tracking-wide">Początek</span>
              <p class="m-0 mt-1 tabular-nums">{{ UtilsService.formatDateToString(loan?.date ?? undefined) || '—' }}</p>
            </div>
            <div class="text-center sm:text-center">
              <span class="font-semibold uppercase tracking-wide text-primary">Następna rata</span>
              <p class="m-0 mt-1 tabular-nums text-primary">
                {{ UtilsService.formatDateToString(nextInstallment?.paymentDeadline ?? undefined) || '—' }}
              </p>
            </div>
            <div class="text-surface-600 dark:text-surface-400 sm:text-right">
              <span class="font-semibold uppercase tracking-wide">Koniec</span>
              <p class="m-0 mt-1 tabular-nums">
                {{ UtilsService.formatDateToString(maturityDeadline ?? undefined) || '—' }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <!-- Informacje -->
        <div class="flex min-h-0 min-w-0 flex-col lg:col-span-5">
          <Card
            :pt="{
              root: {
                class:
                  'flex min-h-0 h-full min-w-0 flex-col border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950',
              },
              body: { class: 'flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5' },
              title: { class: 'text-lg font-semibold text-surface-900 dark:text-surface-0' },
              content: { class: 'flex min-h-0 min-w-0 flex-1 flex-col' },
            }"
          >
            <template #title>
              <span class="inline-flex items-center gap-2">
                <i class="pi pi-info-circle text-primary" aria-hidden="true" />
                Informacje ogólne
              </span>
            </template>
            <template #content>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <dt class="text-xs font-medium uppercase tracking-wide text-surface-600 dark:text-surface-400">
                    Kwota kredytu
                  </dt>
                  <dd class="m-0 mt-0.5 text-lg font-semibold tabular-nums text-primary">
                    {{ UtilsService.formatCurrency(loan?.amount) }}
                  </dd>
                </div>
                <template v-for="row in infoRows" :key="row.label">
                  <div class="min-w-0 sm:col-span-1">
                    <dt class="text-xs font-medium text-surface-600 dark:text-surface-400">{{ row.label }}</dt>
                    <dd
                      class="m-0 mt-0.5 break-words text-sm text-surface-900 dark:text-surface-0"
                      :class="row.valueClass"
                    >
                      {{ row.value }}
                    </dd>
                  </div>
                </template>
              </dl>
            </template>
          </Card>
        </div>

        <!-- Postęp -->
        <div class="flex min-h-0 min-w-0 flex-col lg:col-span-7">
          <Card
            :pt="{
              root: {
                class:
                  'flex min-h-0 h-full min-w-0 flex-col border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950',
              },
              body: { class: 'flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5' },
              title: { class: 'text-lg font-semibold text-surface-900 dark:text-surface-0' },
              subtitle: { class: 'text-sm text-surface-600 dark:text-surface-400' },
              content: { class: 'flex min-h-0 min-w-0 flex-1 flex-col' },
            }"
          >
            <template #title>Postęp spłat</template>
            <template #subtitle>Wykres i skrócone saldo harmonogramu</template>
            <template #content>
              <div class="flex min-h-0 min-w-0 flex-1 flex-col">
                <div class="flex min-h-0 flex-1 flex-col items-center justify-center py-2">
                  <div class="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[320px]">
                    <Chart
                      :key="chartKey"
                      type="doughnut"
                      :data="donutChartData"
                      :options="donutChartOptions"
                      class="h-full w-full"
                    />
                    <div
                      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
                      aria-hidden="true"
                    >
                      <p class="m-0 text-xl font-bold tabular-nums text-surface-900 dark:text-surface-0 sm:text-2xl">
                        {{ UtilsService.formatCurrency(paidSum) }}
                      </p>
                      <p
                        class="m-0 mt-1 text-xs font-medium uppercase tracking-wide text-surface-600 dark:text-surface-400"
                      >
                        Spłacono łącznie
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-auto shrink-0 pt-2">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div
                      class="flex gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-900"
                    >
                      <div class="w-1 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p class="m-0 text-xs font-medium uppercase text-surface-600 dark:text-surface-400">
                          Pozostało (harmonogram)
                        </p>
                        <p class="m-0 mt-1 text-lg font-semibold tabular-nums text-surface-900 dark:text-surface-0">
                          {{ UtilsService.formatCurrency(remainingScheduled) }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="flex gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-900"
                    >
                      <div class="w-1 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p class="m-0 text-xs font-medium uppercase text-surface-600 dark:text-surface-400">
                          Pozostało rat
                        </p>
                        <p class="m-0 mt-1 text-lg font-semibold tabular-nums text-surface-900 dark:text-surface-0">
                          {{ monthsLeft }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Harmonogram -->
      <Card
        :pt="{
          root: {
            class: 'border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950',
          },
          body: { class: 'p-4 sm:p-5' },
          title: { class: 'text-lg font-semibold text-surface-900 dark:text-surface-0' },
        }"
      >
        <template #title>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span class="inline-flex items-center gap-2">
              <i class="pi pi-calendar text-primary" aria-hidden="true" />
              Harmonogram spłat
            </span>
            <SelectButton
              v-model="scheduleFilter"
              :options="scheduleFilterOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
              class="shrink-0"
            />
          </div>
        </template>
        <template #content>
          <DataTable
            v-if="!loansStore.loadingLoans"
            data-key="idLoanInstallment"
            scrollable
            scroll-height="min(68vh, 520px)"
            :value="filteredInstallments"
            size="small"
            :row-class="installmentRowClass"
            :pt="dataTablePt"
          >
            <Column field="installmentNumber" header="Nr" class="min-w-[4rem]">
              <template #body="{ data }">
                <span class="pl-1 text-left font-medium tabular-nums">{{ data.installmentNumber }}</span>
              </template>
            </Column>
            <Column header="Termin" class="min-w-[7rem]">
              <template #body="{ data }">
                <span
                  class="tabular-nums"
                  :class="isNextUnpaid(data) ? 'font-semibold text-primary' : 'text-surface-800 dark:text-surface-100'"
                >
                  {{ formatInstallmentDeadline(data) }}
                </span>
              </template>
            </Column>
            <Column field="installmentAmountToPay" header="Kwota zaplanowana" class="min-w-[8rem]">
              <template #body="{ data }">
                <span class="tabular-nums">{{ UtilsService.formatCurrency(data.installmentAmountToPay) }}</span>
              </template>
            </Column>
            <Column header="Data wpłaty" class="min-w-[7rem]">
              <template #body="{ data }">
                <template v-if="data.paymentStatus === PaymentStatus.PAID">
                  <span
                    class="inline-block rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary"
                  >
                    {{ formatInstallmentPaymentDate(data) }}
                  </span>
                </template>
                <span v-else class="text-surface-500 italic dark:text-surface-400">Nadchodząca</span>
              </template>
            </Column>
            <Column header="Kwota wpłacona" class="min-w-[8rem]">
              <template #body="{ data }">
                <span
                  class="tabular-nums"
                  :class="
                    data.installmentAmountPaid ? 'font-medium text-primary' : 'text-surface-500 dark:text-surface-400'
                  "
                >
                  {{
                    data.installmentAmountPaid
                      ? UtilsService.formatCurrency(data.installmentAmountPaid)
                      : UtilsService.formatCurrency(0)
                  }}
                </span>
              </template>
            </Column>
            <Column header="Akcje" :exportable="false" class="min-w-[10rem]">
              <template #body="slotProps">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    v-if="slotProps.data.paymentStatus !== PaymentStatus.PAID && isNextUnpaid(slotProps.data)"
                    label="Opłać"
                    size="small"
                    severity="primary"
                    :disabled="isBusy"
                    @click="openPaymentModal(slotProps.data)"
                  />
                  <OfficeIconButton
                    title="Edytuj wpłatę"
                    icon="pi pi-file-edit"
                    class="text-primary"
                    @click="openPaymentModal(slotProps.data)"
                  />
                  <OfficeIconButton
                    title="Usuń wpłatę"
                    icon="pi pi-trash"
                    class="text-red-600 dark:text-red-400"
                    :disabled="slotProps.data.installmentAmountPaid === 0"
                    @click="confirmDeletePayment(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </MainPageShell>
</template>
