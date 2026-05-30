<script setup lang="ts">
  import type { PropType } from 'vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import FormSectionCard from '@/components/library/FormSectionCard.vue';
  import LibraryOptionPills from '@/components/library/LibraryOptionPills.vue';
  import ReadingStatusStepper from '@/components/library/ReadingStatusStepper.vue';
  import { ptDatePickerField, ptSelectInField, ptTextareaField } from '@/config/formFieldPt';
  import type { Bookstore, UserBook } from '@/types/Book.ts';
  import {
    BookmarkIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    DocumentTextIcon,
    PhotoIcon,
  } from '@heroicons/vue/24/outline';

  const userbook = defineModel<UserBook>('userbook', { required: true });
  const selectedBookstore = defineModel<Bookstore | null>('selectedBookstore', { default: null });
  const readingDateFrom = defineModel<Date | null>('readingDateFrom', { default: null });
  const readingDateTo = defineModel<Date | null>('readingDateTo', { default: null });

  defineProps({
    bookstores: {
      type: Array as PropType<Bookstore[]>,
      default: () => [],
    },
    ownershipPillOptions: {
      type: Array as PropType<{ value: string; label: string; icon: string }[]>,
      required: true,
    },
    editionPillOptions: {
      type: Array as PropType<{ value: string; label: string; icon: string }[]>,
      required: true,
    },
    showErrorBookstore: {
      type: Boolean,
      default: false,
    },
    showErrorOwnership: {
      type: Boolean,
      default: false,
    },
    showErrorEditionType: {
      type: Boolean,
      default: false,
    },
    showErrorReadingStatus: {
      type: Boolean,
      default: false,
    },
    showErrorDateFrom: {
      type: Boolean,
      default: false,
    },
    showErrorDateTo: {
      type: Boolean,
      default: false,
    },
    readToErrorMessage: {
      type: String,
      default: 'Pole jest wymagane.',
    },
    loadingBookstore: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    bookstoreChange: [];
    addBookstore: [];
  }>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,min(280px,35%)] lg:items-start">
      <div class="flex flex-col gap-6">
        <FormSectionCard title="Źródło" :icon="BuildingStorefrontIcon">
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="userbook-bookstore">Księgarnia</label>
            <div class="flex gap-2">
              <div
                class="flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-950"
                :class="{ 'border-red-500 dark:border-red-400': showErrorBookstore }"
              >
                <div
                  class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
                >
                  <BuildingStorefrontIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <Select
                  id="userbook-bookstore"
                  v-model="selectedBookstore"
                  :options="bookstores"
                  option-label="name"
                  :loading="loadingBookstore"
                  :pt="ptSelectInField"
                  class="min-w-0 flex-1"
                  @change="emit('bookstoreChange')"
                />
              </div>
              <OfficeIconButton
                title="Dodaj księgarnię"
                :icon="loadingBookstore ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                class="h-9 w-9 shrink-0 self-center p-0 text-primary"
                @click="emit('addBookstore')"
              />
            </div>
            <small v-if="showErrorBookstore" class="text-sm text-red-600 dark:text-red-400">
              Pole jest wymagane.
            </small>
          </div>
        </FormSectionCard>

        <FormSectionCard title="Własność i format" :icon="BookmarkIcon">
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <span class="text-sm text-surface-600 dark:text-surface-400">Własność</span>
              <LibraryOptionPills
                v-model="userbook.ownershipStatus"
                class="w-full"
                :options="ownershipPillOptions"
                :invalid="showErrorOwnership"
              />
              <small v-if="showErrorOwnership" class="text-sm text-red-600 dark:text-red-400">
                Pole jest wymagane.
              </small>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-sm text-surface-600 dark:text-surface-400">Rodzaj wydania</span>
              <LibraryOptionPills
                v-model="userbook.editionType"
                class="w-full"
                :options="editionPillOptions"
                :invalid="showErrorEditionType"
              />
              <small v-if="showErrorEditionType" class="text-sm text-red-600 dark:text-red-400">
                Pole jest wymagane.
              </small>
            </div>
          </div>
        </FormSectionCard>

        <FormSectionCard title="Postęp czytania" :icon="ClockIcon">
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <span class="text-sm text-surface-600 dark:text-surface-400">Stan czytania</span>
              <ReadingStatusStepper
                v-model="userbook.readingStatus"
                class="w-full"
                :invalid="showErrorReadingStatus"
              />
              <small v-if="showErrorReadingStatus" class="text-sm text-red-600 dark:text-red-400">
                Pole jest wymagane.
              </small>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-600 dark:text-surface-400" for="userbook-date-from">Czytana od</label>
                <DatePicker
                  id="userbook-date-from"
                  v-model="readingDateFrom"
                  show-icon
                  show-button-bar
                  date-format="yy-mm-dd"
                  :invalid="showErrorDateFrom"
                  :pt="ptDatePickerField"
                />
                <small v-if="showErrorDateFrom" class="text-sm text-red-600 dark:text-red-400">
                  Pole jest wymagane.
                </small>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm text-surface-600 dark:text-surface-400" for="userbook-date-to">Czytana do</label>
                <DatePicker
                  id="userbook-date-to"
                  v-model="readingDateTo"
                  show-icon
                  show-button-bar
                  date-format="yy-mm-dd"
                  :invalid="showErrorDateTo"
                  :pt="ptDatePickerField"
                />
                <small v-if="showErrorDateTo" class="text-sm text-red-600 dark:text-red-400">
                  {{ readToErrorMessage }}
                </small>
              </div>
            </div>
          </div>
        </FormSectionCard>
      </div>

      <FormSectionCard title="Okładka" :icon="PhotoIcon" class="lg:sticky lg:top-4">
        <div
          class="flex items-center justify-center overflow-hidden rounded-xl border border-surface-200 bg-surface-100 p-3 dark:border-surface-700 dark:bg-surface-950"
        >
          <img
            v-if="userbook.book && userbook.book.cover.length > 0"
            :src="userbook.book.cover"
            class="max-h-[420px] w-auto max-w-full rounded-lg object-contain"
            alt="Okładka do książki"
          />
          <img
            v-else
            src="@/assets/images/no_cover.jpg"
            class="max-h-[300px] w-auto max-w-full rounded-lg object-contain opacity-80"
            alt="Brak okładki"
          />
        </div>
      </FormSectionCard>
    </div>

    <FormSectionCard title="Dodatkowe informacje" :icon="DocumentTextIcon">
      <div class="flex flex-col gap-2">
        <label class="text-sm text-surface-600 dark:text-surface-400" for="userbook-info">Notatki</label>
        <Textarea id="userbook-info" v-model="userbook.info" fluid rows="3" cols="30" :pt="ptTextareaField" />
      </div>
    </FormSectionCard>
  </div>
</template>
