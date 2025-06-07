<script setup lang="ts">
import TheMenuFinance from '@/components/finance/TheMenuFinance.vue'
import {UtilsService} from '@/service/UtilsService'
import {ref, onMounted, computed} from 'vue'
import {useLoansStore} from '@/stores/loans'
import {useFeeStore} from '@/stores/fee'
import {useUsersStore} from '@/stores/users'
import {useAuthorizationStore} from '@/stores/authorization'
import {PaymentStatus} from '@/types/Payment'
import {usePurchasesStore} from '@/stores/purchases'
import {useCardsStore} from '@/stores/cards'
import type {Purchase} from '@/types/Purchase'

const loansStore = useLoansStore()
const feeStore = useFeeStore()
const usersStore = useUsersStore()
const authorizationStore = useAuthorizationStore()
const purchasesStore = usePurchasesStore()
const cardsStore = useCardsStore()

// Get current year and month
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const showOnlyLoggedUser = ref<boolean>(true)


// Check if user has access to all payments
const hasAccessToAllPayments = computed(() => {
  return authorizationStore.hasAccessFinancePaymentReadAll
})

// Get users to display
const usersToDisplay = computed(() => {
  if (showOnlyLoggedUser.value) {
    const user = usersStore.users.find(user => user.username === authorizationStore.username)
    return user ? [user] : []
  }
  if (hasAccessToAllPayments.value) {
    return usersStore.users
  }
  const user = usersStore.users.find(user => user.username === authorizationStore.username)
  return user ? [user] : []
})

// Generate years array (from 2020 to current year + 5)
const availableYears = computed(() => {
  const years = []
  for (let year = 2020; year <= currentYear + 5; year++) {
    years.push(year)
  }
  return years
})

const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string
  borderColor: string
  borderWidth: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// Function to create chart data for a specific user
const createChartData = (userId: number) => {
  const loansMonthlyToPay: number[] = new Array(12).fill(0)
  const loansMonthlyPaid: number[] = new Array(12).fill(0)
  const feesMonthlyToPay: number[] = new Array(12).fill(0)
  const feesMonthlyPaid: number[] = new Array(12).fill(0)

  // Process loans
  loansStore.loans.forEach(loan => {
    if (loan.idUser === userId) {
      loan.installmentList.forEach(installment => {
        if (installment.paymentDeadline) {
          const paymentDate = new Date(installment.paymentDeadline)
          if (paymentDate.getFullYear() === selectedYear.value) {
            const month = paymentDate.getMonth()
            if (installment.paymentStatus === PaymentStatus.TO_PAY) {
              loansMonthlyToPay[month] += installment.installmentAmountToPay
            } else if (installment.paymentStatus === PaymentStatus.PAID) {
              loansMonthlyPaid[month] += installment.installmentAmountPaid
            }
          }
        }
      })
    }
  })

  // Process fees
  feeStore.fees.forEach(fee => {
    if (fee.idUser === userId) {
      fee.installmentList.forEach(installment => {
        if (installment.paymentDeadline) {
          const paymentDate = new Date(installment.paymentDeadline)
          if (paymentDate.getFullYear() === selectedYear.value) {
            const month = paymentDate.getMonth()
            if (installment.paymentStatus === PaymentStatus.TO_PAY) {
              feesMonthlyToPay[month] += installment.installmentAmountToPay
            } else if (installment.paymentStatus === PaymentStatus.PAID) {
              feesMonthlyPaid[month] += installment.installmentAmountPaid
            }
          }
        }
      })
    }
  })

  return {
    loans: {
      labels: months,
      datasets: [
        {
          label: 'Kredyty do zapłaty',
          data: loansMonthlyToPay,
          backgroundColor: 'rgba(220, 53, 69, 0.5)',
          borderColor: 'rgb(220, 53, 69)',
          borderWidth: 1,
          userId: userId
        },
        {
          label: 'Kredyty zapłacone',
          data: loansMonthlyPaid,
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: 'rgb(40, 167, 69)',
          borderWidth: 1,
          userId: userId
        }
      ]
    },
    fees: {
      labels: months,
      datasets: [
        {
          label: 'Opłaty do zapłaty',
          data: feesMonthlyToPay,
          backgroundColor: 'rgba(220, 53, 69, 0.5)',
          borderColor: 'rgb(220, 53, 69)',
          borderWidth: 1,
          userId: userId
        },
        {
          label: 'Opłaty zapłacone',
          data: feesMonthlyPaid,
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: 'rgb(40, 167, 69)',
          borderWidth: 1,
          userId: userId
        }
      ]
    }
  }
}

