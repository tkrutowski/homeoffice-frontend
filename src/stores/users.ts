import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import {useAuthorizationStore} from './authorization.ts'
import type {User, Role, Privilege} from '@/types/User'

export const useUsersStore = defineStore('user', {
    state: () => ({
        loginError: false,
        btnDisabled: false,
        busyIcon: false,
        loadingUsers: false,
        loadingPrivileges: false,
        loadingRoles: false,

        users: [] as User[],
        roles: [] as Role[],
    }),

    //getters = computed
    getters: {
        getUsers: (state) => {
            console.log('getUsers from pinia', state)
            return state.users
        },
        getUserByPrivileges: (state) => {
            const authorization = useAuthorizationStore()
            if (authorization.hasAccessFinancePurchaseWriteAll) {
                return state.users
            }
            const user = state.users.find((user: User) => user.username === authorization.username)
            console.log('getUserByPrivileges', user)
            if (user) return [user]
            else return []
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //GET USER FULL NAME
        //
        getUserFullName(idUser: number): string {
            const user = this.users.find((user) => user.id === idUser)
            if (user) return user.firstName + ' ' + user.lastName
            else return 'Brak danych'
        },
        //
        //Get user by id
        //
        getUser(idUser: number): User | null {
            const user = this.users.find((user: User) => user.id === idUser)
            if (user) return user
            else return null
        },
        getNotUserRoles(userRoles: Role[]) {
            console.log('userRoles', userRoles)
            return this.getRolesAllFromDb().then((roles: Role[]) => {
                console.log('Role1', roles)
                console.log(
                    'Role2',
                    roles.filter((role) => !userRoles.some((userRole) => userRole.id === role.id)),
                )
                return roles.filter((role) => !userRoles.some((userRole) => userRole.id === role.id))
            })
        },
        async refreshUsers() {
            await this.getUsersFromDb()
        },
        //--------------------------------------DATABASE--------------------------------------
        //
        //GET USERS
        //
        async getUsersFromDb(): Promise<void> {
            console.log('START - getUsersFromDb()')
            this.loadingUsers = true

            const response = await httpCommon.get(`/v1/user`)
            console.log('getUsersFromDb() - Ilosc[]: ' + response.data.length)
            this.users = response.data
            this.loadingUsers = false
            console.log('END - getUsersFromDb()')
        },
        //
        //GET  USER FROM DB BY ID
        //
        async getUserFromDb(userId: number): Promise<User | null> {
            console.log('START - getUserFromDb(' + userId + ')')
            this.loadingUsers = true

            const response = await httpCommon.get(`/v1/user/` + userId)
            this.loadingUsers = false
            console.log('END - getUsersFromDb()')
            return response.data ? response.data : null
        },
        //
        //ADD USER
        //
        async addUserDb(user: User) {
            console.log('START - addUserDb()')
            const response = await httpCommon.post(`/v1/user`, user)
            this.users.push(response.data)
            console.log('END - addUserDb()')
        },
        //
        //UPDATE USER
        //
        async updateUserDb(user: User) {
            console.log('START - updateUserDb()')

            const response = await httpCommon.put(`/v1/user`, user)
            const index = this.users.findIndex((user: User) => user.id === user.id)
            if (index !== -1) this.users.splice(index, 1, response.data)
            console.log('END - updateUserDb()')
        },
        //
        //DELETE USER
        //
        async deleteUserDb(userId: number) {
            console.log('START - deleteUserDb()')
            await httpCommon.delete(`/v1/user/` + userId)
            const index = this.users.findIndex((user: User) => user.id === userId)
            if (index !== -1) this.users.splice(index, 1)
            console.log('END - deleteUserDb()')
        },

        //
        // GET Privileges by user
        //
        async getPrivilegesByUserFromDb(idUser: number): Promise<Privilege[]> {
            console.log('START - getUsersFromDb()')
            this.loadingPrivileges = true

            const response = await httpCommon.get(`/v1/user/role/` + idUser)
            console.log('getPrivilegesByUserFromDb() - Ilosc[]: ' + response.data.length)
            this.loadingPrivileges = false
            console.log('END - getPrivilegesByUserFromDb()')
            return response.data ? response.data : []
        },
        //
        //UPDATE Privilege
        //
        async updatePrivilegeDb(privilege: Privilege) {
            console.log('START - updatePrivilegeDb()')
            await httpCommon.put(`/v1/user/role`, privilege)
            console.log('END - updatePrivilegeDb()')
        },
        //
        // ADD Privileges to user
        //
        async addPrivilegesToUserFromDb(idUser: number, idRole: number) {
            console.log('START - addPrivilegesToUSerFromDb()')

            await httpCommon.post(`/v1/user/role?userID=${idUser}&roleID=${idRole}`)
            console.log('END - addPrivilegesToUSerFromDb()')
        },
        //
        // DELETE Privileges from user
        //
        async deletePrivilegesFromUserFromDb(idUser: number, idRole: number) {
            console.log('START - addPrivilegesToUSerFromDb()')

            await httpCommon.delete(`/v1/user/role?userID=${idUser}&roleID=${idRole}`)
            console.log('END - addPrivilegesToUSerFromDb()')
        },
        //
        // GET ALL roles
        //
        async getRolesAllFromDb(): Promise<Role[]> {
            console.log('START - getUsersFromDb()')
            this.loadingRoles = true

            const response = await httpCommon.get(`/v1/user/role`)
            console.log('getPrivilegesByUserFromDb() - Ilosc[]: ' + response.data.length)
            this.loadingRoles = false
            console.log('END - getPrivilegesByUserFromDb()')
            return response.data ? response.data : []
        },
    },
})
