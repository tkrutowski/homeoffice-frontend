import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import jwt_decode from 'jwt-decode'
import moment from 'moment'
import {useFeeStore} from './fee'
import {useLoansStore} from './loans'
import {usePaymentStore} from './payments'
import {usePurchasesStore} from './purchases'
import {useUserbooksStore} from './userbooks.ts'
import type {CustomJwtPayload} from "../types/User.ts";

export const useAuthorizationStore = defineStore('authorization', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        loginError: false,
        btnDisabled: false,
        isAuthenticated: false,
        loading: false,
        username: localStorage.getItem('username') || '',
        userPrivileges: [] as string[],
    }),

    //getters = computed
    getters: {
        hasAccessAdmin(): boolean {
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    return decoded.authorities.includes('ROLE_ADMIN')
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        isAuthenticatedOrToken(): boolean {
            try {
            if (this.accessToken) {
                const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                return this.isAuthenticated || moment.unix(decoded.exp).isAfter(moment())
            }
            return this.isAuthenticated
            } catch (error) {
                console.log('isAuthenticatedOrToken() ERROR', error)
                return false
            }
        },
        hasAccessGoAhead(): boolean {
            console.log('hasAccessGoAhead()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_GOAHEAD') || decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessGoAhead() ERROR', error)
                return false
            }
        },
        hasAccessFinance(): boolean {
            console.log('hasAccessFinance()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_FINANCE') || decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessFinancePurchase(): boolean {
            console.log('hasAccessFinancePurchase()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_FINANCE_PURCHASE') ||
                        decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessFinancePurchaseWriteAll(): boolean {
            console.log('hasAccessFinancePurchase()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('FINANCE_PURCHASE_WRITE_ALL') ||
                        decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessFinancePayment(): boolean {
            console.log('hasAccessFinancePayment()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_FINANCE_PAYMENT') ||
                        decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessFinanceLoan(): boolean {
            console.log('hasAccessFinanceLoan()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_FINANCE_LOAN') ||
                        decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessFinanceFee(): boolean {
            console.log('hasAccessFinanceFee()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_FINANCE_FEE') ||
                        decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessFinance() ERROR', error)
                return false
            }
        },
        hasAccessLibrary(): boolean {
            console.log('hasAccessFinance()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_LIBRARY') || decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessLibrary() ERROR', error)
                return false
            }
        },
        hasAccessDevice(): boolean {
            console.log('hasAccessDevices()')
            try {
                if (this.accessToken) {
                    // console.log("token : ", this.token);
                    const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
                    // console.log("token decoded: ", decoded);
                    return (
                        decoded.authorities.includes('ROLE_DEVICE') || decoded.authorities.includes('ROLE_ADMIN')
                    )
                } else {
                    return false
                }
            } catch (error) {
                console.log('hasAccessLibrary() ERROR', error)
                return false
            }
        },
    },

    //actions = metody w komponentach
    actions: {
        logUser(token: string, refreshToken: string) {
            console.log("logUser: accessToken",token)
            this.accessToken = token
            localStorage.setItem('accessToken', token)
            this.isAuthenticated = true
            const decoded = jwt_decode<CustomJwtPayload>(this.accessToken)
            if (decoded.sub) {
                this.username = decoded.sub
                localStorage.setItem('username', decoded.sub)
            }
            this.refreshToken = refreshToken
            localStorage.setItem('refreshToken', refreshToken)
        },
        //
        //LOGIN
        //
        async login(username: string, password: string) {
            console.log('START - login()')
            this.loading = true
            this.btnDisabled = true
            const res = await httpCommon.post('/v1/auth/login', {
                username: username,
                password: password,
            })

            this.logUser(res.data.accessToken, res.data.refreshToken)

            this.loading = false
            this.btnDisabled = false
            this.loginError = false
            console.log('END - login()')
            return true
        },
        //
        //LOGOUT
        //
        logout(): void {
            console.log('START - logout()')
            const feeStore = useFeeStore()
            const loanStore = useLoansStore()
            const paymentStore = usePaymentStore()
            const purchaseStore = usePurchasesStore()
            const userbookStore = useUserbooksStore()
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('username')
            this.$reset() //store reset
            feeStore.fees = []
            loanStore.loans = []
            paymentStore.payments.clear()
            purchaseStore.purchases.clear()
            userbookStore.userbooks = []
            this.router.replace({name: 'login'})
        },
        //
        //REFRESH
        //
        async refresh() {
            console.log('START - refresh()')
            const refreshToken = localStorage.getItem('refreshToken') || null
            const response = await httpCommon.post('/v1/auth/refresh', {
                refreshToken: refreshToken,
            })
            if (response.status === 200) {
                console.log('refresh() - success - update tokens...', response)
                this.logUser(response.data.accessToken, response.data.refreshToken)
            }
            console.log('END - refresh()')
            return response
        },

        //
        // TEST PING
        //
        async testPing() {
            console.log('START - testPing()')
            return await httpCommon.get('/v1/auth/test')
        },
    },
})
