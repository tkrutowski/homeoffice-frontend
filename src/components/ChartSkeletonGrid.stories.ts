import type { Meta, StoryObj } from '@storybook/vue3';
import ChartSkeletonGrid from './ChartSkeletonGrid.vue';

const meta = {
  title: 'Components/ChartSkeletonGrid',
  component: ChartSkeletonGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'radio' },
      options: [1, 2, 3, 4],
      description: 'Liczba kolumn w grid',
    },
    rows: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Liczba rzędów',
    },
    height: {
      control: { type: 'text' },
      description: 'Wysokość wykresu (Tailwind class)',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Czy pierwszy element zajmuje full width',
    },
  },
} satisfies Meta<typeof ChartSkeletonGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Domyślny layout - 2 kolumny, 1 rząd, wysokość h-72
 */
export const Default: Story = {
  args: {
    columns: 2,
    rows: 1,
    height: 'h-72',
    fullWidth: false,
  },
};

/**
 * Pojedyncza kolumna - dla mobile/responsive
 */
export const SingleColumn: Story = {
  args: {
    columns: 1,
    rows: 2,
    height: 'h-72',
    fullWidth: false,
  },
};

/**
 * Cztery kolumny - dla summary cards
 */
export const FourColumns: Story = {
  args: {
    columns: 4,
    rows: 1,
    height: 'h-72',
    fullWidth: false,
  },
};

/**
 * Wiele rzędów - loading большого dashboardu
 */
export const ManyRows: Story = {
  args: {
    columns: 2,
    rows: 3,
    height: 'h-72',
    fullWidth: false,
  },
};

/**
 * Full width mode - jeden element zajmuje pełną szerokość
 */
export const FullWidth: Story = {
  args: {
    columns: 2,
    rows: 2,
    height: 'h-80',
    fullWidth: true,
  },
};

/**
 * Różne wysokości - dla niestandardowych rozmiarów
 */
export const TallCharts: Story = {
  args: {
    columns: 2,
    rows: 1,
    height: 'h-96',
    fullWidth: false,
  },
};

/**
 * Niskie wykresy - kompaktowy layout
 */
export const CompactCharts: Story = {
  args: {
    columns: 3,
    rows: 2,
    height: 'h-48',
    fullWidth: false,
  },
};

/**
 * Responsywny layout - symulacja dashboard'u
 */
export const DashboardLayout: Story = {
  args: {
    columns: 2,
    rows: 2,
    height: 'h-72',
    fullWidth: false,
  },
  decorators: [
    () => ({
      template: `
        <div class="space-y-8">
          <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded">
            <h2 class="text-lg font-bold mb-4">Summary Cards</h2>
            <ChartSkeletonGrid :columns="4" :rows="1" height="h-32" />
          </div>

          <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded">
            <h2 class="text-lg font-bold mb-4">Monthly Charts</h2>
            <ChartSkeletonGrid :columns="2" :rows="1" height="h-72" />
          </div>

          <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded">
            <h2 class="text-lg font-bold mb-4">Full Width Chart</h2>
            <ChartSkeletonGrid :columns="2" :rows="1" height="h-80" :full-width="true" />
          </div>
        </div>
      `,
      components: { ChartSkeletonGrid },
    }),
  ],
};
