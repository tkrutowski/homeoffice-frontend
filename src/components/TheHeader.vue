<script lang="ts" setup>
  import { computed } from 'vue';
  import { useAuthorizationStore } from '@/stores/authorization';
  import ThemeSwitcher from './ThemeSwitcher.vue';
  import InstanceControl from '@/components/share/InstanceControl.vue';
  import NotificationsBell from '@/components/NotificationsBell.vue';
  import { EC2_CONTROL_ENABLED, EC2_INSTANCE_ID, EC2_INSTANCE_NAME } from '@/config/ec2';
  import { useMyProfileQuery } from '@/features/account/profile/queries/useProfileQueries';
  import logoMini from '@/assets/logo_mini.png';

  const authStore = useAuthorizationStore();

  const profileQuery = useMyProfileQuery(computed(() => authStore.isAuthenticatedOrToken));

  const fullName = computed(() => {
    const profile = profileQuery.data.value;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`.trim();
    }
    return authStore.username;
  });

  const initials = computed(() => {
    const profile = profileQuery.data.value;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();
    }
    return authStore.username.slice(0, 2).toUpperCase();
  });
</script>

<template>
  <header class="flex h-20 w-full items-center justify-between gap-4 bg-[#515455] px-6 sm:px-10">
    <router-link :to="{ name: 'Home' }" class="flex items-center gap-3">
      <img :src="logoMini" alt="HomeOffice logo" class="h-10 w-10 rounded-xl object-cover" />
      <span class="text-xl font-bold text-surface-0">HomeOffice</span>
    </router-link>

    <div class="flex items-center gap-4">
      <div v-if="EC2_CONTROL_ENABLED" class="flex items-center gap-1">
        <InstanceControl :idInstance="'i-0c84ab8759cefd840'" :nameInstance="'Smartgaz'" />
        <InstanceControl :idInstance="EC2_INSTANCE_ID" :nameInstance="EC2_INSTANCE_NAME" />
      </div>

      <NotificationsBell v-if="authStore.isAuthenticatedOrToken" />
      <ThemeSwitcher />

      <router-link
        v-if="authStore.isAuthenticatedOrToken"
        :to="{ name: 'AccountSettings' }"
        class="flex items-center gap-3 rounded-full border-2 border-primary py-1.5 pl-1.5 pr-5 transition-colors hover:bg-white/10"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast"
        >
          {{ initials }}
        </span>
        <span class="max-w-[12rem] truncate text-lg font-bold text-surface-0">{{ fullName }}</span>
      </router-link>
    </div>
  </header>
</template>
