<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import TheMenu from '@/components/TheMenu.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import LogsHistoryTab from '@/features/admin/logs/components/LogsHistoryTab.vue';
  import LogsLiveTab from '@/features/admin/logs/components/LogsLiveTab.vue';
  import LogLevelsTab from '@/features/admin/logs/components/LogLevelsTab.vue';
  import { useAuthorizationStore } from '@/stores/authorization';

  type LogsTab = 'history' | 'live' | 'levels';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthorizationStore();

  // Zakładka „Poziomy logów” tylko dla ROLE_ADMIN (backend i tak zwróci 403 dla pozostałych).
  const availableTabs = computed<LogsTab[]>(() =>
    authStore.hasAccessAdmin ? ['history', 'live', 'levels'] : ['history', 'live']
  );

  // Aktywna zakładka trzymana w URL-u (?tab=history), żeby dało się wejść na nią wprost.
  const activeTab = computed<LogsTab>({
    get: () => {
      const tab = route.query.tab;
      return availableTabs.value.find(t => t === tab) ?? 'history';
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
          <Tab value="live">
            <span class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
              Na żywo
            </span>
          </Tab>
          <Tab v-if="authStore.hasAccessAdmin" value="levels">Poziomy logów</Tab>
        </TabList>
        <TabPanels class="!px-0">
          <TabPanel value="history">
            <LogsHistoryTab />
          </TabPanel>
          <TabPanel value="live">
            <LogsLiveTab />
          </TabPanel>
          <TabPanel v-if="authStore.hasAccessAdmin" value="levels">
            <LogLevelsTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </MainPageShell>
</template>
