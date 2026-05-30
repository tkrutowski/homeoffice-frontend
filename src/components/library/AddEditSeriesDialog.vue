<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Ref } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import FormSectionCard from '@/components/library/FormSectionCard.vue';
  import { ptFieldInputText, ptTextareaField } from '@/config/formFieldPt';
  import { useBooksStore } from '@/stores/books.ts';
  import type { Series } from '@/types/Book.ts';
  import { DocumentTextIcon, LinkIcon, QueueListIcon } from '@heroicons/vue/24/outline';

  const bookStore = useBooksStore();
  const emit = defineEmits<{
    (e: 'save', series: Series): void;
    (e: 'cancel'): void;
  }>();
  const props = defineProps({
    idSeries: {
      type: Number,
      require: true,
      default: 0,
    },
    isEdit: {
      type: Boolean,
      require: false,
      default: true,
    },
  });
  const submitted = ref(false);
  const series = ref<Series>({
    id: 0,
    title: '',
    description: '',
    url: '',
    checkDate: null,
    hasNewBooks: false,
  });

  const urlLegimi = ref<string>('');
  const urlUpolujEbooka = ref<string>('');
  const urlLubimyCzytac = ref<string>('');

  const getUrl = (url: string, searchText: string, variable: Ref<string>) => {
    const array = url.split(';;');
    const filteredArray = array.filter(value => value.includes(searchText));
    variable.value = filteredArray.length > 0 ? filteredArray[0] : '';
  };

  watch(
    () => props.idSeries,
    async (id: number) => {
      if (props.isEdit && id > 0) {
        bookStore.getSeriesByIdFromDb(id).then((ser: Series | null) => {
          if (ser) {
            series.value = ser;
            getUrl(series.value.url, 'legimi.pl', urlLegimi);
            getUrl(series.value.url, 'upolujebooka.pl', urlUpolujEbooka);
            getUrl(series.value.url, 'lubimyczytac.pl', urlLubimyCzytac);
          }
        });
      }
    }
  );
  const isValid = () => {
    return !(showErrorTitle() || showErrorUrlLegimi() || showErrorUpolujEbooka() || showErrorLubimyCzytac());
  };
  const showErrorTitle = () => {
    return submitted.value && series.value.title.length === 0;
  };
  const showErrorUrlLegimi = () => {
    const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
    return submitted.value && urlLegimi.value.length > 0 && !regex.test(urlLegimi.value);
  };
  const showErrorUpolujEbooka = () => {
    const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
    return submitted.value && urlUpolujEbooka.value.length > 0 && !regex.test(urlUpolujEbooka.value);
  };
  const showErrorLubimyCzytac = () => {
    const regex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,}){1,3}(\/\S*)?$/;
    return submitted.value && urlLubimyCzytac.value.length > 0 && !regex.test(urlLubimyCzytac.value);
  };

  const submit = () => {
    submitted.value = true;
    if (isValid()) {
      let combineUrl = '';
      if (urlLegimi.value.length > 0) {
        combineUrl = urlLegimi.value + ';;';
      }
      if (urlUpolujEbooka.value.length > 0) {
        combineUrl += urlUpolujEbooka.value + ';;';
      }
      if (urlLubimyCzytac.value.length > 0) {
        combineUrl += urlLubimyCzytac.value + ';;';
      }
      if (combineUrl.endsWith(';;')) {
        combineUrl = combineUrl.slice(0, -2);
      }
      series.value.url = combineUrl;
      emit('save', series.value);
      submitted.value = false;
    }
  };

  const cancel = () => {
    emit('cancel');
  };
</script>

<template>
  <Dialog modal :style="{ width: 'min(95vw, 64rem)' }" close-on-escape @abort="cancel">
    <template #header>
      <p class="text-xl font-medium text-surface-900 dark:text-surface-0">
        {{ $props.isEdit ? 'Edytuj serię' : 'Dodaj nową serię' }}
      </p>
    </template>
    <div class="max-h-[70vh] overflow-y-auto pr-1">
      <div class="flex flex-col gap-6">
        <FormSectionCard title="Seria" :icon="QueueListIcon">
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="series-title">Nazwa</label>
            <InputText
              id="series-title"
              v-model="series.title"
              :pt="ptFieldInputText"
              :class="{ 'border-red-500 dark:border-red-400': showErrorTitle() }"
            />
            <small v-if="showErrorTitle()" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>
        </FormSectionCard>

        <FormSectionCard title="Linki zewnętrzne" :icon="LinkIcon">
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" for="series-legimi">URL Legimi</label>
              <InputText
                id="series-legimi"
                v-model="urlLegimi"
                :pt="ptFieldInputText"
                :class="{ 'border-red-500 dark:border-red-400': showErrorUrlLegimi() }"
              />
              <small v-if="showErrorUrlLegimi()" class="text-sm text-red-600 dark:text-red-400">
                Wpisz poprawny adres www.
              </small>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" for="series-upoluj">URL upolujebooka.pl</label>
              <InputText
                id="series-upoluj"
                v-model="urlUpolujEbooka"
                :pt="ptFieldInputText"
                :class="{ 'border-red-500 dark:border-red-400': showErrorUpolujEbooka() }"
              />
              <small v-if="showErrorUpolujEbooka()" class="text-sm text-red-600 dark:text-red-400">
                Wpisz poprawny adres www.
              </small>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" for="series-lubimy">URL lubimyczytac.pl</label>
              <InputText
                id="series-lubimy"
                v-model="urlLubimyCzytac"
                :pt="ptFieldInputText"
                :class="{ 'border-red-500 dark:border-red-400': showErrorLubimyCzytac() }"
              />
              <small v-if="showErrorLubimyCzytac()" class="text-sm text-red-600 dark:text-red-400">
                Wpisz poprawny adres www.
              </small>
            </div>
          </div>
        </FormSectionCard>

        <FormSectionCard title="Opis" :icon="DocumentTextIcon">
          <Textarea id="series-description" v-model="series.description" fluid rows="3" cols="30" :pt="ptTextareaField" />
        </FormSectionCard>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <i
            class="pi pi-book text-2xl"
            :class="series.hasNewBooks ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
            aria-hidden="true"
          />
          <span class="text-sm text-surface-600 dark:text-surface-400">Data sprawdzenia: {{ series.checkDate }}</span>
        </div>
        <div class="flex gap-4">
          <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel" />
          <OfficeButton text="Zapisz" btn-type="office-save" @click="submit" />
        </div>
      </div>
    </template>
  </Dialog>
</template>
