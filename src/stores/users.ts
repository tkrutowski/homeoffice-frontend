import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { useAuthorizationStore } from "@/stores/authorization";
import { ErrorService } from "@/service/ErrorService";
import User, {Role} from "@/types/User";

export const useUsersStore = defineStore("user", {
  state: () => ({
    loginError: false,
    btnDisabled: false,
    busyIcon: false,
    loadingUsers: false,
    loadingPrivileges: false,
    loadingRoles: false,

    users: [] as User[],
    roles: [] as Role[]
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
    getNotUserRoles(userRoles: Role[]) {
      console.log('userRoles', userRoles);
      return this.getRolesAllFromDb()
          .then((roles: Role[]) => {
            console.log('Role1', roles);
            console.log('Role2', roles.filter(role =>
                !userRoles.some(userRole => userRole.id === role.id)));
            return roles.filter(role =>
                !userRoles.some(userRole => userRole.id === role.id)
            );
          });
    },
    //--------------------------------------DATABASE--------------------------------------
    //
    //GET USERS
    //
    async getUsersFromDb(): Promise<User[]> {
      console.log("START - getUsersFromDb()");
      this.loadingUsers = true;

      try {
        const response = await httpCommon.get(`/v1/user`);
        console.log("getUsersFromDb() - Ilosc[]: " + response.data.length);
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getUsersFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return []
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



    //
    // GET Privileges by user
    //
    async getPrivilegesByUserFromDb(idUser: number): Promise<Privilege[]> {
      console.log("START - getUsersFromDb()");
      this.loadingPrivileges = true;

      try {
        const response = await httpCommon.get(`/v1/user/role/`+ idUser);
        console.log("getPrivilegesByUserFromDb() - Ilosc[]: " + response.data.length);
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getPrivilegesByUserFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return []
      } finally {
        this.loadingPrivileges = false;
        console.log("END - getPrivilegesByUserFromDb()");
      }
    },
    //
    //UPDATE Privilege
    //
    async updatePrivilegeDb(privilege: Privilege) {
      console.log("START - updatePrivilegeDb()");
      try {
        await httpCommon.put(`/v1/user/role`, privilege);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR updatePrivilegeDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false;
      } finally {
        console.log("END - updatePrivilegeDb()");
      }
    },
    //
    // ADD Privileges to user
    //
    async addPrivilegesToUserFromDb(idUser: number, idRole: number) {
      console.log("START - addPrivilegesToUSerFromDb()");

      try {
        await httpCommon.post(`/v1/user/role?userID=${idUser}&roleID=${idRole}`);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addPrivilegesToUSerFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false
      } finally {
        console.log("END - addPrivilegesToUSerFromDb()");
      }
    },
    //
    // DELETE Privileges from user
    //
    async deletePrivilegesFromUserFromDb(idUser: number, idRole: number) {
      console.log("START - addPrivilegesToUSerFromDb()");

      try {
        await httpCommon.delete(`/v1/user/role?userID=${idUser}&roleID=${idRole}`);
        return true;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR addPrivilegesToUSerFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return false
      } finally {
        console.log("END - addPrivilegesToUSerFromDb()");
      }
    },
    //
    // GET ALL roles
    //
    async getRolesAllFromDb(): Promise<Role[]> {
      console.log("START - getUsersFromDb()");
      this.loadingRoles = true;

      try {
        const response = await httpCommon.get(`/v1/user/role`);
        console.log("getPrivilegesByUserFromDb() - Ilosc[]: " + response.data.length);
        return response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getPrivilegesByUserFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
        return []
      } finally {
        this.loadingRoles = false;
        console.log("END - getPrivilegesByUserFromDb()");
      }
    },
  },
});
