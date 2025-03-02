<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import router from '../router'
import {useAuthorizationStore} from '../stores/authorization'
import {useToast} from 'primevue/usetoast'

const authorizationStore = useAuthorizationStore()

const username = ref<string>('')
const password = ref<string>('')
const toast = useToast()

onMounted(() => {
  console.log('MOUNTED')
  authorizationStore.loginError = null
})

async function login() {
  const result = await authorizationStore.login(username.value, password.value)
  if (result) {
    goBack()
  }
}

watch(
    () => authorizationStore.loginError,
    (newValue) => {
      if (newValue) {
        toast.add({
          severity: 'error',
          summary: 'Logowanie',
          detail: newValue,
          life: 5000,
        })
      }
    },
    { immediate: true },
)

function goBack(): void {
  let history: string[] | [] = JSON.parse(localStorage.getItem('navigationHistory') || '[]')
  const lastAddress = history[history.length - 1]
  if (lastAddress && (lastAddress === '/error' || lastAddress === '/login')) {
    history = history.slice(-25)
    history = history.filter((item) => item !== lastAddress) // Usuń ostatnią odwiedzoną stronę
    localStorage.setItem('navigationHistory', JSON.stringify(history))
  }

  if (history.length > 0) router.replace(history[history.length - 1])
  else router.replace('/')
}
</script>
<template>
  <form class="max-w-96 mx-auto mt-48" @submit.prevent="login()">
    <p class="mb-5 mt-5 text-center text-3xl font-bold text-primary">Logowanie</p>

    <!-- USERNAME -->
    <FloatLabel class="">
      <InputText id="username" v-model="username" class="w-full" autocomplete="username" required/>
      <label for="username">Login</label>
    </FloatLabel>

    <!-- PASSWORD -->
    <FloatLabel class="mt-9">
      <Password
          id="password"
          v-model="password"
          toggle-mask
          required
          class="w-full"
          autocomplete="current-password"
          :input-style="{ width: '100%' }"
          :feedback="false"
      />
      <label for="password" class="w-full">Hasło</label>
    </FloatLabel>

    <!-- BUTTON -->
    <Button type="submit" class="mt-5 mb-1 font-bold w-full uppercase tracking-[5px]" outlined
    >zaloguj
    </Button
    >
    <p class="text-right mb-4">
      <router-link class="" to="/forgot-password">Nie pamiętam hasła</router-link>
    </p>
  </form>
</template>
