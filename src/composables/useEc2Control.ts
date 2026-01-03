// composables/useEc2Control.ts
import {ref} from 'vue';

const API_URL = 'https://vxy52veych.execute-api.eu-central-1.amazonaws.com';

export function useEc2Control() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function controlInstance(instanceId: string, action: 'start' | 'stop' | 'status') {
    console.log('controlInstance', instanceId, action);
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/ec2/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function startInstance(instanceId: string) {
    return controlInstance(instanceId, 'start');
  }

  async function stopInstance(instanceId: string) {
    return controlInstance(instanceId, 'stop');
  }
  async function getInstanceStatus(instanceId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/ec2/status?instanceId=${encodeURIComponent(instanceId)}&action=status`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  return {
    loading,
    error,
    startInstance,
    stopInstance,
    getInstanceStatus,
    controlInstance,
  };
}