// Create chart data for each user
const usersChartData = ref<Map<number, { loans: ChartData, fees: ChartData }>>(new Map())

// Calculate monthly payments for all users
const calculateMonthlyPayments = () => {
  usersChartData.value.clear()
  usersToDisplay.value.forEach(user => {
    usersChartData.value.set(user.id, createChartData(user.id))
  })
}

const loansChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: function (context: any) {
          return context[0].label
        },
        label: function (context: any) {
          const datasetLabel = context.dataset.label
          const value = context.raw
          const month = context.label
          const year = selectedYear.value
          const userId = context.dataset.userId

          // Get loans for this month
          let payments: { name: string, amount: number }[] = []

          // Process loans
          loansStore.loans.forEach(loan => {
            if (loan.idUser === userId) {
              loan.installmentList.forEach(installment => {
                if (installment.paymentDeadline) {
                  const paymentDate = new Date(installment.paymentDeadline)
                  if (paymentDate.getFullYear() === year &&
                      paymentDate.getMonth() === months.indexOf(month)) {
                    if (context.datasetIndex === 0 && installment.paymentStatus === PaymentStatus.TO_PAY) {
                      payments.push({
                        name: loan.name,
                        amount: installment.installmentAmountToPay
                      })
                    } else if (context.datasetIndex === 1 && installment.paymentStatus === PaymentStatus.PAID) {
                      payments.push({
                        name: loan.name,
                        amount: installment.installmentAmountPaid
                      })
                    }
                  }
                }
              })
            }
          })

          // Format the tooltip content
          let tooltipContent = [`${datasetLabel}: ${UtilsService.formatCurrency(value)}`]
          if (payments.length > 0) {
            payments.forEach(payment => {
              tooltipContent.push(`${payment.name}: ${UtilsService.formatCurrency(payment.amount)}`)
            })
          }
          return tooltipContent
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number) {
          return UtilsService.formatCurrency(value)
        },
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  locale: 'pl-PL'
})

const feesChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: function (context: any) {
          return context[0].label
        },
        label: function (context: any) {
          const datasetLabel = context.dataset.label
          const value = context.raw
          const month = context.label
          const year = selectedYear.value
          const userId = context.dataset.userId

          // Get fees for this month
          let payments: { name: string, amount: number }[] = []

          // Process fees
          feeStore.fees.forEach(fee => {
            if (fee.idUser === userId) {
              fee.installmentList.forEach(installment => {
                if (installment.paymentDeadline) {
                  const paymentDate = new Date(installment.paymentDeadline)
                  if (paymentDate.getFullYear() === year &&
                      paymentDate.getMonth() === months.indexOf(month)) {
                    if (context.datasetIndex === 0 && installment.paymentStatus === PaymentStatus.TO_PAY) {
                      payments.push({
                        name: fee.name,
                        amount: installment.installmentAmountToPay
                      })
                    } else if (context.datasetIndex === 1 && installment.paymentStatus === PaymentStatus.PAID) {
                      payments.push({
                        name: fee.name,
                        amount: installment.installmentAmountPaid
                      })
                    }
                  }
                }
              })
            }
          })

          // Format the tooltip content
          let tooltipContent = [`${datasetLabel}: ${UtilsService.formatCurrency(value)}`]
          if (payments.length > 0) {
            payments.forEach(payment => {
              tooltipContent.push(`${payment.name}: ${UtilsService.formatCurrency(payment.amount)}`)
            })
          }
          return tooltipContent
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number) {
          return UtilsService.formatCurrency(value)
        },
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  locale: 'pl-PL'
})

