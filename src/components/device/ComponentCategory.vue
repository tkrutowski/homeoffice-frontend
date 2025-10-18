<script setup lang="ts">
  import { computed, type PropType, ref } from 'vue';
  import type { ComponentType, Computer } from '@/types/Computer.ts';
  import {
    ComputerDesktopIcon,
    CpuChipIcon,
    CircleStackIcon,
    SpeakerWaveIcon,
    KeyIcon,
    CursorArrowRippleIcon,
    BoltIcon,
    UsersIcon,
    ServerIcon,
    TvIcon as DisplayIcon,
    Square3Stack3DIcon,
    ArrowPathRoundedSquareIcon,
    PhotoIcon,
  } from '@heroicons/vue/24/solid';

  const props = defineProps({
    componentType: {
      type: Object as PropType<ComponentType>,
      required: true,
    },
    computer: {
      type: Object as PropType<Computer>,
      required: true,
    },
  });
  const emit = defineEmits<{
    (e: 'addView', componentType: ComponentType): void;
    (e: 'removeView', componentType: ComponentType): void;
  }>();

  const selected = ref<boolean>(false);

  const calculateQuantity = computed(() => {
    if (!props.computer || !props.componentType) {
      console.log('Missing required props, returning 0');
      return 0;
    }

    const component = props.computer[props.componentType.column];

    if (Array.isArray(component)) {
      return component.length;
    } else {
      if (component) return 1;
      else return 0;
    }
  });

  const getIcon = computed(() => {
    switch (props.componentType.name) {
      case 'PROCESSOR':
        return CpuChipIcon;
      case 'MOTHERBOARD':
        return ServerIcon;
      case 'COMPUTER_CASE':
        return ComputerDesktopIcon;
      case 'RAM':
        return Square3Stack3DIcon;
      case 'GRAPHICS_CARD':
        return PhotoIcon;
      case 'DISK':
        return CircleStackIcon;
      case 'POWER':
        return BoltIcon;
      case 'DISPLAY':
        return DisplayIcon;
      case 'KEYBOARD':
        return KeyIcon;
      case 'MOUSE':
        return CursorArrowRippleIcon;
      case 'SOUND_CARD':
        return SpeakerWaveIcon;
      case 'USB':
        return UsersIcon;
      case 'COOLER':
        return ArrowPathRoundedSquareIcon;
      default:
        return ComputerDesktopIcon;
    }
  });

  const view = () => {
    if (selected.value) {
      selected.value = false;
      emit('removeView', props.componentType);
    } else {
      selected.value = true;
      emit('addView', props.componentType);
    }
  };
</script>

<template>
  <div
    class="hover:bg-surface-100 hover:dark:bg-surface-800 border border-primary rounded-lg p-4 mb-4 cursor-pointer flex justify-between items-center"
    :class="{
      'dark:bg-surface-700 bg-surface-200': selected,
    }"
    @click="view"
  >
    <div>
      <p class="pb-2">
        Kategoria:
        <span class="text-xl font-semibold pl-2">{{ props.componentType.viewName }}</span>
      </p>
      <p class="pb-2">
        Ilość: <span class="font-semibold pl-2">{{ calculateQuantity }}</span>
      </p>
    </div>
    <component :is="getIcon" class="h-12 w-12 text-primary" />
  </div>
</template>
