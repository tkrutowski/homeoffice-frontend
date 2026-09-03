/**
 * Typy i interfejsy dla generycznych komponentów wykresów
 */

export type ChartType = 'line' | 'bar' | 'doughnut' | 'pie';

export interface ChartDatasetConfig {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
  fill?: boolean;
  borderWidth?: number;
  stack?: string;
}

export interface CategoryTotal {
  label: string;
  total: number;
  color: string;
}

export interface GenericChartData {
  labels: string[];
  datasets: ChartDatasetConfig[];
  categoryTotals: CategoryTotal[];
}

/**
 * Helper funkcja do tworzenia danych wykresu
 * @param labels - etykiety osi X (np. miesiące, lata, kategorie)
 * @param datasets - zestawy danych do wykresu
 * @param categoryTotals - sumy per kategoria do wyświetlenia w legendzie/pill'ach
 */
export function createChartData(
  labels: string[],
  datasets: ChartDatasetConfig[],
  categoryTotals: CategoryTotal[]
): GenericChartData {
  return {
    labels,
    datasets,
    categoryTotals,
  };
}

/**
 * Builder helper dla bardziej skomplikowanych scenariuszy
 */
export class ChartDataBuilder {
  private labels: string[] = [];
  private datasets: ChartDatasetConfig[] = [];
  private categoryTotals: CategoryTotal[] = [];

  setLabels(labels: string[]): this {
    this.labels = labels;
    return this;
  }

  addDataset(config: ChartDatasetConfig): this {
    this.datasets.push(config);
    return this;
  }

  addCategoryTotal(category: CategoryTotal): this {
    this.categoryTotals.push(category);
    return this;
  }

  build(): GenericChartData {
    return {
      labels: this.labels,
      datasets: this.datasets,
      categoryTotals: this.categoryTotals,
    };
  }
}
