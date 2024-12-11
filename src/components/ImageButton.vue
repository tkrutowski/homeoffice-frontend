<script setup lang="ts">
const props = defineProps({
  imgSrc: {
    type: String,
    required: false,
    default: 'logo',
  },
  color: {
    type: String,
    required: false,
    default: '#268c73',
  },
  btnDisabled: {
    type: Boolean,
    required: false,
  },
  width: {
    type: String,
    default: '40px',
  },
  height: {
    type: String,
    default: '40px',
  },
})
</script>
<template>
  <Button class="image-button" :disabled="btnDisabled">
    <img
      v-if="props.imgSrc === 'logo'"
      src="@/assets/HomeOffice.png"
      :style="{ width: props.width, height: props.height }"
    />
    <img
      v-else-if="props.imgSrc === 'add-to-library'"
      :style="{ width: props.width, height: props.height }"
      src="@/assets/images/add-to-library.png"
    />
    <img
      v-else-if="props.imgSrc === 'onShell'"
      :style="{ width: props.width, height: props.height }"
      src="@/assets/images/already-on-bookshelf.png"
      alt="On shell"
    />
    <img
      v-else-if="props.imgSrc === 'add-to-shell'"
      :style="{ width: props.width, height: props.height }"
      src="@/assets/images/add-to-shelf.png"
    />
    <img
      v-else-if="props.imgSrc === 'reading'"
      :style="{ width: props.width, height: props.height }"
      src="@/assets/images/reading-book.png"
    />
    <img
      v-else-if="props.imgSrc === 'read'"
      :style="{ width: props.width, height: props.height }"
      src="@/assets/images/already-read.png"
    />
  </Button>
</template>
<style scoped>
.image-button {
  display: inline-block;
  background-color: transparent;
  border-style: solid;
  border-color: transparent;
  cursor: pointer;
  outline: none;
  padding: 5px;
  width: 50px;
}

.image-button:hover {
  background-color: transparent !important;
  border-style: solid;
  border-color: rgba(219, 117, 0, 1) !important;
}

.image-button:focus {
  outline: none;
  box-shadow: none;
  background-color: transparent;
  border: none;
}
</style>
