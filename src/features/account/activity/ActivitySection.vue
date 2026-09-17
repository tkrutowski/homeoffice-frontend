<script setup lang="ts">
  import moment from 'moment';
  import { ClockIcon } from '@heroicons/vue/24/outline';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import { useMyActivityQuery } from '@/features/account/activity/queries/useActivityQueries';
  import type { AccountActivityAction } from '@/features/account/activity/types';

  // Wywołane defensywnie: moment.locale('pl') jest dziś wołane lokalnie tylko w UserPayments.vue,
  // więc bez tego kolejność ładowania widoków mogłaby wymusić angielskie napisy "X hours ago".
  moment.locale('pl');

  const activityQuery = useMyActivityQuery(10);

  function formatLastLogin(date: Date): string {
    return moment(date).format('DD.MM.YYYY, HH:mm');
  }

  function formatRelative(date: Date): string {
    return moment(date).fromNow();
  }

  function actionIconClass(action: AccountActivityAction): string {
    switch (action) {
      case 'CREATE':
        return 'pi pi-plus-circle';
      case 'DELETE':
        return 'pi pi-trash';
      case 'UPDATE':
      default:
        return 'pi pi-pencil';
    }
  }

  function actionDotClass(action: AccountActivityAction): string {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400';
      case 'DELETE':
        return 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400';
      case 'UPDATE':
      default:
        return 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400';
    }
  }
</script>

<template>
  <FormSectionCard title="Aktywność konta" :icon="ClockIcon">
    <p
      class="mb-4 border-b border-surface-200 pb-4 text-sm text-surface-500 dark:border-surface-700 dark:text-surface-400"
    >
      <template v-if="activityQuery.data.value?.lastLoginDate">
        Ostatnie logowanie: {{ formatLastLogin(activityQuery.data.value.lastLoginDate) }}
      </template>
      <template v-else> To Twoje pierwsze logowanie odkąd wprowadziliśmy tę funkcję. </template>
    </p>

    <ul v-if="activityQuery.data.value?.recentChanges.length" class="flex flex-col gap-3">
      <li
        v-for="(entry, index) in activityQuery.data.value.recentChanges"
        :key="index"
        class="flex gap-3 rounded-lg border border-surface-200 bg-surface-50/80 px-3 py-2.5 dark:border-surface-700 dark:bg-surface-900/50"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          :class="actionDotClass(entry.action)"
        >
          <i :class="actionIconClass(entry.action)" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm leading-snug text-surface-900 dark:text-surface-0">{{ entry.summary }}</p>
          <p class="mt-1 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <span class="rounded-full border border-surface-300 px-2 py-0.5 font-medium dark:border-surface-600">{{
              entry.moduleTag || 'Inne'
            }}</span>
            <span>{{ formatRelative(entry.changedAt) }}</span>
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak zarejestrowanej aktywności.</p>
  </FormSectionCard>
</template>
