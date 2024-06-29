/* eslint-disable vue/multi-word-component-names */
import { createApp, markRaw } from "vue";
import App from "./App.vue";
import type { Router } from "vue-router";
import router from "./router";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
// import "primevue/resources/themes/lara-light-blue/theme.css";
// import "primevue/resources/themes/homeoffice/theme.css";
// import "primevue/resources/themes/rhea/theme.css";
import "@/assets/css/theme.css";

import ToastService from "primevue/toastservice";

import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import ContextMenu from "primevue/contextmenu";
import DataTable from "primevue/datatable";
import DataViewLayoutOptions from "primevue/dataviewlayoutoptions";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import InlineMessage from "primevue/inlinemessage";
import InputSwitch from "primevue/inputswitch";
import InputText from "primevue/inputtext";
import InputMask from "primevue/inputmask";
import InputNumber from "primevue/inputnumber";
import Image from "primevue/image";
import Listbox from "primevue/listbox";
import Menu from "primevue/menu";
import Menubar from "primevue/menubar";
import Message from "primevue/message";
import Paginator from "primevue/paginator";
import Panel from "primevue/panel";
import PanelMenu from "primevue/panelmenu";
import Password from "primevue/password";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import Rating from "primevue/rating";
import RadioButton from "primevue/radiobutton";
import Row from "primevue/row";
import SelectButton from "primevue/selectbutton";
import Slider from "primevue/slider";
import Sidebar from "primevue/sidebar";
import TabMenu from "primevue/tabmenu";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import Toolbar from "primevue/toolbar";
import Tooltip from "primevue/tooltip";
import AutoComplete from "primevue/autocomplete";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
declare module "pinia" {
  export interface PiniaCustomProperties {
    router: Router;
  }
}

const pinia = createPinia();

pinia.use(({ store }) => {
  store.router = markRaw(router);
});

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  locale: {
    accept: "Tak",
    addRule: "Dodaj regułę",
    am: "AM",
    apply: "Zastosuj",
    cancel: "Anuluj",
    choose: "Wybierz",
    chooseDate: "Wybierz datę",
    chooseMonth: "Wybierz miesiąc",
    chooseYear: "Wybierz rok",
    clear: "Wyczyść",
    completed: "Ukończone",
    contains: "Zawiera",
    custom: "Zwyczaj",
    dateAfter: "Po",
    dateBefore: "Przed",
    dateFormat: "dd.mm.yy",
    dateIs: "Równa",
    dateIsNot: "Nierówna",
    dayNames: [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ],
    dayNamesMin: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
    dayNamesShort: ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"],
    emptyFilterMessage: "Brak wyników wyszukiwania",
    emptyMessage: "Brak danych",
    emptySearchMessage: "Nie znaleziono wyników",
    emptySelectionMessage: "Brak wybranego elementu",
    endsWith: "Kończy się na",
    equals: "Równe",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    filter: "Filtr",
    firstDayOfWeek: 1,
    gt: "Większe od",
    gte: "Większe lub równe",
    lt: "Mniejsze od",
    lte: "Mniejsze lub równe",
    matchAll: "Dopasuj wszystko",
    matchAny: "Dopasuj dowolne",
    medium: "Średni",
    monthNames: [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
    monthNamesShort: [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ],
    nextDecade: "Następna dekada",
    nextHour: "Następna godzina",
    nextMinute: "Następna minuta",
    nextMonth: "Następny miesiąc",
    nextSecond: "Następna sekunda",
    nextYear: "Następny rok",
    noFilter: "Wyczyść filtr",
    notContains: "Nie zawiera",
    notEquals: "Nierówne",
    now: "Teraz",
    passwordPrompt: "Wprowadź hasło",
    pending: "Oczekuje",
    pm: "PM",
    prevDecade: "Poprzednia dekada",
    prevHour: "Poprzednia godzina",
    prevMinute: "Poprzednia minuta",
    prevMonth: "Poprzedni miesiąc",
    prevSecond: "Poprzednia sekunda",
    prevYear: "Poprzedni rok",
    quarterNames: ["I Kwartał", "II Kwartał", "III Kwartał", "IV Kwartał"],
    quarterNamesShort: ["I Kw", "II Kw", "III Kw", "IV Kw"],
    reject: "Nie",
    removeRule: "Usuń regułę",
    searchMessage: "Dostępnych jest {0} wyników",
    selectionMessage: "Wybrano {0} elementów",
    showMonthAfterYear: false,
    startsWith: "Zaczyna się od",
    strong: "Silny",
    today: "Dzisiaj",
    upload: "Wgraj",
    weak: "Słaby",
    weekHeader: "Tydzień",
    aria: {
      cancelEdit: "Anuluj edycję",
      close: "Zamknij",
      collapseLabel: "Zawalić się",
      collapseRow: "Zwinięty wiersz",
      editRow: "Edycja wiersza",
      expandLabel: "Zwiększać",
      expandRow: "Wiersz rozwinięty",
      falseLabel: "Fałsz",
      filterConstraint: "Ograniczenie filtra",
      filterOperator: "Operator filtra",
      firstPageLabel: "Pierwsza strona",
      gridView: "Widok siatki",
      hideFilterMenu: "Ukryj menu filtrów",
      jumpToPageDropdownLabel: "Przejdź do menu rozwijanego strony",
      jumpToPageInputLabel: "Przejdź do wprowadzania strony",
      lastPageLabel: "Ostatnia strona",
      listView: "Widok listy",
      moveAllToSource: "Przenieś wszystko do źródła",
      moveAllToTarget: "Przenieś wszystko do celu",
      moveBottom: "Przesuń w dół",
      moveDown: "Położyć",
      moveTop: "Przesuń do góry",
      moveToSource: "Przenieś do źródła",
      moveToTarget: "Przenieś do celu",
      moveUp: "Podnieść",
      navigation: "Nawigacja",
      next: "Następny",
      nextPageLabel: "Następna strona",
      nullLabel: "Nie zaznaczone",
      otpLabel: "Proszę wprowadzić znak hasła jednorazowego {0}",
      pageLabel: "Strona {page}",
      passwordHide: "Ukryj hasło",
      passwordShow: "Pokaż hasło",
      previous: "Poprzedni",
      previousPageLabel: "Poprzednia strona",
      rotateLeft: "Obróć w lewo",
      rotateRight: "Obróć w prawo",
      rowsPerPageLabel: "Wierszy na stronę",
      saveEdit: "Zapisz edycję",
      scrollTop: "Przewiń do góry",
      selectAll: "Wszystkie elementy zaznaczone",
      selectLabel: "Wybierać",
      selectRow: "Wiersz zaznaczony",
      showFilterMenu: "Pokaż menu filtrów",
      slide: "Slajd",
      slideNumber: "{slideNumber}",
      star: "1 gwiazdka",
      stars: "{star} gwiazdek",
      trueLabel: "Prawda",
      unselectAll: "Wszystkie elementy odznaczone",
      unselectLabel: "Odznacz",
      unselectRow: "Wiersz odznaczony",
      zoomImage: "Powiększ obraz",
      zoomIn: "Przybliż",
      zoomOut: "Oddal",
    },
  },
});
app.use(ToastService);

