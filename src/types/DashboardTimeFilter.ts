export type DashboardViewMode = 'all-time' | 'year' | 'quarter' | 'month';

export interface DashboardTimeFilter {
  mode: DashboardViewMode;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  month: number;
}
