import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/MainHomeView.vue";
import LoginView from "@/views/LoginView.vue";
import Error503View from "@/views/Error503View.vue";
//FINANCE
import FinanceHomeView from "@/views/finance/FinanceHomeView.vue";
import LoanView from "@/views/finance/LoanView.vue";
import LoansView from "@/views/finance/LoansView.vue";
import FeesView from "@/views/finance/FeesView.vue";
import FeeView from "@/views/finance/FeeView.vue";
import PaymentsView from "@/views/finance/PaymentsView.vue";
import PaymentFeeView from "@/views/finance/PaymentFeeView.vue";
import PaymentLoanView from "@/views/finance/PaymentLoanView.vue";
import PurchasesCurrentView from "@/views/finance/PurchasesCurrentView.vue";
import PurchaseView from "@/views/finance/PurchaseView.vue";

//LIBRARY
import LibraryHomeView from "@/views/library/LibraryHomeView.vue";
import BooksView from "@/views/library/BooksView.vue";
import BookView from "@/views/library/BookView.vue";
import UserbooksReadNowView from "@/views/library/UserbooksReadNowView.vue";
import UserbooksToReadView from "@/views/library/UserbooksToReadView.vue";
import UserbooksReadView from "@/views/library/UserbooksReadView.vue";
import SeriesSearchView from "@/views/library/SeriesSearchView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/error",
    name: "Error503",
    component: Error503View,
  },
  //----------------------------------------------LIBRARY--------------------------------------------
  {
    path: "/homelib",
    name: "LibraryHome",
    component: LibraryHomeView,
  },
  {
    path: "/library/book/all",
    name: "Books",
    component: BooksView,
  },
  {
    path: "/library/book/:isEdit/:bookId",
    name: "Book",
    component: BookView,
    props: true,
  },
  {
    path: "/library/book/shell/read_now",
    name: "UserBooksReadNow",
    component: UserbooksReadNowView,
  },
  {
    path: "/library/book/shell/to_read",
    name: "UserBooksToRead",
    component: UserbooksToReadView,
  },
  {
    path: "/library/book/shell/read",
    name: "UserBooksRead",
    component: UserbooksReadView,
  },
  {
    path: "/library/book/series",
    name: "SeriesSearch",
    component: SeriesSearchView,
  },
  //----------------------------------------------FINANCE--------------------------------------------
  {
    path: "/home",
    name: "FinanceHome",
    component: FinanceHomeView,
  },
  //LOAN
  {
    path: "/finance/loan/all",
    name: "Loans",
    component: LoansView,
  },
  {
    path: "/finance/loan/:isEdit/:loanId",
    name: "Loan",
    component: LoanView,
    props: true,
  },
  //FEE
  {
    path: "/finance/fee/all",
    name: "Fees",
    component: FeesView,
  },
  {
    path: "/finances/fee/:isEdit/:feeId",
    name: "Fee",
    component: FeeView,
    props: true,
  },
  //PAYMENT
  {
    path: "/finance/payment",
    name: "Payments",
    component: PaymentsView,
    props: true,
  },
  {
    path: "/finance/payment/fee/:id",
    name: "PaymentFee",
    component: PaymentFeeView,
    props: true,
  },
  {
    path: "/finance/payment/loan/:id",
    name: "PaymentLoan",
    component: PaymentLoanView,
    props: true,
  },
  //PURCHASE
  {
    path: "/finance/purchase/current",
    name: "PurchasesCurrent",
    component: PurchasesCurrentView,
    props: true,
  },
  {
    path: "/finances/purchase/:isEdit/:purchaseId",
    name: "Purchase",
    component: PurchaseView,
    props: true,
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
