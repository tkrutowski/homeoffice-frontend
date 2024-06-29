import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import User from "@/assets/types/User";

export const useUsersStore = defineStore("user", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingUsers: false,

    users: [] as User[],
  }),

  //getters = computed
  getters: {
    // getSortedInvoices: (state) =>
    //   state.invoices.sort((a, b) => a.idInvoice - b.idInvoice),
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET USER FULL NAME
    //
    getUserFullName(idUser: number): string {
      const user = this.users.find((user) => user.id === idUser);
      if (user) return user.firstName + " " + user.lastName;
      else return "Brak danych";
    },
    //
    //Get user by id
    //
    getUser(idUser: number): User | undefined {
      const user = this.users.find((user) => user.id === idUser);
      if (user) return user;
      else return undefined;
    },

    //--------------------------------------DATABASE--------------------------------------
    //
    //GET USERS
    //
    async getUsersFromDb(): Promise<void> {
      console.log("START - getUsersFromDb()");
      this.loadingUsers = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        if (this.users.length === 0) {
          const response = await httpCommon.get(`/v1/user`, {
            headers: authorization.accessToken !== "null" ? headers : {},
          });
          console.log("getUsersFromDb() - Ilosc[]: " + response.data.length);
          this.users = response.data;
        } else {
          console.log("getUsersFromDb() - BEZ GET");
        }
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUsersFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUsers = false;
        console.log("END - getUsersFromDb()");
      }
    },
    //
    //GET  USER FROM DB BY ID
    //
    async getUserFromDb(userId: number): Promise<User | undefined> {
      console.log("START - getUserFromDb(" + userId + ")");
      this.loadingUsers = true;

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.get(`/v1/user/` + userId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingUsers = false;
        console.log("END - getUsersFromDb()");
      }
    },
    //
    //ADD USER
    //
    async addUserDb(user: User) {
      console.log("START - addUserDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.post(`/v1/user`, user, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        this.users.push(response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUserFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - addUserDb()");
      }
    },
    //
    //UPDATE USER
    //
    async updateUserDb(user: User) {
      console.log("START - updateUserDb()");

      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        const response = await httpCommon.put(`/v1/user`, user, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) this.users.splice(index, 1, response.data);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updateUserDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updateUserDb()");
      }
    },
    //
    //DELETE USER
    //
    async deleteUserDb(userId: number) {
      console.log("START - deleteUserDb()");
      const authorization = useAuthorizationStore();
      const headers = {
        Authorization: "Bearer " + authorization.accessToken,
      };
      try {
        await httpCommon.delete(`/v1/user/` + userId, {
          headers: authorization.accessToken !== "null" ? headers : {},
        });
        const index = this.users.findIndex((b) => b.id === userId);
        if (index !== -1) this.users.splice(index, 1);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR deleteUserDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - deleteUserDb()");
      }
    },
  },
});
