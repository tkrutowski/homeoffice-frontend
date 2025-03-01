import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/MainHomeView.vue'
import LoginView from '../views/LoginView.vue'
import Error503View from '../views/Error503View.vue'
import RefreshComponent from '../components/RefreshComponent.vue'
import { useAuthorizationStore } from '../stores/authorization'

//FINANCE
import FinanceHomeView from '../views/finance/FinanceHomeView.vue'
import LoanView from '../views/finance/LoanView.vue'
import LoansView from '../views/finance/LoansView.vue'
import FeesView from '../views/finance/FeesView.vue'
import FeeView from '../views/finance/FeeView.vue'
import PaymentsView from '../views/finance/PaymentsView.vue'
import PaymentFeeView from '../views/finance/PaymentFeeView.vue'
import PaymentLoanView from '../views/finance/PaymentLoanView.vue'
import PurchasesCurrentView from '../views/finance/PurchasesCurrentView.vue'
import PurchaseView from '../views/finance/PurchaseView.vue'
import CardsView from '../views/finance/CardsView.vue'
import CardView from '../views/finance/CardView.vue'

//LIBRARY
import LibraryHomeView from '../views/library/LibraryHomeView.vue'
import BooksView from '../views/library/BooksView.vue'
import BookView from '../views/library/BookView.vue'
import UserbooksReadNowView from '../views/library/UserbooksReadNowView.vue'
import UserbooksToReadView from '../views/library/UserbooksToReadView.vue'
import UserbooksReadView from '../views/library/UserbooksReadView.vue'
import SeriesSearchView from '../views/library/SeriesSearchView.vue'

//ADMIN
import PrivilegesView from '../views/PrivilegesView.vue'
import LogsView from '../views/LogsView.vue'

//DEVICE
import DevicesHomeView from '../views/device/DeviceHomeView.vue'
import DevicesGridView from '../views/device/DevicesGridView.vue'
import DevicesListView from '../views/device/DevicesListView.vue'
import DeviceView from '../views/device/DeviceView.vue'
import ComputersView from "../views/device/ComputersView.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/error503',
    name: 'Error503',
    component: Error503View,
  },
  {
    path: '/error403',
    name: 'Error403',
    component: Error503View,
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: RefreshComponent,
    props: true,
  },
  //----------------------------------------------ADMIN--------------------------------------------
  {
    path: '/admin/privileges',
    name: 'Privileges',
    component: PrivilegesView,
  },
  {
    path: '/admin/logs',
    name: 'Logs',
    component: LogsView,
  },
  //----------------------------------------------LIBRARY--------------------------------------------
  {
    path: '/homelib',
    name: 'LibraryHome',
    component: LibraryHomeView,
  },
  {
    path: '/library/book/all',
    name: 'Books',
    component: BooksView,
  },
  {
    path: '/library/book/:isEdit/:bookId',
    name: 'Book',
    component: BookView,
    props: true,
  },
  {
    path: '/library/book/shell/read_now',
    name: 'UserBooksReadNow',
    component: UserbooksReadNowView,
  },
  {
    path: '/library/book/shell/to_read',
    name: 'UserBooksToRead',
    component: UserbooksToReadView,
  },
  {
    path: '/library/book/shell/read',
    name: 'UserBooksRead',
    component: UserbooksReadView,
  },
  {
    path: '/library/book/series',
    name: 'SeriesSearch',
    component: SeriesSearchView,
  },
  //----------------------------------------------FINANCE--------------------------------------------
  {
    path: '/home',
    name: 'FinanceHome',
    component: FinanceHomeView,
  },
  // LOAN
  {
    path: '/finance/loan/all',
    name: 'Loans',
    component: LoansView,
  },
  {
    path: '/finance/loan/:isEdit/:loanId',
    name: 'Loan',
    component: LoanView,
    props: true,
  },
  // FEE
  {
    path: '/finance/fee/all',
    name: 'Fees',
    component: FeesView,
  },
  {
    path: '/finances/fee/:isEdit/:feeId',
    name: 'Fee',
    component: FeeView,
    props: true,
  },
  //--------------------------------------------------------PAYMENT
  {
    path: '/finance/payment',
    name: 'Payments',
    component: PaymentsView,
    props: true,
  },
  {
    path: '/finance/payment/fee/:id',
    name: 'PaymentFee',
    component: PaymentFeeView,
    props: true,
  },
  {
    path: '/finance/payment/loan/:id',
    name: 'PaymentLoan',
    component: PaymentLoanView,
    props: true,
  },
  //---------------------------------------------------------------PURCHASE
  {
    path: '/finance/purchase/current',
    name: 'PurchasesCurrent',
    component: PurchasesCurrentView,
    props: true,
  },
  {
    path: '/finances/purchase/:isEdit/:purchaseId',
    name: 'Purchase',
    component: PurchaseView,
    props: true,
  },
  //-------------------------------------------------CARDS
  {
    path: '/finance/cards',
    name: 'Cards',
    component: CardsView,
    props: true,
  },
  {
    path: '/finance/card/:isEdit/:cardId',
    name: 'Card',
    component: CardView,
    props: true,
  },
  //----------------------------------------------DEVICE--------------------------------------------
  {
    path: '/homedevice',
    name: 'DevicesHome',
    component: DevicesHomeView,
  },
  {
    path: '/devices/device/grid',
    name: 'DevicesGrid',
    component: DevicesGridView,
  },
  {
    path: '/devices/device/list',
    name: 'DevicesList',
    component: DevicesListView,
  },
  {
    path: '/devices/device/:isEdit/:deviceId',
    name: 'Device',
    component: DeviceView,
    props: true,
  },
  {
    path: '/devices/computer/all',
    name: 'Computers',
    component: ComputersView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to, from, next) => {
  const authStore = useAuthorizationStore()
  console.log('ROUTE to: ', to, ', from: ', from)
  if (to.path) {
    const history = JSON.parse(localStorage.getItem('navigationHistory') || '[]')
    history.push(to.path)
    localStorage.setItem('navigationHistory', JSON.stringify(history))
  }
  const refreshToken = localStorage.getItem('refreshToken') || null
  if (
    to.name !== 'login' &&
    to.name !== 'Error503' &&
    !authStore.isAuthenticated &&
    refreshToken === null
  ) {
    next({ name: 'login' })
  } else {
    next()
  }
})
export default router
