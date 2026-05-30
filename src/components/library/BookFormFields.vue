<script setup lang="ts">
  import type { PropType } from 'vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import {
    ptAutoCompleteInField,
    ptFieldInputText,
    ptTextareaField,
  } from '@/config/formFieldPt';
  import type { Author, Book, Category, Series } from '@/types/Book';
  import {
    BookOpenIcon,
    DocumentTextIcon,
    TagIcon,
    UserGroupIcon,
    QueueListIcon,
  } from '@heroicons/vue/24/outline';

  const book = defineModel<Book>('book', { required: true });
  const selectedAuthors = defineModel<Author[]>('selectedAuthors', { default: () => [] });
  const selectedSeries = defineModel<Series | null>('selectedSeries', { default: null });
  const selectedCategories = defineModel<Category[]>('selectedCategories', { default: () => [] });

  defineProps({
    filteredAuthors: {
      type: Array as PropType<Author[]>,
      default: () => [],
    },
    filteredSeries: {
      type: Array as PropType<Series[]>,
      default: () => [],
    },
    filteredCategories: {
      type: Array as PropType<Category[]>,
      default: () => [],
    },
    showErrorTitle: {
      type: Boolean,
      default: false,
    },
    showErrorAuthor: {
      type: Boolean,
      default: false,
    },
    showErrorCategory: {
      type: Boolean,
      default: false,
    },
    showErrorCover: {
      type: Boolean,
      default: false,
    },
    loadingAuthors: {
      type: Boolean,
      default: false,
    },
    loadingSeries: {
      type: Boolean,
      default: false,
    },
    loadingCategories: {
      type: Boolean,
      default: false,
    },
    showAddButtons: {
      type: Boolean,
      default: true,
    },
    idPrefix: {
      type: String,
      default: 'book',
    },
  });

  const emit = defineEmits<{
    searchAuthor: [event: { query: string }];
    searchSeries: [event: { query: string }];
    searchCategory: [event: { query: string }];
    addAuthor: [];
    addSeries: [];
    addCategory: [];
  }>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:items-stretch">
      <FormSectionCard title="Metadane książki" :icon="BookOpenIcon" class="h-full lg:col-span-4">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-title`">Tytuł</label>
            <InputText
              :id="`${idPrefix}-title`"
              v-model="book.title"
              maxlength="50"
              :pt="ptFieldInputText"
              :class="{ 'border-red-500 dark:border-red-400': showErrorTitle }"
            />
            <small v-if="showErrorTitle" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-author`">Autor</label>
            <div class="flex gap-2">
              <div
                class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-950"
                :class="{ 'border-red-500 dark:border-red-400': showErrorAuthor }"
              >
                <div
                  class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                >
                  <UserGroupIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <AutoComplete
                  :id="`${idPrefix}-author`"
                  v-model="selectedAuthors"
                  dropdown
                  multiple
                  force-selection
                  :suggestions="filteredAuthors"
                  :option-label="(author: Author) => author.firstName + ' ' + author.lastName"
                  :loading="loadingAuthors"
                  :pt="ptAutoCompleteInField"
                  class="min-w-0 flex-1"
                  @complete="emit('searchAuthor', $event)"
                />
              </div>
              <OfficeIconButton
                v-if="showAddButtons"
                title="Dodaj autora"
                :icon="loadingAuthors ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                class="h-9 w-9 shrink-0 self-center p-0 text-primary"
                @click="emit('addAuthor')"
              />
            </div>
            <small v-if="showErrorAuthor" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-[1fr,6rem]">
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-series`">Seria</label>
              <div class="flex gap-2">
                <div
                  class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-950"
                >
                  <div
                    class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                  >
                    <QueueListIcon class="h-5 w-5" aria-hidden="true" />
                  </div>
                  <AutoComplete
                    :id="`${idPrefix}-series`"
                    v-model="selectedSeries"
                    dropdown
                    force-selection
                    :suggestions="filteredSeries"
                    field="title"
                    option-label="title"
                    :loading="loadingSeries"
                    :pt="ptAutoCompleteInField"
                    class="min-w-0 flex-1"
                    @complete="emit('searchSeries', $event)"
                  />
                </div>
                <OfficeIconButton
                  v-if="showAddButtons"
                  title="Dodaj serię"
                  :icon="loadingSeries ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                  class="h-9 w-9 shrink-0 self-center p-0 text-primary"
                  @click="emit('addSeries')"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-series-no`">Część</label>
              <InputText
                :id="`${idPrefix}-series-no`"
                v-model="book.bookInSeriesNo"
                maxlength="5"
                :pt="ptFieldInputText"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-category`">Kategoria</label>
            <div class="flex gap-2">
              <div
                class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-950"
                :class="{ 'border-red-500 dark:border-red-400': showErrorCategory }"
              >
                <div
                  class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                >
                  <TagIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <AutoComplete
                  :id="`${idPrefix}-category`"
                  v-model="selectedCategories"
                  dropdown
                  multiple
                  force-selection
                  :suggestions="filteredCategories"
                  field="name"
                  option-label="name"
                  :loading="loadingCategories"
                  :pt="ptAutoCompleteInField"
                  class="min-w-0 flex-1"
                  @complete="emit('searchCategory', $event)"
                />
              </div>
              <OfficeIconButton
                v-if="showAddButtons"
                title="Dodaj kategorię"
                :icon="loadingCategories ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                class="h-9 w-9 shrink-0 self-center p-0 text-primary"
                @click="emit('addCategory')"
              />
            </div>
            <small v-if="showErrorCategory" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-cover`">URL okładki</label>
            <InputText
              :id="`${idPrefix}-cover`"
              v-model="book.cover"
              :pt="ptFieldInputText"
              :class="{ 'border-red-500 dark:border-red-400': showErrorCover }"
            />
            <small v-if="showErrorCover" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>
        </div>
      </FormSectionCard>

      <div
        class="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-surface-200 bg-surface-100 p-4 dark:border-surface-700 dark:bg-surface-950 lg:col-span-2 lg:min-h-0 lg:h-full"
      >
        <img
          v-if="book.cover && book.cover.length > 0"
          :src="book.cover"
          class="max-h-full max-w-full rounded-lg object-contain shadow-sm"
          alt="Okładka do książki"
        />
        <img
          v-else
          src="@/assets/images/no_cover.jpg"
          class="max-h-full max-w-full rounded-lg object-contain opacity-80"
          alt="Brak okładki"
        />
      </div>
    </div>

    <FormSectionCard title="Dodatkowe informacje" :icon="DocumentTextIcon">
      <div class="flex flex-col gap-2">
        <label class="text-sm text-surface-600 dark:text-surface-400" :for="`${idPrefix}-description`">Opis</label>
        <Textarea
          :id="`${idPrefix}-description`"
          v-model="book.description"
          fluid
          rows="5"
          cols="30"
          :pt="ptTextareaField"
        />
      </div>
    </FormSectionCard>
  </div>
</template>