const changeYear = (increment: number) => {
  const newYear = selectedYear.value + increment
  if (newYear >= 2020 && newYear <= currentYear + 5) {
    selectedYear.value = newYear
    calculateMonthlyPayments()
  }
}

// Create purchase chart data for each user
const usersPurchaseChartData = ref<Map<number, ChartData>>(new Map())
const userPurchases = ref<Map<number, Map<string, Purchase[]>>>(new Map())

// Calculate monthly purchases for all users
const calculateMonthlyPurchases = () => {
  usersPurchaseChartData.value.clear()
  usersToDisplay.value.forEach(user => {
    const userPurchaseData = userPurchases.value.get(user.id)
    if (userPurchaseData) {
      usersPurchaseChartData.value.set(user.id, createPurchaseChartData(user.id, userPurchaseData))
    }
  })
}

// Function to get card color
const getCardColor = (cardName: string) => {
  switch (cardName) {
    case 'ALFA 2':
      return {
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        borderColor: 'rgb(128, 128, 128)'
      }
    case 'Millenium Debet':
      return {
        backgroundColor: 'rgba(75, 80, 154, 0.5)',
        borderColor: 'rgb(26, 43, 60)'
      }
    case 'Impresja':
      return {
        backgroundColor: 'rgba(155, 0, 49, 0.5)',
        borderColor: 'rgb(155, 0, 49)'
      }
    default:
      return {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: 'rgb(0, 0, 0)'
      }
  }
}

// Function to create purchase chart data for a specific user
const createPurchaseChartData = (userId: number, userPurchaseData: Map<string, Purchase[]>) => {
  console.log('Creating purchase chart data for user:', userId)
  console.log('User purchases:', userPurchaseData)

  const monthlyPurchases: Map<number, Map<number, number>> = new Map() // month -> cardId -> amount

  // Initialize the map for all months
  for (let month = 0; month < 12; month++) {
    monthlyPurchases.set(month, new Map())
  }

  // Process purchases
  userPurchaseData.forEach((purchases, deadline) => {
    console.log('Processing purchases for deadline:', deadline)
    purchases.forEach((purchase) => {
      if (purchase.idUser === userId && purchase.paymentStatus === PaymentStatus.TO_PAY) {
        if (purchase.paymentDeadline) {
          const paymentDate = new Date(purchase.paymentDeadline)
          if (paymentDate.getFullYear() === selectedYear.value) {
            console.log('Processing purchase:', purchase)
            const month = paymentDate.getMonth()
            const cardId = purchase.idCard
            const currentAmount = Number(monthlyPurchases.get(month)?.get(cardId) || 0)
            console.log('Current amount:', currentAmount)
            monthlyPurchases.get(month)?.set(cardId, currentAmount + Number(purchase.amount))
            console.log('Monthly purchases:', monthlyPurchases.get(month))
            console.log(`Added purchase for month ${month}, card ${cardId}, amount ${purchase.amount}`)
          }
        }
      }
    })
  })

  // Get unique card IDs
  const cardIds = new Set<number>()
  monthlyPurchases.forEach((monthData) => {
    monthData.forEach((_, cardId) => cardIds.add(cardId))
  })

  console.log('Found card IDs:', Array.from(cardIds))

  // Create datasets for each card
  const datasets = Array.from(cardIds).map((cardId) => {
    const card = cardsStore.getCard(cardId)
    const data = Array.from({length: 12}, (_, month) => {
      return monthlyPurchases.get(month)?.get(cardId) || 0
    })
    console.log(`Card ${cardId} data:`, data)
    const cardName = card ? card.name : `Card ${cardId}`
    const colors = getCardColor(cardName)
    return {
      label: cardName,
      data: data,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1
    }
  })

  return {
    labels: months,
    datasets: datasets
  }
}

// Load purchases for all users
const loadUserPurchases = async () => {
  userPurchases.value.clear()
  for (const user of usersToDisplay.value) {
    console.log('Loading purchases for user:', user.username)
    const purchases = await purchasesStore.getPurchaseCurrentFromDb(user.username)
    console.log('Loaded purchases for user:', user.username, purchases)
    userPurchases.value.set(user.id, purchases)
  }
}

const purchaseChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: function (context: any) {
          return context[0].label
        },
        label: function (context: any) {
          const datasetLabel = context.dataset.label
          const value = context.raw
          return `${datasetLabel}: ${UtilsService.formatCurrency(value)}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number) {
          return UtilsService.formatCurrency(value)
        },
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  locale: 'pl-PL'
})

// Add summary chart data computation
const summaryChartData = computed(() => {
  console.log('Calculating summary chart data')
  console.log('Active cards:', cardsStore.getCardsActive)
  console.log('All cards:', cardsStore.cards)

  // Separate maps for loans (by bank) and purchases (by card)
  const bankLoanTotals = new Map<number, number>()
  const cardPurchaseTotals = new Map<number, number>()

  // Initialize purchase totals for active cards
  cardsStore.getCardsActive.forEach(card => {
    console.log('Initializing purchase totals for card:', card.name)
    cardPurchaseTotals.set(card.id, 0)
  })

  // Calculate loan totals by bank
  loansStore.loans.forEach(loan => {
    if (usersToDisplay.value.some(user => user.id === loan.idUser)) {
      const bank = loan.bank
      if (bank) {
        console.log('Processing loan for bank:', bank.name)
        loan.installmentList.forEach(installment => {
          if (installment.paymentStatus === PaymentStatus.TO_PAY) {
            const current = bankLoanTotals.get(bank.id) || 0
            bankLoanTotals.set(bank.id, current + installment.installmentAmountToPay)
          }
        })
      }
    }
  })

  // Calculate purchase totals by card
  userPurchases.value.forEach((purchasesMap, _) => {
    purchasesMap.forEach((purchases) => {
      purchases.forEach(purchase => {
        if (purchase.paymentStatus === PaymentStatus.TO_PAY) {
          const cardId = purchase.idCard
          const card = cardsStore.getCard(cardId)
          if (card && card.activeStatus === 'ACTIVE') {
            console.log('Processing purchase for card:', card.name, 'amount:', purchase.amount)
            const current = cardPurchaseTotals.get(cardId) || 0
            cardPurchaseTotals.set(cardId, current + Number(purchase.amount))
          } else {
            console.log('Skipping purchase for inactive card:', card?.name || `Card ${cardId}`)
          }
        }
      })
    })
  })

  console.log('Final bank loan totals:', Object.fromEntries(bankLoanTotals))
  console.log('Final card purchase totals:', Object.fromEntries(cardPurchaseTotals))

  // Create loan dataset by bank
  const loanDataset = {
    labels: Array.from(bankLoanTotals.keys()).map(bankId => {
      const bank = loansStore.loans.find(l => l.bank?.id === bankId)?.bank
      return bank ? bank.name : `Bank ${bankId}`
    }),
    datasets: [{
      label: 'Kredyty do spłaty',
      data: Array.from(bankLoanTotals.values()),
      backgroundColor: 'rgba(220, 53, 69, 0.5)',
      borderColor: 'rgb(220, 53, 69)',
      borderWidth: 1
    }]
  }

  // Create purchase dataset by card
  const purchaseDataset = {
    labels: Array.from(cardPurchaseTotals.keys()).map(cardId => {
      const card = cardsStore.getCard(cardId)
      return card ? card.name : `Karta ${cardId}`
    }),
    datasets: [{
      label: 'Zakupy do spłaty',
      data: Array.from(cardPurchaseTotals.values()),
      backgroundColor: 'rgba(255, 193, 7, 0.5)',
      borderColor: 'rgb(255, 193, 7)',
      borderWidth: 1
    }]
  }

  return {
    loans: loanDataset,
    purchases: purchaseDataset
  }
})

const summaryChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: function (context: any) {
          return context[0].label
        },
        label: function (context: any) {
          const datasetLabel = context.dataset.label
          const value = context.raw
          return `${datasetLabel}: ${UtilsService.formatCurrency(value)}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number) {
          return UtilsService.formatCurrency(value)
        },
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  locale: 'pl-PL'
})

