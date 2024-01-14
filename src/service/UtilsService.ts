export const UtilsService = {
  formatCurrency(value: number | undefined) {
    // console.log("FORMAT_CURRENCY: ", value);
    if (value && !Number.isNaN(value))
      return value.toLocaleString("pl-PL", {
        style: "currency",
        currency: "PLN",
      });
  },
};
