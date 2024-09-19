<script setup lang="ts">
import OfficeButton from "@/components/OfficeButton.vue";
import { ref } from "vue";

defineProps({
  msg: {
    type: String,
    required: true,
    default: "NO MESSAGE",
  },
  label1: {
    type: String,
    required: false,
    default: "label1",
  },
  label2: {
    type: String,
    required: false,
    default: "label2",
  },
});
const emit = defineEmits<{
  (e: "save", in1: string, in2: string): void;
  (e: "cancel"): void;
}>();

const input1 = ref<string>("");
const input2 = ref<string>("");

const save = () => {
  emit("save", input1.value, input2.value);
};

const cancel = () => {
  emit("cancel");
};
</script>

<template>
  <Dialog :style="{ width: '550px' }" :modal="true">
    <template #header>
      <h4>{{ msg }}</h4>
    </template>
    <div class="flex flex-col mb-3">
      <label for="label1" class="mb-1">{{ label1 }}</label>
      <InputText id="label1" v-model="input1" class="flex-auto" autofocus />
    </div>
    <div v-if="label2 !== 'label2'" class="flex flex-col">
      <label for="label2" class="mb-1">{{ label2 }}</label>
      <InputText id="label2" v-model="input2" class="flex-auto" />
    </div>
    <template #footer>
      <div class="flex flex-row gap-4 ">
        <OfficeButton
          text="Anuluj"
          btn-type="office-regular"
          @click="cancel"
          @abort="cancel"
        ></OfficeButton>
        <OfficeButton
          text="zapisz"
          btn-type="office-save"
          @click="save"
        ></OfficeButton>
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
