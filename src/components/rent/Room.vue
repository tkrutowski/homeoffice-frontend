<script setup lang="ts">

import OfficeIconButton from "@/components/OfficeIconButton.vue";
import {computed, type PropType} from "vue";
import type {UserBook} from "@/types/Book.ts";
import type {BedType, Room} from "@/types/Room.ts";
import {UtilsService} from "../../service/UtilsService.ts";

const props = defineProps({
  room: {
    type: Object as PropType<Room>,
    required: true,
  },
})

const singleBed = computed(()=>{
  console.log('single',props)
  return  props.room?.bed?.filter((bed: BedType) => bed === "SINGLE").length || 0
})

const doubleBed = computed(()=>{
  return  props.room?.bed?.filter((bed: BedType) => bed === "DOUBLE").length || 0
})

const roomColor = computed(()=>{
  return  props.room?.color
})
</script>

<template>
  <Card v-if="props.room" class="w-[300px] m-4 shadow-2xl rounded-t-2xl  border" :style="{borderColor: roomColor}">
    <template #header>
<!--      <div :class="['flex flex-row justify-between  rounded-t-2xl ', `bg-[${props.room.color}]`]">-->
      <div class="flex flex-row  justify-between dark:bg-surface-700 bg-surface-200 rounded-t-2xl border-b" :style="{borderColor: roomColor}"  >
        <p class="p-3 text-2xl font-medium" :style="{color: roomColor}">{{ props.room.name }}</p>

        <div class="flex flex-row items-center gap-2">
          <OfficeIconButton
              title="Edycja książki na półce"
              icon="pi pi-file-edit"
              class="pr-0"
          />

          <OfficeIconButton
              title="Usunięcie książki z półki"
              icon="pi pi-trash"
              severity="danger"
              class="mr-2"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="text-color flex flex-col">
<p class="text-sm">Ilość łóżek:</p>
      <div class=" flex items-center gap-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-12 h-12 fill-current text-black dark:text-white">
          <path d="M57.01953,28.4104V15.12793a3.31572,3.31572,0,0,0-3.168-3.43945H10.3291a3.3165,3.3165,0,0,0-3.16894,3.43945V28.366A3.89066,3.89066,0,0,0,4,32.18066V47.1123a.99974.99974,0,0,0,1,1H7.15723v3.19922a.99973.99973,0,0,0,1,1h4.4873a.99973.99973,0,0,0,1-1V48.1123H50.53516v3.19922a.99973.99973,0,0,0,1,1h4.4873a.99973.99973,0,0,0,1-1V48.1123H59a.99974.99974,0,0,0,1-1V32.18066A3.88725,3.88725,0,0,0,57.01953,28.4104ZM10.3291,13.68848H53.85156a1.32691,1.32691,0,0,1,1.168,1.43945V28.29248H50.96484v-4.519A3.0454,3.0454,0,0,0,47.916,20.73926H40.06249a3.04541,3.04541,0,0,0-3.04882,3.03418v4.519H27.03223v-4.519a3.04562,3.04562,0,0,0-3.04981-3.03418H16.12988a3.04541,3.04541,0,0,0-3.04883,3.03418v4.519H9.16016V15.12793A1.32692,1.32692,0,0,1,10.3291,13.68848Zm28.68457,14.604v-4.519a1.04285,1.04285,0,0,1,1.04882-1.03418H47.916a1.05566,1.05566,0,0,1,1.04882,1.03418v4.519Zm-23.93262,0v-4.519a1.04286,1.04286,0,0,1,1.04883-1.03418h7.85254a1.05588,1.05588,0,0,1,1.04981,1.03418v4.519Zm-7.19335,2c13.02183-.00009,29.03173.00007,42.07472,0h6.1499A1.89007,1.89007,0,0,1,58,32.18066v3.666H6v-3.666A1.89008,1.89008,0,0,1,7.8877,30.29248Zm3.75683,20.019H9.15723V48.1123h2.4873Zm43.37793,0h-2.4873V48.1123h2.4873Zm1.02179-4.19922c-1.332-.00154-40.8701.00111-43.378,0-1.40064-.00082-5.29017.00054-6.66626,0l0-8.26562H58V46.1123Z"></path>
        </svg>
        <span class="text-3xl">{{ doubleBed }}</span>
      </div>

      <div class=" flex items-center gap-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="single-bed" class="w-12 h-12 fill-current text-black dark:text-white">
          <path d="M53.69 38.13c.004-.044.014-.085.014-.13v-3a4.004 4.004 0 0 0-4-4h-.778V19a2.002 2.002 0 0 0-2-2H17.074a2.002 2.002 0 0 0-2 2v12h-.778a4.004 4.004 0 0 0-4 4v3c0 .045.01.086.013.13A1.998 1.998 0 0 0 9 40v8a1.972 1.972 0 0 0 .097.583A.986.986 0 0 0 9 49v2a1 1 0 0 0 2 0v-1h42v1a1 1 0 0 0 2 0v-2a.985.985 0 0 0-.097-.417A1.972 1.972 0 0 0 55 48v-8a1.998 1.998 0 0 0-1.31-1.87ZM17.075 19h29.852v12h-7.977a2.5 2.5 0 0 0-2.449-3h-9a2.5 2.5 0 0 0-2.45 3h-7.976ZM27 30.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5ZM12.296 35a2.002 2.002 0 0 1 2-2h35.408a2.002 2.002 0 0 1 2 2l.001 3h-39.41ZM11 48v-8h42l.001 8Z"></path>
        </svg>

        <span class="text-3xl">{{ singleBed }}</span>
      </div>
      </div>
    </template>
    <template #footer>
        <p class="mt-0 mb-2">
          Cena:
          <strong>{{ UtilsService.formatCurrency(props.room.price) }}</strong>
        </p>
    </template>
  </Card>
</template>

<style scoped>

</style>