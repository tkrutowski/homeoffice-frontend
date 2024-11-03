import { useBookstoreStore } from "@/stores/bookstores";
import { useUserbooksStore } from "@/stores/userbooks";
import { useCardsStore } from "@/stores/cards";
import { useFirmsStore } from "@/stores/firms";
import { Author, Category } from "@/types/Book";
import moment from "moment";

export const UtilsService = {
  formatCurrency(value: number | undefined) {
    // console.log("FORMAT_CURRENCY: ", value);
    if (value && !Number.isNaN(value))
      return value.toLocaleString("pl-PL", {
        style: "currency",
        currency: "PLN",
      });
  },

  formatDateToString(value: Date | string | undefined):string {
    if(value){
       const date=  moment(value).format("YYYY-MM-DD");
       return (date === "0001-01-01") ? "": date;
    }
  },

  formatDate(value: Date | string | undefined):Date | undefined {
    if(value){
      const date=  moment(value).format("YYYY-MM-DD");
      return (date === "0001-01-01") ? null : new Date(date);
    }
  },

  //zaznacza tekst po kliknięciu
  selectText(event) {
    event.target.select();
  },

  getTypesForLibrary() {
    const bookstoreStore = useBookstoreStore();
    const userbookStore = useUserbooksStore();
    if (bookstoreStore.bookstores.length === 0)
      bookstoreStore.getBookstoresFromDb();
    if (userbookStore.ownershipStatus.length === 0)
      userbookStore.getOwnershipFromDb();
    if (userbookStore.editionTypes.length === 0)
      userbookStore.getEditionTypeFromDb();
    if (userbookStore.readingStatuses.length === 0)
      userbookStore.getReadingStatusFromDb();
  },

  getTypesForFinance() {
    const cardStore = useCardsStore();
    if (cardStore.cards.length === 0) {
      cardStore.getCardsFromDb("ALL");
    }

    const firmStore = useFirmsStore();
    if (firmStore.firms.length === 0) {
      firmStore.getFirmsFromDb();
    }
  },
  displayAuthors(authors: Author[]) {
    return authors
      .map((author) => author.lastName + " " + author.firstName)
      .join(", ");
  },

  displayCategory(categories: Category[]) {
    return categories.map((category) => category.name).join(", ");
  },

  findPatternInString(inputString, pattern, split) {
  // Dzielimy string na elementy według separatora ";;"
  const elements = inputString.split(split);

  // Filtrujemy elementy, które zawierają wzorzec (pattern)
  const matchedElements = elements.filter(element => element.includes(pattern));

  return matchedElements;
}
};
