<script setup lang="ts">
import { ref, watch } from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import Calendar from "primevue/calendar";
import moment from "moment";

const emit = defineEmits<{
  (e: "save", date: string, amount: number): void;
  (e: "cancel"): void;
}>();
const props = defineProps({
  date: {
    type: String,
    require: false,
    default: "",
  },
  amount: {
    type: Number,
    require: true,
    default: 0,
  },
  isEdit: {
    type: Boolean,
    require: false,
    default: false,
  },
});
const newDate = ref<Date>(moment(props.date).toDate());
const newAmount = ref<number>(props.amount);
const submitted = ref(false);

watch(
  () => props.amount,
  (newValue) => {
    newAmount.value = newValue;
  },
  { immediate: true }
);

watch(
  () => props.date,
  (newValue) => {
    newDate.value = moment(newValue).toDate();
  },
  { immediate: true }
);

const isValid = () => {
  return newAmount.value > 0;
};
const showErrorAmount = () => {
  return submitted.value && newAmount.value > 0;
};
const submit = () => {
  submitted.value = true;
  if (isValid()) {
    emit("save", newDate.value, newAmount.value);
    submitted.value = false;
  }
};
const cancel = () => {
  emit("cancel");
};
</script>

<template>
  <Dialog modal class="p-fluid min-w-50vw" close-on-escape @abort="cancel">
    <template #header>
      <h3 class="">
        {{ $props.isEdit ? "Edytuj wpłatę" : "Dodaj wpłatę" }}
      </h3>
    </template>
    <!-- DATE -->
    <div class="flex flex-col mb-3">
      <label class="mb-0" for="name">Data płatności:</label>
      <DatePicker v-model="newDate" show-icon date-format="yy-mm-dd" />
    </div>

    <!-- AMOUNT -->
    <div class="flex flex-col mb-1">
      <label class="mb-0" for="amount">Kwota:</label>
      <InputNumber
        id="amount"
        v-model="newAmount"
        :class="{ 'p-invalid': showErrorAmount() }"
        required="true"
        :min-fraction-digits="0"
        :max-fraction-digits="2"
      />
      <small class="p-error">{{
        showErrorAmount() ? "Pole jest wymagane." : "&nbsp;"
      }}</small>
    </div>
    <template #footer>
      <div class="flex flex-row justify-content-end gap-2">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel" />
        <OfficeButton text="Zapisz" btn-type="office-save" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>
