import { AxiosError } from "axios";
import router from "@/router";
// import { useToast } from "primevue/usetoast";
// const toast = useToast();

export const ErrorService = {
  validateError(e: AxiosError) {
    console.log(
      "validating error: " +
        e.code +
        ", status: " +
        e.response?.status +
        ", message: " +
        e.message
    );

    // toast.add({
    //   severity: "error",
    //   summary: "Error Message",
    //   detail: e.message,
    //   life: 3000,
    // });

    if (e.response?.status === 401) {
      console.log("!!!401");
      router.push({
        name: "login",
      });
    } else if (e.response?.status === 503) {
      router.push({
        name: "Error503",
      });
    }
  },

  isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError;
  },
};
