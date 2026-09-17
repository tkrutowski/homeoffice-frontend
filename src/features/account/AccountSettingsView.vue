<script setup lang="ts">
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import TheMenu from '@/components/TheMenu.vue';
  import ProfileSection from '@/features/account/profile/ProfileSection.vue';
  import PasswordSection from '@/features/account/password/PasswordSection.vue';
  import ActivitySection from '@/features/account/activity/ActivitySection.vue';
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenu />
    </template>

    <div class="min-h-0 w-full bg-surface-100 px-4 py-6 dark:bg-surface-950 sm:py-8">
      <div class="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 class="text-2xl font-medium tracking-tight text-surface-900 dark:text-surface-0 sm:text-3xl">
          Ustawienia konta
        </h1>

        <ProfileSection />
        <PasswordSection />
        <ActivitySection />
      </div>
    </div>
  </MainPageShell>
</template>
