<script setup lang="ts">
  import type { PropType } from 'vue';
  import type { Firm } from '@/types/Firm';
  import {
    InformationCircleIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    BuildingOffice2Icon,
  } from '@heroicons/vue/24/outline';

  defineProps({
    firm: {
      type: Object as PropType<Firm>,
      required: true,
    },
    showErrorName: {
      type: Boolean,
      required: true,
    },
    showErrorZip: {
      type: Boolean,
      required: true,
    },
    showErrorMail: {
      type: Boolean,
      required: true,
    },
    ptFieldInputText: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    ptTextareaField: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  });
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
        <InformationCircleIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
        <span>Informacje ogólne</span>
      </h2>

      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-name">Nazwa firmy</label>
          <div
            class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
            :class="{ 'border-red-500 dark:border-red-400': showErrorName }"
          >
            <div
              class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
            >
              <BuildingOffice2Icon class="h-5 w-5" aria-hidden="true" />
            </div>
            <InputText id="firm-name" v-model="firm.name" maxlength="100" :pt="ptFieldInputText" />
          </div>
          <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorName ? 'Pole jest wymagane.' : '\u00a0'
          }}</small>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
        <MapPinIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
        <span>Adres</span>
      </h2>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-street">Ulica</label>
          <InputText id="firm-street" v-model="firm.address.street" maxlength="100" :pt="ptFieldInputText" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-zip">Kod</label>
          <InputText
            id="firm-zip"
            v-model="firm.address.zip"
            maxlength="6"
            :pt="ptFieldInputText"
            :class="{ 'p-invalid': showErrorZip }"
          />
          <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
            showErrorZip ? 'Prawidłowy format to: 61-754' : '\u00a0'
          }}</small>
        </div>
        <div class="flex flex-col gap-2 md:col-span-3">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-city">Miasto</label>
          <InputText id="firm-city" v-model="firm.address.city" maxlength="100" :pt="ptFieldInputText" />
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
        <PhoneIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
        <span>Kontakt</span>
      </h2>

      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-phone">Telefon</label>
            <InputText id="firm-phone" v-model="firm.phone" maxlength="30" :pt="ptFieldInputText" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-phone2">Telefon 2</label>
            <InputText id="firm-phone2" v-model="firm.phone2" maxlength="30" :pt="ptFieldInputText" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-fax">Fax</label>
            <InputText id="firm-fax" v-model="firm.fax" maxlength="30" :pt="ptFieldInputText" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-mail">E-mail</label>
            <div
              class="flex min-h-[2.75rem] overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-900"
              :class="{ 'border-red-500 dark:border-red-400': showErrorMail }"
            >
              <div
                class="flex shrink-0 items-center border-r border-surface-300 px-3 text-surface-500 dark:border-surface-600 dark:text-surface-400"
              >
                <EnvelopeIcon class="h-5 w-5" aria-hidden="true" />
              </div>
              <InputText id="firm-mail" v-model="firm.mail" maxlength="100" :pt="ptFieldInputText" />
            </div>
            <small class="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">{{
              showErrorMail ? 'Niepoprawny format.' : '\u00a0'
            }}</small>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-600 dark:text-surface-400" for="firm-www">WWW</label>
            <InputText id="firm-www" v-model="firm.www" maxlength="100" :pt="ptFieldInputText" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
        <DocumentTextIcon class="h-5 w-5 text-orange-500" aria-hidden="true" />
        <span>Dodatkowe informacje</span>
      </h2>
      <Textarea id="firm-other-info" v-model="firm.otherInfo" :pt="ptTextareaField" rows="5" auto-resize />
    </div>
  </div>
</template>
