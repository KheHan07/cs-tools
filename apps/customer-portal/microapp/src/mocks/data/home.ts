import type { BarSeriesConfig, PieDataItem } from "@components/features/dashboard";

export const MOCK_PIE_DATA_OUTSTANDING_INCIDENTS: PieDataItem[] = [
  { label: "Critical (P1)", value: 1, color: "#FF4522" },
  { label: "High (P2)", value: 4, color: "#FF8C00" },
  { label: "Medium (P3)", value: 7, color: "#4D53E8" },
];

export const MOCK_PIE_DATA_ACTIVE_CASES: PieDataItem[] = [
  { label: "Critical (P1)", value: 1, color: "#FF4522" },
  { label: "High (P2)", value: 4, color: "#FF8C00" },
  { label: "Medium (P3)", value: 7, color: "#4D53E8" },
];

export const MOCK_BAR_CHART_SERIES_CASES_TREND: BarSeriesConfig[] = [
  { dataKey: "acme", label: "Acme", stack: "total", color: "#4D53E8" },
  { dataKey: "bites", label: "Bites", stack: "total", color: "#14A9C1" },
  { dataKey: "cupertino", label: "CupertinoHQ", stack: "total", color: "#E50051" },
  { dataKey: "dunlop", label: "Dunlop", stack: "total", color: "#FF8C00" },
];

export const MOCK_BAR_CHART_DATA_CASES_TREND = [
  { year: "2020", acme: 40, bites: 35, cupertino: 25, dunlop: 20 },
  { year: "2021", acme: 55, bites: 40, cupertino: 35, dunlop: 30 },
  { year: "2022", acme: 65, bites: 50, cupertino: 40, dunlop: 35 },
  { year: "2023", acme: 80, bites: 60, cupertino: 50, dunlop: 45 },
  { year: "2024", acme: 95, bites: 75, cupertino: 65, dunlop: 55 },
  { year: "2025", acme: 105, bites: 85, cupertino: 75, dunlop: 65 },
];
