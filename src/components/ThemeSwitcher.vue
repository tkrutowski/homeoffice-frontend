<template>
  <button
    type="button"
    class="flex h-11 w-11 items-center justify-center rounded-lg text-surface-0 transition-colors hover:bg-white/10"
    :aria-label="iconClass === 'pi-moon' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'"
    @click="onThemeToggle"
  >
    <i :class="`pi ${iconClass} text-2xl`" aria-hidden="true"></i>
  </button>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  const iconClass = ref<string>('pi-sun');

  const onThemeToggle = () => {
    const root = document.getElementsByTagName('html')[0];
    // root.classList.toggle('dark')
    iconClass.value = iconClass.value === 'pi-moon' ? 'pi-sun' : 'pi-moon';
    if (iconClass.value !== 'pi-moon') {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  onMounted(() => {
    const theme = localStorage.getItem('theme');
    const root = document.getElementsByTagName('html')[0];
    if (theme === 'dark') {
      root.classList.add('dark');
      // document.documentElement.classList.classList.add('dark');
      iconClass.value = 'pi-moon';
    } else {
      // document.documentElement.classList.classList.add('light');
      root.classList.add('light');
      iconClass.value = 'pi-sun';
    }
  });
</script>
