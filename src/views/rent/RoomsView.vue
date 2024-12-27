<script setup lang="ts">
import {useRoomStore} from "../../stores/rooms.ts";
import TheMenuRent from "../../components/rent/TheMenuRent.vue";
import RoomDisplay from "../../components/rent/Room.vue";
import type {Room} from "../../types/Room"
import {onMounted, ref} from "vue";

const roomStore = useRoomStore();

onMounted(()=> roomStore.getRooms())

// const rooms = ref<Room[]>(await roomStore.getRooms());
</script>

<template>
  <TheMenuRent/>
  <p>ROOM</p>
  {{roomStore.rooms.length}}
  <div class="flex flex-row flex-wrap justify-center gap-7">

  <div v-for="room in roomStore.rooms" :key="room.id" >

  <RoomDisplay :room="room"/>
  </div>
  </div>

</template>

<style scoped>

</style>