const onYearChange = async () => {
  calculateMonthlyPayments()
  await loadUserPurchases()
  calculateMonthlyPurchases()
}

onMounted(async () => {
  console.log('Component mounted')
  await Promise.all([
    loansStore.getLoans('ALL'),
    feeStore.getFees('ALL'),
    usersStore.getUsersFromDb(),
    cardsStore.getCardsFromDb('ALL')
  ])
  console.log('Data loaded')
  console.log('Users:', usersStore.users)
  console.log('Cards:', cardsStore.cards)

  await loadUserPurchases()
  calculateMonthlyPayments()
  calculateMonthlyPurchases()
})
</script>

<template>
  <TheMenuFinance/>
  <div class="p-4">
    <!-- Year Selection and Filter -->
    <div class="flex justify-between items-center mb-4">
      <div class="w-1/4"></div> <!-- Empty div for spacing -->
      <div class="flex items-center gap-4">
        <Button
            icon="pi pi-chevron-left"
            @click="changeYear(-1)"
            :disabled="selectedYear <= 2020"
            class="p-button-rounded"
        />
        <Select
            v-model="selectedYear"
            :options="availableYears"
            @change="onYearChange"
            class="w-32"
            placeholder="Wybierz rok"
        />
        <Button
            icon="pi pi-chevron-right"
            @click="changeYear(1)"
            :disabled="selectedYear >= currentYear + 5"
            class="p-button-rounded"
        />
      </div>
      <div class="flex items-center gap-2 w-1/4 justify-end">
        <Checkbox v-model="showOnlyLoggedUser" :binary="true"/>
        <label class="ml-2 dark:text-primary">Wyświetl tylko moje</label>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Summary Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Loans Chart -->
        <div class="card border-2 border-primary rounded-lg">
          <h3 class="text-xl font-bold text-center mb-4 dark:text-primary">Kredyty do spłaty</h3>
          <Chart type="bar" :data="summaryChartData.loans" :options="summaryChartOptions" class="h-30rem px-3"/>
        </div>

        <!-- Purchases Chart -->
        <div class="card border-2 border-primary rounded-lg">
          <h3 class="text-xl font-bold text-center mb-4 dark:text-primary">Zakupy do spłaty</h3>
          <Chart type="bar" :data="summaryChartData.purchases" :options="summaryChartOptions" class="h-30rem px-3"/>
        </div>
      </div>

      <div v-for="user in usersToDisplay" :key="user.id" class="flex flex-col gap-4">
        <h2 class="text-2xl font-bold text-center dark:text-primary">{{ user.firstName }} {{ user.lastName }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Loans Chart -->
          <div class="card border-2 border-primary rounded-lg">
            <h3 class="text-xl font-bold text-center mb-4 dark:text-primary">Płatności kredytów w {{
                selectedYear
              }}</h3>
            <Chart :id="'loans-' + user.id" type="bar" :data="usersChartData.get(user.id)?.loans"
                   :options="loansChartOptions" class="h-30rem px-3"/>
          </div>

          <!-- Fees Chart -->
          <div class="card border-2 border-primary rounded-lg">
            <h3 class="text-xl font-bold text-center mb-4 dark:text-primary">Płatności opłat w {{ selectedYear }}</h3>
            <Chart :id="'fees-' + user.id" type="bar" :data="usersChartData.get(user.id)?.fees"
                   :options="feesChartOptions" class="h-30rem px-3"/>
          </div>

          <!-- Purchases Chart -->
          <div class="card border-2 border-primary rounded-lg md:col-span-2">
            <h3 class="text-xl font-bold text-center mb-4 dark:text-primary">Niespłacone zakupy w {{
                selectedYear
              }}</h3>
            <Chart :id="'purchases-' + user.id" type="line" :data="usersPurchaseChartData.get(user.id)"
                   :options="purchaseChartOptions" class="h-30rem px-3"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-30rem {
  height: 30rem;
}
</style>
