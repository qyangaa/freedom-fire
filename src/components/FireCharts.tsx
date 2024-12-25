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
import type { ExtendedFireInputs, FireResults } from "../types/fire";
import FireSummaryExport from "./FireSummaryExport";

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
  inflationRate: number;
  inputs: ExtendedFireInputs;
  results: FireResults;
}

export default function FireCharts({
  projections,
  fireAge,
  inflationRate,
  inputs,
  results,
}: FireChartsProps) {
  // Format currency for tooltips and axes
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Calculate nominal value for tooltip display
  const getNominalValue = (realValue: number, year: number) => {
    return realValue * Math.pow(1 + inflationRate, year - projections[0].age);
  };

  // Common chart options
  const commonOptions: ChartOptions<"line"> = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    elements: {
      point: {
        radius: 0, // Remove points
        hitRadius: 10, // Keep hover detection area
      },
      line: {
        tension: 0.4, // Smooth lines
        borderWidth: 2, // Thinner lines
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
            family: "system-ui",
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 13,
          family: "system-ui",
        },
        bodyFont: {
          size: 12,
          family: "system-ui",
        },
        callbacks: {
          title: (context) => {
            const age = context[0].label;
            return `Age ${age} (${
              parseInt(age) - projections[0].age
            } years from now)`;
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const realValue = context.parsed.y;
            const age = parseInt(context.label);
            const nominalValue = getNominalValue(realValue, age);

            return [
              `${label} (today's dollars): ${formatCurrency(realValue)}`,
              `${label} (future dollars): ${formatCurrency(nominalValue)}`,
            ];
          },
          footer: () => {
            return `\nAll values adjusted for ${(inflationRate * 100).toFixed(
              1
            )}% annual inflation`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
          font: {
            size: 11,
            family: "system-ui",
          },
          padding: 8,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Amount (in today's dollars)",
          font: {
            size: 11,
            family: "system-ui",
          },
          padding: { top: 10, bottom: 0 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "system-ui",
          },
          padding: 8,
        },
        title: {
          display: true,
          text: "Age",
          font: {
            size: 11,
            family: "system-ui",
          },
          padding: { top: 10, bottom: 0 },
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
        text: "Net Worth Projection (in today's dollars)",
      },
      annotation: {
        annotations: {
          fireAge: {
            type: "line",
            xMin: projections.findIndex((p) => p.age === fireAge),
            xMax: projections.findIndex((p) => p.age === fireAge),
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
        label: "Employment Income",
        data: projections.map((p) => p.annualIncome),
        borderColor: "rgb(34, 197, 94)", // green-600
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: "Investment Returns",
        data: projections.map((p) => p.investmentReturns),
        borderColor: "rgb(168, 85, 247)", // purple-600
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
        order: 2,
      },
      {
        label: "Base Expenses",
        data: projections.map((p) => p.baseExpenses),
        borderColor: "rgb(239, 68, 68)", // red-600
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        order: 3,
      },
      {
        label: "Kids Expenses",
        data: projections.map((p) => p.kidsExpenses || 0),
        borderColor: "rgb(245, 158, 11)", // amber-600
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
        order: 4,
      },
      {
        label: "Parents Care Expenses",
        data: projections.map((p) => p.parentsCareExpenses || 0),
        borderColor: "rgb(236, 72, 153)", // pink-600
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        fill: true,
        tension: 0.4,
        order: 5,
      },
      {
        label: "Additional Retirement Expenses",
        data: projections.map((p) => p.additionalRetirementExpenses || 0),
        borderColor: "rgb(124, 58, 237)", // violet-600
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        fill: true,
        tension: 0.4,
        order: 6,
      },
      {
        label: "Savings/Withdrawals",
        data: projections.map((p) => p.savings),
        borderColor: "rgb(59, 130, 246)", // blue-600
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderDash: [5, 5], // Dashed line for savings/withdrawals
        order: 7,
      },
    ].filter((dataset) => {
      // Only show expense types that have non-zero values
      if (dataset.label === "Kids Expenses") {
        return projections.some((p) => p.kidsExpenses && p.kidsExpenses > 0);
      }
      if (dataset.label === "Parents Care Expenses") {
        return projections.some(
          (p) => p.parentsCareExpenses && p.parentsCareExpenses > 0
        );
      }
      if (dataset.label === "Additional Retirement Expenses") {
        return projections.some(
          (p) =>
            p.additionalRetirementExpenses && p.additionalRetirementExpenses > 0
        );
      }
      return true;
    }),
  };

  const incomeExpensesOptions: ChartOptions<"line"> = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Income, Expenses & Investment Returns (in today's dollars)",
      },
      annotation: {
        annotations: {
          fireAge: {
            type: "line",
            xMin: projections.findIndex((p) => p.age === fireAge),
            xMax: projections.findIndex((p) => p.age === fireAge),
            borderColor: "rgb(34, 197, 94)", // green-600
            borderWidth: 2,
            label: {
              display: true,
              content: "FIRE Age",
              position: "start",
            },
          },
          zeroLine: {
            type: "line",
            yMin: 0,
            yMax: 0,
            borderColor: "rgb(156, 163, 175)", // gray-400
            borderWidth: 1,
            borderDash: [2, 2],
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Line options={netWorthOptions} data={netWorthData} />
        <p className="text-sm text-gray-500 mt-2 text-center">
          All values are adjusted for inflation and shown in today's dollars.
          Hover over the chart to see future dollar amounts.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Line options={incomeExpensesOptions} data={incomeExpensesData} />
        <p className="text-sm text-gray-500 mt-2 text-center">
          All values are adjusted for inflation and shown in today's dollars.
          Hover over the chart to see future dollar amounts.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Export Summary</h2>
        <FireSummaryExport
          inputs={inputs}
          results={results}
          netWorthData={netWorthData}
          netWorthOptions={netWorthOptions}
          incomeExpensesData={incomeExpensesData}
          incomeExpensesOptions={incomeExpensesOptions}
        />
      </div>
    </div>
  );
}