app.directive("tooltip", Tooltip);

app.component("AutoComplete", AutoComplete);
app.component("Button", Button);
app.component("Calendar", Calendar);
app.component("Card", Card);
app.component("Checkbox", Checkbox);
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
// app.component('ConfirmDialog', ConfirmDialog);
// app.component('ConfirmPopup', ConfirmPopup);
app.component("ContextMenu", ContextMenu);
app.component("DataTable", DataTable);
app.component("DataView", DataView);
app.component("DataViewLayoutOptions", DataViewLayoutOptions);
app.component("Dialog", Dialog);
app.component("Divider", Divider);
app.component("Dropdown", Dropdown);
app.component("FloatLabel", FloatLabel);
app.component("Image", Image);
app.component("IconField", IconField);
app.component("InputIcon", InputIcon);
app.component("InlineMessage", InlineMessage);
app.component("InputMask", InputMask);
app.component("InputNumber", InputNumber);
app.component("InputSwitch", InputSwitch);
app.component("InputText", InputText);
app.component("Listbox", Listbox);
app.component("Menu", Menu);
app.component("Menubar", Menubar);
app.component("Message", Message);
app.component("Paginator", Paginator);
app.component("Panel", Panel);
app.component("PanelMenu", PanelMenu);
app.component("Password", Password);
app.component("ProgressBar", ProgressBar);
app.component("ProgressSpinner", ProgressSpinner);
app.component("RadioButton", RadioButton);
app.component("Rating", Rating);
app.component("Row", Row);
app.component("SelectButton", SelectButton);
app.component("Slider", Slider);
app.component("Sidebar", Sidebar);
app.component("TabMenu", TabMenu);
app.component("Textarea", Textarea);
app.component("Toast", Toast);
app.component("Toolbar", Toolbar);
app.component("Image", Image);

app.mount("#app");
