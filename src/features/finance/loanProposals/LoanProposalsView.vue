<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { useLoanProposalsListQuery } from '@/features/finance/loanProposals/queries/useLoanProposalsQueries';
  import {
    useDeleteLoanProposalMutation,
    useIgnoreLoanProposalMutation,
  } from '@/features/finance/loanProposals/queries/useLoanProposalsMutations';
  import { LoanProposalStatus, type LoanProposal } from '@/features/finance/loanProposals/types';

  const toast = useToast();

  const statusFilterOptions = [
    { label: 'Do przejrzenia', value: LoanProposalStatus.EXTRACTED },
    { label: 'Nowe', value: LoanProposalStatus.NEW },
    { label: 'Błędne', value: LoanProposalStatus.FAILED },
    { label: 'Zaakceptowane', value: LoanProposalStatus.ACCEPTED },
    { label: 'Odrzucone', value: LoanProposalStatus.IGNORED },
    { label: 'Wszystkie', value: undefined },
  ];
  const selectedStatus = ref<LoanProposalStatus | undefined>(LoanProposalStatus.EXTRACTED);

  const proposalsQuery = useLoanProposalsListQuery(selectedStatus);
  const proposals = computed(() => proposalsQuery.data.value ?? []);
  const loading = computed(() => proposalsQuery.isFetching.value);

  const ignoreProposalMutation = useIgnoreLoanProposalMutation();
  const deleteProposalMutation = useDeleteLoanProposalMutation();

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const statusPillClass = (status: LoanProposalStatus): string => {
    switch (status) {
      case LoanProposalStatus.EXTRACTED:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case LoanProposalStatus.FAILED:
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      case LoanProposalStatus.ACCEPTED:
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case LoanProposalStatus.IGNORED:
        return 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500';
      case LoanProposalStatus.NEW:
      default:
        return 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300';
    }
  };
  const statusLabel = (status: LoanProposalStatus): string => {
    return statusFilterOptions.find(option => option.value === status)?.label ?? status;
  };

  const reviewProposal = (proposal: LoanProposal) => {
    router.push({ name: 'LoanProposalReview', params: { proposalId: proposal.id } });
  };

  //
  //-------------------------------------------------ODRZUĆ PROPOZYCJĘ-------------------------------------------------
  //
  const proposalTemp = ref<LoanProposal | null>(null);
  const showIgnoreConfirmationDialog = ref<boolean>(false);
  const confirmIgnoreProposal = (proposal: LoanProposal) => {
    proposalTemp.value = proposal;
    showIgnoreConfirmationDialog.value = true;
  };
  const ignoreConfirmationMessage = computed(() => {
    if (proposalTemp.value)
      return `Czy chcesz odrzucić propozycję kredytu: <b>${proposalTemp.value.sourceSubject}</b>?`;
    return 'No message';
  });
  const submitIgnore = async () => {
    if (proposalTemp.value) {
      await ignoreProposalMutation
        .mutateAsync(proposalTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Odrzucono propozycję kredytu',
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas odrzucania propozycji',
            life: 5000,
          });
        });
    }
    showIgnoreConfirmationDialog.value = false;
  };

  //
  //-------------------------------------------------USUŃ PROPOZYCJĘ-------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDeleteProposal = (proposal: LoanProposal) => {
    proposalTemp.value = proposal;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (proposalTemp.value) return `Czy chcesz usunąć propozycję kredytu: <b>${proposalTemp.value.sourceSubject}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    if (proposalTemp.value) {
      await deleteProposalMutation
        .mutateAsync(proposalTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto propozycję kredytu',
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania propozycji',
            life: 5000,
          });
        });
    }
    showDeleteConfirmationDialog.value = false;
  };

  const refreshProposals = async () => {
    await proposalsQuery.refetch();
  };
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showIgnoreConfirmationDialog"
    :msg="ignoreConfirmationMessage"
    label="Odrzuć"
    @save="submitIgnore"
    @cancel="showIgnoreConfirmationDialog = false"
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

    <Panel class="my-3 mx-2">
      <DataTable
        v-model:filters="filters"
        :value="proposals"
        striped-rows
        removable-sort
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        size="small"
        table-style="min-width: 50rem"
        :global-filter-fields="['sourceSubject', 'sourceEmailFrom', 'originalSenderEmail']"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <Select
                v-model="selectedStatus"
                :options="statusFilterOptions"
                option-label="label"
                option-value="value"
                class="w-48"
              />
              <div
                class="h-9 w-px shrink-0 bg-surface-300 dark:bg-surface-600"
                role="presentation"
                aria-hidden="true"
              />
              <OfficeIconButton
                title="Odśwież listę propozycji"
                class="text-orange-500"
                :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                @click="refreshProposals"
              />
            </div>
            <div class="flex flex-wrap items-center justify-end gap-4">
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText class="!max-w-48" v-model="filters['global'].value" placeholder="wyszukaj..." />
              </IconField>
            </div>
          </div>
        </template>

        <template #empty>
          <p v-if="!loading" class="text-surface-500 dark:text-surface-400">
            Brak propozycji kredytów do wyświetlenia.
          </p>
        </template>

        <Column field="sourceSubject" header="Temat" sortable />
        <Column header="Nadawca" sortable sort-field="sourceEmailFrom">
          <template #body="slotProps">
            {{ slotProps.data.originalSenderEmail ?? slotProps.data.sourceEmailFrom }}
          </template>
        </Column>
        <Column field="receivedAt" header="Otrzymano" sortable>
          <template #body="slotProps">
            {{ UtilsService.formatDateToString(slotProps.data.receivedAt) }}
          </template>
        </Column>
        <Column field="status" header="Status" sortable>
          <template #body="slotProps">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusPillClass(slotProps.data.status)">
              {{ statusLabel(slotProps.data.status) }}
            </span>
          </template>
        </Column>
        <Column header="Akcja" :exportable="false" style="max-width: 8rem">
          <template #body="slotProps">
            <div class="flex flex-row gap-1 justify-start">
              <OfficeIconButton
                v-if="slotProps.data.status === LoanProposalStatus.EXTRACTED"
                class="text-orange-500"
                title="Przejrzyj propozycję"
                icon="pi pi-file-edit"
                @click="reviewProposal(slotProps.data)"
              />
              <OfficeIconButton
                v-if="slotProps.data.status === LoanProposalStatus.EXTRACTED"
                class="text-red-500"
                title="Odrzuć propozycję"
                icon="pi pi-times"
                @click="confirmIgnoreProposal(slotProps.data)"
              />
              <OfficeIconButton
                v-if="[LoanProposalStatus.FAILED, LoanProposalStatus.IGNORED].includes(slotProps.data.status)"
                class="text-red-500"
                title="Usuń propozycję"
                icon="pi pi-trash"
                @click="confirmDeleteProposal(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Panel>
  </MainPageShell>
</template>

<style scoped></style>
