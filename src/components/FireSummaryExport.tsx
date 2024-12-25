import { useRef } from "react";
import type { ExtendedFireInputs, FireResults } from "../types/fire";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

interface FireSummaryExportProps {
  inputs: ExtendedFireInputs;
  results: FireResults;
  netWorthData: ChartData<"line">;
  netWorthOptions: ChartOptions<"line">;
  incomeExpensesData: ChartData<"line">;
  incomeExpensesOptions: ChartOptions<"line">;
}

export default function FireSummaryExport({
  inputs,
  results,
  netWorthData,
  netWorthOptions,
  incomeExpensesData,
  incomeExpensesOptions,
}: FireSummaryExportProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleExport = async () => {
    if (!containerRef.current) return;

    try {
      // Use html2canvas to capture the content
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Convert to PNG and download
      const image = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = image;
      downloadLink.download = "fire-summary.png";
      downloadLink.click();
    } catch (error) {
      console.error("Error exporting summary:", error);
    }
  };

  // Mobile-optimized chart options
  const getMobileOptions = (
    options: ChartOptions<"line">
  ): ChartOptions<"line"> => ({
    ...options,
    responsive: false,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0, // Remove markers
        hitRadius: 10, // Keep hover detection area
      },
      line: {
        borderWidth: 2.5, // Make lines slightly thicker
      },
    },
    plugins: {
      ...options.plugins,
      annotation: {
        annotations: {
          fireAge: {
            type: "line",
            xMin: (incomeExpensesData.labels || []).findIndex(
              (age) => Number(age) === results.fireAge
            ),
            xMax: (incomeExpensesData.labels || []).findIndex(
              (age) => Number(age) === results.fireAge
            ),
            borderColor: "rgb(34, 197, 94)", // green-600
            borderWidth: 2,
            label: {
              display: true,
              content: "FIRE Age",
              position: "start",
            },
          },
          ...((options.plugins?.annotation as any)?.annotations?.zeroLine
            ? {
                zeroLine: {
                  type: "line",
                  yMin: 0,
                  yMax: 0,
                  borderColor: "rgb(156, 163, 175)", // gray-400
                  borderWidth: 1,
                  borderDash: [2, 2],
                },
              }
            : {}),
        },
      },
      legend: {
        ...options.plugins?.legend,
        position: "bottom" as const,
        labels: {
          ...options.plugins?.legend?.labels,
          boxWidth: 15,
          padding: 15,
          font: { size: 11 },
        },
      },
      title: {
        ...options.plugins?.title,
        font: { size: 13, weight: "bold" },
        padding: { top: 10, bottom: 15 },
      },
    },
    scales: {
      ...options.scales,
      y: {
        ...options.scales?.y,
        ticks: {
          ...options.scales?.y?.ticks,
          font: { size: 11 },
          maxTicksLimit: 6, // Limit number of ticks for cleaner look
        },
        title: {
          ...options.scales?.y?.title,
          font: { size: 11 },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ...options.scales?.x,
        ticks: {
          ...options.scales?.x?.ticks,
          font: { size: 11 },
          maxTicksLimit: 6, // Limit number of ticks
        },
        title: {
          ...options.scales?.x?.title,
          font: { size: 11 },
        },
        grid: {
          display: false, // Remove x-axis grid lines
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  });

  // Simplify income/expenses data by combining all expenses
  const simplifiedIncomeExpensesData = {
    labels: incomeExpensesData.labels || [],
    datasets: [
      {
        label: "Income",
        data: (incomeExpensesData.datasets.find(
          (d) => d.label === "Employment Income"
        )?.data || []) as number[],
        borderColor: "rgb(34, 197, 94)", // green-600
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Investment Returns",
        data: (incomeExpensesData.datasets.find(
          (d) => d.label === "Investment Returns"
        )?.data || []) as number[],
        borderColor: "rgb(168, 85, 247)", // purple-600
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Total Expenses",
        data: (incomeExpensesData.labels || []).map((_, i) => {
          const baseExpenses = Number(
            incomeExpensesData.datasets.find((d) => d.label === "Base Expenses")
              ?.data[i] || 0
          );
          const kidsExpenses = Number(
            incomeExpensesData.datasets.find((d) => d.label === "Kids Expenses")
              ?.data[i] || 0
          );
          const parentsCareExpenses = Number(
            incomeExpensesData.datasets.find(
              (d) => d.label === "Parents Care Expenses"
            )?.data[i] || 0
          );
          const additionalRetirementExpenses = Number(
            incomeExpensesData.datasets.find(
              (d) => d.label === "Additional Retirement Expenses"
            )?.data[i] || 0
          );
          return (
            baseExpenses +
            kidsExpenses +
            parentsCareExpenses +
            additionalRetirementExpenses
          );
        }),
        borderColor: "rgb(239, 68, 68)", // red-600
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Simplify net worth data by removing points
  const simplifiedNetWorthData = {
    labels: netWorthData.labels,
    datasets: [
      {
        ...netWorthData.datasets[0],
        pointRadius: 0,
        borderWidth: 2.5,
      },
    ],
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        className="absolute -top-12 right-0 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
      >
        Export Full Summary
      </button>
      <div
        ref={containerRef}
        className="bg-white p-8 space-y-8"
        style={{ width: "390px" }} // iPhone 12 Pro width
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight">FreedomFIRE</h1>
          <p className="text-gray-500 mt-2">
            Your Financial Independence Summary
          </p>
        </div>

        {/* Key Results */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h2 className="text-lg font-light mb-4">Key Results</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">FIRE Age:</span>{" "}
              <span className="text-xl font-light">{results.fireAge}</span>
              <span className="text-gray-500 text-sm ml-2">
                ({results.yearsToFire} years to go)
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Final Net Worth:</span>{" "}
              <span className="text-xl font-light">
                {formatCurrency(results.finalNetWorth)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">
                Annual Expenses at FIRE:
              </span>{" "}
              <span className="text-xl font-light">
                {formatCurrency(results.projectedAnnualExpensesAtFire)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">
                Real Investment Return:
              </span>{" "}
              <span className="text-xl font-light">
                {formatPercentage(results.realInvestmentReturn)}
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <div className="bg-gray-50 p-4 rounded-xl">
            <Line
              data={simplifiedNetWorthData}
              options={getMobileOptions(netWorthOptions)}
              width={350}
              height={280}
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <Line
              data={simplifiedIncomeExpensesData}
              options={getMobileOptions(incomeExpensesOptions)}
              width={350}
              height={280}
            />
          </div>
        </div>

        {/* Key Assumptions */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h2 className="text-lg font-light mb-4">Key Assumptions</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Current Age:</span>{" "}
              {inputs.currentAge}
            </div>
            <div>
              <span className="text-gray-500">Current Savings:</span>{" "}
              {formatCurrency(inputs.currentSavings)}
            </div>
            <div>
              <span className="text-gray-500">Annual Income:</span>{" "}
              {formatCurrency(inputs.annualIncome)}
            </div>
            <div>
              <span className="text-gray-500">Annual Expenses:</span>{" "}
              {formatCurrency(inputs.annualExpenses)}
            </div>
            <div>
              <span className="text-gray-500">Investment Return:</span>{" "}
              {formatPercentage(inputs.investmentReturn)}
            </div>
            <div>
              <span className="text-gray-500">Inflation Rate:</span>{" "}
              {formatPercentage(inputs.inflationRate)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          <p>Generated by FreedomFIRE</p>
          <p>All values are in today's dollars, adjusted for inflation</p>
        </div>
      </div>
    </div>
  );
}
