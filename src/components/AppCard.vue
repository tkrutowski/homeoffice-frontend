<script setup lang="ts">
const emit = defineEmits<{
  (e: 'clicked'): void
}>()

defineProps({
  textTitle: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: true,
  },
})
function clicked() {
  console.log('clicked')
  emit('clicked')
}
</script>
<template>
  <Card class="hover:border-primary border dark:border-surface-600 border-surface-100">
    <template #header>
      <p class="mb-0 text-center font-bold pt-2 text-2xl tracking-widest">
        {{ textTitle }}
      </p>
    </template>

    <template #content>
      <p class="text-center">{{ textContent }}</p>
    </template>

    <template #footer>
      <div class="card-footer">
        <Button class="font-bold uppercase tracking-wider w-full" outlined :onclick="clicked"
          >wejście</Button
        >
      </div>
    </template>
  </Card>
</template>
<style scoped>
.card-footer {
  display: flex;
  justify-content: center;
}
.header {
  font-weight: bolder;
  letter-spacing: 1.2px;
}
</style>
