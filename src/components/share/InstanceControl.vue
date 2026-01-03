<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useEc2Control } from '@/composables/useEc2Control';
  import { useToast } from 'primevue/usetoast';

  const props = defineProps<{
    idInstance: string;
  }>();

  const { loading, getInstanceStatus, startInstance, stopInstance } = useEc2Control();
  const toast = useToast();

  const status = ref<'running' | 'stopped' | 'pending' | 'error' | null>(null);

  async function fetchStatus() {
    try {
      const data = await getInstanceStatus(props.idInstance);
      console.log('fetchStatus response:', data);
      // API zwraca status w polu 'state'
      const stateValue = data.state || data.status;
      if (stateValue) {
        // Normalizujemy wartość do lowercase
        status.value = stateValue.toLowerCase() as 'running' | 'stopped' | 'pending';
      } else {
        status.value = null;
      }
      console.log('Parsed status:', status.value);
    } catch (err) {
      console.error('fetchStatus error', err);
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się pobrać statusu instancji',
        life: 5000,
      });
    }
  }

  async function handleToggle() {
    // Zapamiętujemy poprzedni status przed zmianą
    const previousStatus = status.value;

    try {
      // Ustawiamy status na pending (żółty) podczas operacji
      status.value = 'pending';

      if (previousStatus === 'stopped' || previousStatus === null) {
        // Poprzedni status był stopped lub null, więc uruchamiamy
        await startInstance(props.idInstance);
        // Po sukcesie ustawiamy na running (zielony)
        status.value = 'running';
        toast.add({
          severity: 'success',
          summary: 'Sukces',
          detail: 'Instancja została uruchomiona',
          life: 3000,
        });
        // Odśwież status po dłuższej chwili aby zweryfikować rzeczywisty status
        setTimeout(async () => {
          await fetchStatus();
        }, 5000);
      } else if (previousStatus === 'running') {
        // Poprzedni status był running, więc zatrzymujemy
        await stopInstance(props.idInstance);
        // Po sukcesie ustawiamy na stopped (szary)
        status.value = 'stopped';
        toast.add({
          severity: 'success',
          summary: 'Sukces',
          detail: 'Instancja została zatrzymana',
          life: 3000,
        });
        // Odśwież status po dłuższej chwili aby zweryfikować rzeczywisty status
        setTimeout(async () => {
          await fetchStatus();
        }, 5000);
      }
    } catch (err) {
      status.value = 'error';
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: err instanceof Error ? err.message : 'Wystąpił błąd podczas operacji',
        life: 5000,
      });
      setTimeout(async () => {
        await fetchStatus();
      }, 3000);
    }
  }


  const buttonIcon = computed(() => {
    // Gdy instancja działa, pokazujemy ikonę stop
    if (status.value === 'running') {
      return 'pi pi-pause';
    }
    // W pozostałych przypadkach (stopped, pending, error, null) pokazujemy ikonę play
    return 'pi pi-play';
  });

  const buttonBackground = computed(() => {
    if (status.value === 'running') {
      return 'bg-green-50 dark:bg-green-900/20';
    }
    if (status.value === 'pending' || loading.value) {
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    }
    if (status.value === 'error') {
      return 'bg-red-50 dark:bg-red-900/20';
    }
    // stopped lub null
    return 'bg-orange-50 dark:bg-orange-900/20';
  });

  const buttonBorder = computed(() => {
    if (status.value === 'running') {
      return 'border-green-300 dark:border-green-700';
    }
    if (status.value === 'pending' || loading.value) {
      return 'border-yellow-300 dark:border-yellow-700';
    }
    if (status.value === 'error') {
      return 'border-red-300 dark:border-red-700';
    }
    // stopped lub null
    return 'border-orange-300 dark:border-orange-700';
  });

  const buttonIconColor = computed(() => {
    if (status.value === 'running') {
      return 'text-green-600 dark:text-green-400';
    }
    if (status.value === 'pending' || loading.value) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    if (status.value === 'error') {
      return 'text-red-600 dark:text-red-400';
    }
    // stopped lub null
    return 'text-orange-600 dark:text-orange-400';
  });

  onMounted(() => {
    fetchStatus();
  });
</script>

<template>
  <div class="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg border border-primary">
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-default"
      :class="[buttonBackground, buttonBorder]"
    >
      <i class="pi pi-server text-base" :class="buttonIconColor" />
    </div>
    <button
      @click="handleToggle"
      :disabled="loading"
      class="w-10 h-8 rounded-lg flex items-center justify-center border transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[buttonBackground, buttonBorder]"
    >
      <i :class="[buttonIcon, buttonIconColor, 'text-base']" />
    </button>
  </div>
</template>
