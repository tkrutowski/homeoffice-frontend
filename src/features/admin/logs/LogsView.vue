<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import TheMenu from '@/components/TheMenu.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import LogsHistoryTab from '@/features/admin/logs/components/LogsHistoryTab.vue';

  type LogsTab = 'history';
  const TABS: LogsTab[] = ['history'];

  const route = useRoute();
  const router = useRouter();

  // Aktywna zakładka trzymana w URL-u (?tab=history), żeby dało się wejść na nią wprost.
  const activeTab = computed<LogsTab>({
    get: () => {
      const tab = route.query.tab;
      return TABS.find(t => t === tab) ?? 'history';
    },
    set: value => {
      router.replace({ query: { ...route.query, tab: value } });
    },
  });
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenu />
    </template>

    <div class="mx-2 my-3 flex flex-col gap-4 px-2">
      <h1 class="m-0 text-xl font-semibold text-surface-900 dark:text-surface-0">Logi</h1>

      <Tabs v-model:value="activeTab" lazy>
        <TabList>
          <Tab value="history">Historia</Tab>
        </TabList>
        <TabPanels class="!px-0">
          <TabPanel value="history">
            <LogsHistoryTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </MainPageShell>
</template>
