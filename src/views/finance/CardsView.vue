<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useCardsStore } from '@/stores/cards';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useBanksStore } from '@/stores/banks';
  import type { StatusType } from '@/types/StatusType';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import type { Card } from '@/types/Bank';
  import { UtilsService } from '@/service/UtilsService';
  import router from '@/router';
  import type { AxiosError } from 'axios';
  import type { ResponseData } from '@/types/User.ts';

  const toast = useToast();
  const cardStore = useCardsStore();
  const bankStore = useBanksStore();

  onMounted(() => {
    bankStore.getBanksFromDb();
    cardStore.getCardsFromDb('ALL');
  });

  //
  //--------------------------------DISPLAY FILTER
  //
  const filter = ref<StatusType>('ALL');
  const setFilter = (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterCards', selectedFilter);
  };

  const savedFilter = localStorage.getItem('selectedFilterCards');
  if (savedFilter) {
    filter.value = savedFilter as StatusType;
  }

  const filteredData = computed((): Card[] => {
    switch (filter.value) {
      case 'INACTIVE':
        return cardStore.getCardsInactive;
      case 'ACTIVE':
        return cardStore.getCardsActive;
      case 'ALL':
      default:
        return cardStore.cards;
    }
  });

  //
  //---------------------------------------------STATUS CHANGE--------------------------------------------------
  //
  const cardTemp = ref<Card>();
  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const confirmStatusChange = (card: Card) => {
    console.log('card', card);

    cardTemp.value = card;
    showStatusChangeConfirmationDialog.value = true;
  };
  const changeStatusConfirmationMessage = computed(() => {
    console.log('temp', cardTemp.value);

    if (cardTemp.value)
      return `Czy chcesz zmienić status karty: <b>${cardTemp.value?.name}</b> na <b>${
        cardTemp.value?.activeStatus === 'ACTIVE' ? 'Nieaktywna' : 'Aktywna'
      }</b>?`;
    return 'No message';
  });
  const submitChangeStatus = async () => {
    console.log('submitChangeStatus()');
    if (cardTemp.value) {
      cardTemp.value.activeStatus = cardTemp.value.activeStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      cardStore
        .updateCardDb(cardTemp.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zmieniono status karty: ' + cardTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Nie zmieniono statusu karty: ' + cardTemp.value?.name,
            life: 3000,
          });
        });
    }
    showStatusChangeConfirmationDialog.value = false;
  };
  //
  //-------------------------------------------------DELETE LOAN-------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDeleteCard = (card: Card) => {
    cardTemp.value = card;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (cardTemp.value) return `Czy chcesz usunąc kartę: <b>${cardTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    if (cardTemp.value) {
      cardStore
        .deleteCardDb(cardTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto kartę: ' + cardTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          if (reason.response && reason.response.status === 423) {
            const data = reason.response?.data as ResponseData;
            toast.add({
              severity: 'warn',
              summary: 'Informacja',
              detail: data?.message,
              life: 5000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: reason.message,
              detail: 'Nie usunięto karty: ' + cardTemp.value?.name,
              life: 3000,
            });
          }
        });
    }
    showDeleteConfirmationDialog.value = false;
  };
  //
  //-------------------------------------------------EDIT CARD-------------------------------------------------
  //
  const editCard = (item: Card) => {
    router.push({
      name: 'Card',
      params: { isEdit: 'true', cardId: item.id },
    });
  };
</script>

<template>
  <TheMenuFinance />
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />
  <Panel class="max-w-screen-xl m-auto mt-5">
    <DataView :value="filteredData" dataKey="id">
      <template #list="slotProps">
        <div class="flex flex-col">
          <div v-for="(item, index) in slotProps.items" :key="index">
            <div
              class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
              :class="{
                'border-t border-surface-200 dark:border-surface-700': index !== 0,
                inactive: item.activeStatus == 'INACTIVE',
                active: item.activeStatus == 'ACTIVE',
              }"
            >
              <div class="md:w-40 relative">
                <img
                  v-if="item.imageUrl && item.imageUrl.length > 0"
                  class="block xl:block mx-auto rounded w-full"
                  :src="item.imageUrl"
                  :alt="item.name"
                />
                <img v-else src="@/assets/images/no_card.png" alt="Karta" />
              </div>
              <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                <div class="flex flex-row md:flex-col justify-between items-start gap-2 w-1/3">
                  <div class="w-full">
                    <span class="font-medium text-surface-500 dark:text-surface-400 text-lg">{{ item.name }}</span>
                    <div class="text-sm font-medium mt-2">
                      {{ item.cardNumber }}
                    </div>
                    <div class="text-sm font-medium mt-2">
                      {{ item.otherInfo }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-row md:flex-col justify-between items-start gap-2 w-1/3">
                  <div>
                    <span class="font-medium text-surface-500 dark:text-surface-400 text-lg">{{
                      bankStore.getBank(item.idBank)?.name
                    }}</span>
                    <div class="text-sm font-medium mt-2">
                      {{ UtilsService.formatDateToString(item.expirationDate) }}
                    </div>
                    <div class="text-sm font-medium mt-2">Dzień spłaty: {{ item.repaymentDay }}</div>
                  </div>
                </div>
                <div class="flex flex-col md:items-end gap-8 w-1/3">
                  <span class="text-xl font-semibold text-surface-500 dark:text-surface-400">{{
                    UtilsService.formatCurrency(item.limit)
                  }}</span>
                  <div class="flex flex-row-reverse md:flex-row gap-2">
                    <OfficeIconButton
                      v-if="item.activeStatus == 'INACTIVE'"
                      title="Zmień status na AKTYWNY"
                      icon="pi pi-times-circle"
                      :rounded="false"
                      severity="danger"
                      @click="confirmStatusChange(item)"
                    />
                    <OfficeIconButton
                      v-else
                      title="Zmień status na NIEAKTYWNY"
                      icon="pi pi-check-circle"
                      :rounded="false"
                      severity="secondary"
                      @click="confirmStatusChange(item)"
                    />
                    <OfficeIconButton
                      icon="pi pi-file-edit"
                      title="`Edytuj kartę: ${item.name}`"
                      :rounded="false"
                      severity="primary"
                      @click="editCard(item)"
                    />
                    <OfficeIconButton
                      icon="pi pi-trash"
                      title="`Usuń kartę: ${item.name}`"
                      :rounded="false"
                      severity="danger"
                      @click="confirmDeleteCard(item)"
                    />
                    <OfficeButton
                      btn-type="office-regular"
                      icon="pi pi-shopping-cart"
                      title="Nowy zakup"
                      class="flex-auto md:flex-initial whitespace-nowrap"
                      text=""
                    ></OfficeButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </Panel>
  <Toolbar class="sticky-toolbar p-2 m-2">
    <template #start>
      <OfficeIconButton
        title="Odświerz listę książek"
        :icon="bankStore.loadingBanks || cardStore.loadingCards ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        class="mr-2"
        @click=""
      />
    </template>
    <template #center>
      <OfficeIconButton
        title="Wyświetl nieaktywne"
        :icon="bankStore.loadingBanks || cardStore.loadingCards ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'INACTIVE'"
        @click="setFilter('INACTIVE')"
      />
      <OfficeIconButton
        title="Wyświetl aktywne"
        :icon="bankStore.loadingBanks || cardStore.loadingCards ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'ACTIVE'"
        @click="setFilter('ACTIVE')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="bankStore.loadingBanks || cardStore.loadingCards ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>
    <template #end></template>
  </Toolbar>
</template>

<style scoped>
  .p-dataview >>> .p-dataview-content .inactive {
    background: rgba(255, 26, 26, 0.03);
  }

  .p-dataview >>> .p-dataview-content .active {
    background: rgba(0, 204, 68, 0.03);
  }
</style>
