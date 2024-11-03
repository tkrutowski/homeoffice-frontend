<script setup lang="ts">
import {onMounted, ref} from "vue";
import router from "@/router";
import {useAuthorizationStore} from "../stores/authorization";
import OfficeButton from "../components/OfficeButton.vue";
import { useToast } from "primevue/usetoast";
const authorizationStore = useAuthorizationStore();

const username = ref<string>("");
const password = ref<string>("");
const toast = useToast();

onMounted(() => {
  console.log("MOUNTED");
  authorizationStore.loginError = false;
});

async function login() {
  let result = await authorizationStore.login(username.value, password.value);

  if (result) {
    // router.back();
    goBack()
  }else {
    toast.add({
      severity: "error",
      summary: "Logowanie",
      detail: "Niepoprawne dane logowania",
      life: 5000,
    });
  }
}

function goBack(): void {
  let history: string[] | [] = JSON.parse(localStorage.getItem('navigationHistory') || '[]');
  let lastAddress = history[history.length - 1];
  if (lastAddress && (lastAddress === "/error" || lastAddress === "/login")) {
    history = history.slice(-25);
    history = history.filter(item => item !== lastAddress); // Usuń ostatnią odwiedzoną stronę
    localStorage.setItem('navigationHistory', JSON.stringify(history));
  }

  if (history.length > 0)
    router.replace(history[history.length - 1]);
  else
    router.replace("/");
}

</script>
<template>
  <form
      class="login-form  mt-1 mt-md-5"
      @submit.prevent="login()"
  >
    <h2 class="mb-5 mt-5 text-center font-bold text-color!important" >Logowanie</h2>

    <!-- USERNAME -->
    <FloatLabel class="">
      <InputText
          id="username"
          v-model="username"
          class="w-full"
          autocomplete="username"
          required
      />
      <label for="username">Login</label>
    </FloatLabel>

    <!-- PASSWORD -->
    <FloatLabel class="mt-9">
      <Password
id="password"
                v-model="password"
                toggle-mask
                required
                class="w-full text-yellow-400"
                autocomplete="current-password"
                :input-style="{'width':'100%'}"
                :feedback="false"

      />
      <label for="password" class="w-full">Hasło</label>
    </FloatLabel>


    <!-- BUTTON -->
    <office-button
        text="zaloguj się"
        class="btn mt-5 mb-1"
        style="width: 100%"
        btn-type="office-regular"
        type="submit"
    >Zaloguj się
    </office-button>
    <p class="text-right mb-4">
      <router-link class="color-gray link" to="/forgot-password"
      >Nie pamiętam hasła
      </router-link
      >
    </p>
  </form>
</template>

<style scoped>
#error {
  color: red;
}

/* unvisited link */
.link:link {
  color: var(--text-color);
}

/* visited link */
.link:visited {
  color: var(--text-color);
}

/* mouse over link */
.link:hover {
  color: var(--body-text-color)!important;
  text-decoration: none;
}

.login-form {
  max-width: 400px;
  margin: auto;
  margin-top: 200px;

}

</style>
