import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "react-chartjs-2";
import type { YearlyProjection } from "../types/fire";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface FireChartsProps {
  projections: YearlyProjection[];
  fireAge: number;
}

export default function FireCharts({ projections, fireAge }: FireChartsProps) {
  // Format currency for tooltips and axes
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Common chart options
  const commonOptions: ChartOptions<"line"> = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  };

  // Net Worth Chart Data
  const netWorthData = {
    labels: projections.map((p) => p.age),
    datasets: [
      {
        label: "Net Worth",
        data: projections.map((p) => p.netWorth),
        borderColor: "rgb(59, 130, 246)", // blue-600
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const netWorthOptions: ChartOptions<"line"> = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Net Worth Projection",
      },
      annotation: {
        annotations: {
          fireAge: {
            type: "line",
            xMin: fireAge,
            xMax: fireAge,
            borderColor: "rgb(34, 197, 94)", // green-600
            borderWidth: 2,
            label: {
              display: true,
              content: "FIRE Age",
              position: "start",
            },
          },
        },
      },
    },
  };

  // Income vs Expenses Chart Data
  const incomeExpensesData = {
    labels: projections.map((p) => p.age),
    datasets: [
      {
        label: "Annual Income",
        data: projections.map((p) => p.annualIncome),
        borderColor: "rgb(34, 197, 94)", // green-600
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Annual Expenses",
        data: projections.map((p) => p.annualExpenses),
        borderColor: "rgb(239, 68, 68)", // red-600
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Investment Returns",
        data: projections.map((p) => p.investmentReturns),
        borderColor: "rgb(168, 85, 247)", // purple-600
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const incomeExpensesOptions: ChartOptions<"line"> = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Income, Expenses & Investment Returns",
      },
      annotation: {
        annotations: {
          fireAge: {
            type: "line",
            xMin: fireAge,
            xMax: fireAge,
            borderColor: "rgb(34, 197, 94)", // green-600
            borderWidth: 2,
            label: {
              display: true,
              content: "FIRE Age",
              position: "start",
            },
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Line options={netWorthOptions} data={netWorthData} />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Line options={incomeExpensesOptions} data={incomeExpensesData} />
      </div>
    </div>
  );
}
