import type { Meta, StoryObj } from '@storybook/vue3';
import GenericChartPanel from './GenericChartPanel.vue';
import type { GenericChartData } from './GenericChartPanel.vue';

const meta = {
  title: 'Components/GenericChartPanel',
  component: GenericChartPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Tytuł panelu',
    },
    icon: {
      control: { type: 'text' },
      description: 'Ikona PrimeIcons (np. pi pi-chart-line)',
    },
    chartType: {
      control: { type: 'radio' },
      options: ['line', 'bar', 'doughnut', 'pie'],
      description: 'Typ wykresu',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Stan ładowania',
    },
    showTotals: {
      control: { type: 'boolean' },
      description: 'Czy wyświetlać sumy obok etykiet',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Tekst pomocniczy',
    },
    emptyMessage: {
      control: { type: 'text' },
      description: 'Wiadomość przy braku danych',
    },
  },
} satisfies Meta<typeof GenericChartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== Mock Data =====

const mockLineChartData: GenericChartData = {
  labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec'],
  datasets: [
    {
      label: 'Kredyty do zapłaty',
      data: [4500, 4200, 3800, 3500, 3200, 2800],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Kredyty zapłacone',
      data: [2000, 2500, 3000, 3200, 3500, 4000],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
    },
  ],
  categoryTotals: [
    { label: 'Kredyty do zapłaty', total: 21800, color: 'rgb(239, 68, 68)' },
    { label: 'Kredyty zapłacone', total: 18200, color: 'rgb(34, 197, 94)' },
  ],
};

const mockBarChartData: GenericChartData = {
  labels: ['Bank A', 'Bank B', 'Bank C', 'Bank D'],
  datasets: [
    {
      label: 'Kredyty do spłaty',
      data: [5000, 3500, 2000, 1500],
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1,
    },
  ],
  categoryTotals: [{ label: 'Kredyty do spłaty', total: 12000, color: 'rgb(239, 68, 68)' }],
};

const mockPieChartData: GenericChartData = {
  labels: ['Elektronika', 'Meble', 'Książki', 'Ubrania', 'Sport'],
  datasets: [
    {
      label: 'Wydatki',
      data: [5000, 3000, 1500, 2000, 800],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ] as any,
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(168, 85, 247)',
      ] as any,
    },
  ],
  categoryTotals: [
    { label: 'Elektronika', total: 5000, color: 'rgb(239, 68, 68)' },
    { label: 'Meble', total: 3000, color: 'rgb(59, 130, 246)' },
    { label: 'Książki', total: 1500, color: 'rgb(34, 197, 94)' },
    { label: 'Ubrania', total: 2000, color: 'rgb(251, 191, 36)' },
    { label: 'Sport', total: 800, color: 'rgb(168, 85, 247)' },
  ],
};

const emptyChartData: GenericChartData = {
  labels: [],
  datasets: [],
  categoryTotals: [],
};

// ===== Stories =====

/**
 * Wykres liniowy z dwoma seriami danych
 */
export const LineChart: Story = {
  args: {
    title: 'Płatności kredytów w 2026',
    icon: 'pi pi-chart-line',
    chartType: 'line',
    loading: false,
    showTotals: true,
    helpText: 'Kliknij linię, aby ją pokazać lub ukryć',
    chartData: mockLineChartData,
  },
};

/**
 * Wykres słupkowy - podsumowanie po bankach
 */
export const BarChart: Story = {
  args: {
    title: 'Kredyty do spłaty (po bankach)',
    icon: 'pi pi-chart-bar',
    chartType: 'bar',
    loading: false,
    showTotals: true,
    chartData: mockBarChartData,
  },
};

/**
 * Wykres kołowy - rozkład wydatków
 */
export const PieChart: Story = {
  args: {
    title: 'Rozkład wydatków',
    icon: 'pi pi-chart-pie',
    chartType: 'pie',
    loading: false,
    showTotals: true,
    chartData: mockPieChartData,
  },
};

/**
 * Doughnut chart (pierścieniowy)
 */
export const DoughnutChart: Story = {
  args: {
    title: 'Kategorie wydatków',
    icon: 'pi pi-chart-doughnut',
    chartType: 'doughnut',
    loading: false,
    showTotals: true,
    chartData: mockPieChartData,
  },
};

/**
 * Stan ładowania
 */
export const Loading: Story = {
  args: {
    title: 'Ładowanie danych...',
    icon: 'pi pi-spinner',
    chartType: 'line',
    loading: true,
    chartData: emptyChartData,
  },
};

/**
 * Brak danych
 */
export const Empty: Story = {
  args: {
    title: 'Brak danych',
    icon: 'pi pi-inbox',
    chartType: 'bar',
    loading: false,
    emptyMessage: 'Brak transakcji do wyświetlenia. Zaloguj się, aby zobaczyć dane.',
    chartData: emptyChartData,
  },
};

/**
 * Z help text - instrukcje dla użytkownika
 */
export const WithHelpText: Story = {
  args: {
    title: 'Płatności kredytów w 2026',
    icon: 'pi pi-chart-line',
    chartType: 'line',
    loading: false,
    showTotals: true,
    helpText: '💡 Kliknij etykietę, aby włączyć/wyłączyć serię. Najedź na punkt, aby zobaczyć szczegóły.',
    chartData: mockLineChartData,
  },
};

/**
 * Bez totali - czysto dane
 */
export const WithoutTotals: Story = {
  args: {
    title: 'Wydatki po miesiącach',
    icon: 'pi pi-chart-bar',
    chartType: 'bar',
    loading: false,
    showTotals: false,
    chartData: mockBarChartData,
  },
};

/**
 * Custom rozmiar panelu
 */
export const CustomSize: Story = {
  args: {
    title: 'Wysoki panel',
    icon: 'pi pi-chart-line',
    chartType: 'line',
    loading: false,
    panelClass: 'h-full min-h-[32rem]',
    showTotals: true,
    chartData: mockLineChartData,
  },
};

/**
 * Dark mode - automatycznie dostosowany
 */
export const DarkMode: Story = {
  args: {
    title: 'Kredyty do spłaty (Dark)',
    icon: 'pi pi-chart-line',
    chartType: 'line',
    loading: false,
    showTotals: true,
    chartData: mockLineChartData,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    story => ({
      components: { story },
      template: `
        <div class="dark">
          <div class="bg-surface-950 p-6 min-h-screen">
            <story />
          </div>
        </div>
      `,
    }),
  ],
};

/**
 * Wszystkie warianty razem - showcase
 */
export const AllVariants: Story = {
  args: {
    title: 'Showcase',
    icon: 'pi pi-chart-line',
    chartType: 'line',
    loading: false,
    showTotals: true,
    chartData: mockLineChartData,
  },
  render: () => ({
    components: { GenericChartPanel },
    template: `
      <div class="space-y-6">
        <GenericChartPanel
          title="Wykres liniowy"
          icon="pi pi-chart-line"
          chart-type="line"
          :show-totals="true"
          :chart-data="lineData"
        />

        <GenericChartPanel
          title="Wykres słupkowy"
          icon="pi pi-chart-bar"
          chart-type="bar"
          :show-totals="true"
          :chart-data="barData"
        />

        <GenericChartPanel
          title="Wykres kołowy"
          icon="pi pi-chart-pie"
          chart-type="pie"
          :show-totals="true"
          :chart-data="pieData"
        />
      </div>
    `,
    data: () => ({
      lineData: mockLineChartData,
      barData: mockBarChartData,
      pieData: mockPieChartData,
    }),
  }),
};
