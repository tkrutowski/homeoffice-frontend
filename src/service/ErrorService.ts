import {AxiosError} from 'axios'
//import router from '../router'
// import { useToast } from "primevue/usetoast";
// const toast = useToast();

export const ErrorService = {
    validateError(e: AxiosError) {
        console.log(
            'validating error: ' + e.code + ', status: ' + e.response?.status + ', message: ' + e.message,
        )

        // toast.add({
        //   severity: "error",
        //   summary: "Error Message",
        //   detail: e.message,
        //   life: 3000,
        // });

        // if (e.code == 'ERR_NETWORK' || e.code == 'ERR_CONNECTION_REFUSED') {
        //     console.log('NETWORK ERROR')
        //     router.push({
        //         name: 'Error503',
        //     })
        // }
        //
        // if (e.response?.status === 401) {
        //     console.log('!!!401')
        //     // authStore.testPing().then(res => {
        //     //   if (res.status === 200) {
        //     router.push({
        //         name: 'login',
        //     })
        //     // }else {
        //     //   router.push({
        //     //     name: "Error503",
        //     //   });
        //     // }
        //     // })
        // } else if (e.response?.status === 204) {
        //     router.push({
        //         name: 'Error503',
        //     })
        // } else {
        //     // Jeśli nie wpadło w żaden warunek, rzuć wyjątek ponownie
        //     throw e
        // }
    },

    isAxiosError(error: unknown): error is AxiosError {
        return (error as AxiosError).isAxiosError
    },
}
