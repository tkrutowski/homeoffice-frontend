<template>
  <div class="card flex justify-end p-2 ">
    <button type="button"
            class="inline-flex w-8 h-8 p-0 items-center justify-center surface-0 dark:surface-500 border border-yellow-300 rounded"
            @click="onThemeToggler">
      <i :class="`dark:text-white pi ${iconClass}`"/>
    </button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";


const iconClass = ref<string>('pi-sun');

const onThemeToggler = () => {
  const root = document.getElementsByTagName('html')[0];
  root.classList.toggle('p-dark');
  iconClass.value = iconClass.value === 'pi-moon' ? 'pi-sun' : 'pi-moon';
  iconClass.value !== 'pi-moon' ? localStorage.setItem('theme', '') : localStorage.setItem('theme', '.p-dark');
}

onMounted(() => {
  var theme = localStorage.getItem('theme');
  if (theme === ".p-dark") {
    const root = document.getElementsByTagName('html')[0];
    root.classList.add('p-dark');
    iconClass.value = 'pi-moon'
  }
})

</script>
