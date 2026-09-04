<script setup lang="ts">
  interface Props {
    columns?: 1 | 2 | 3 | 4;
    rows?: number;
    height?: string;
    fullWidth?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    columns: 2,
    rows: 1,
    height: 'h-72',
    fullWidth: false,
  });

  const getGridClass = () => {
    const baseClass = `grid grid-cols-1 gap-6`;
    const responsiveClass = `md:grid-cols-${props.columns}`;
    return `${baseClass} ${responsiveClass}`;
  };
</script>

<template>
  <div v-if="fullWidth" class="flex flex-col gap-6">
    <div v-for="row in rows" :key="row" :class="getGridClass()">
      <div class="rounded-2xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-700 dark:bg-surface-950">
        <Skeleton width="60%" height="1.5rem" class="mb-4 mx-auto"></Skeleton>
        <div :class="height">
          <Skeleton width="100%" height="100%" border-radius="0.5rem"></Skeleton>
        </div>
      </div>
    </div>
  </div>

  <div v-else :class="getGridClass()">
    <div
      v-for="n in rows * columns"
      :key="n"
      class="rounded-2xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-700 dark:bg-surface-950"
    >
      <Skeleton width="60%" height="1.5rem" class="mb-4 mx-auto"></Skeleton>
      <div :class="height">
        <Skeleton width="100%" height="100%" border-radius="0.5rem"></Skeleton>
      </div>
    </div>
  </div>
</template>
