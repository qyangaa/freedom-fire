import { useRef } from "react";
import type { ExtendedFireInputs, FireResults } from "../types/fire";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle
);

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

  const formatAxisValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
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

      // Convert to PNG
      const base64Image = canvas.toDataURL("image/png", 1.0);

      // Check if it's iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // For iOS devices, open image in new tab which allows saving to camera roll
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(
            `<img src="${base64Image}" alt="FIRE Summary" style="max-width: 100%; height: auto;" />`
          );
          newTab.document.title = "FIRE Summary";
        }
      } else if (
        navigator.share &&
        /mobile|android/i.test(navigator.userAgent)
      ) {
        try {
          // Convert base64 to blob
          const response = await fetch(base64Image);
          const blob = await response.blob();
          const file = new File([blob], "fire-summary.png", {
            type: "image/png",
          });

          await navigator.share({
            files: [file],
            title: "FIRE Summary",
          });
        } catch (error) {
          console.error("Error sharing:", error);
          // Fallback to download
          const downloadLink = document.createElement("a");
          downloadLink.href = base64Image;
          downloadLink.download = "fire-summary.png";
          downloadLink.click();
        }
      } else {
        // Desktop fallback - direct download
        const downloadLink = document.createElement("a");
        downloadLink.href = base64Image;
        downloadLink.download = "fire-summary.png";
        downloadLink.click();
      }
    } catch (error) {
      console.error("Error exporting summary:", error);
    }
  };

  // Mobile-optimized chart options
  const getMobileOptions = (
    options: ChartOptions<"line">
  ): ChartOptions<"line"> => ({
    ...options,
    layout: {
      padding: {
        left: 12,
        right: 12,
        top: 16,
        bottom: 16,
      },
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
      },
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
    },
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        position: "bottom" as const,
        align: "start" as const,
        labels: {
          ...options.plugins?.legend?.labels,
          boxWidth: window.innerWidth < 640 ? 10 : 12,
          padding: window.innerWidth < 640 ? 10 : 12,
          font: {
            size: window.innerWidth < 640 ? 11 : 14,
            family: "system-ui",
            weight: "bold",
          },
          usePointStyle: true,
        },
      },
      title: {
        ...options.plugins?.title,
        display: true,
        font: {
          size: window.innerWidth < 640 ? 13 : 16,
          family: "system-ui",
          weight: "normal",
        },
        padding: { top: 12, bottom: 12 },
        color: "rgb(107, 114, 128)", // text-gray-500
        text: options.plugins?.title?.text || "",
        align: "start" as const,
      },
      tooltip: {
        ...options.plugins?.tooltip,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 8,
        titleFont: {
          size: window.innerWidth < 640 ? 12 : 14,
          family: "system-ui",
          weight: "bold",
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 11 : 13,
          family: "system-ui",
        },
        cornerRadius: 4,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return ` ${context.dataset.label}: ${formatAxisValue(value)}`;
          },
        },
      },
    },
    scales: {
      ...options.scales,
      y: {
        ...options.scales?.y,
        ticks: {
          ...options.scales?.y?.ticks,
          callback: (value) => formatAxisValue(Number(value)),
          font: {
            size: window.innerWidth < 640 ? 11 : 13,
            family: "system-ui",
            weight: "bold",
          },
          padding: 6,
          maxTicksLimit: window.innerWidth < 640 ? 5 : 6,
        },
        title: {
          display: false,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        border: {
          display: false,
        },
      },
      x: {
        ...options.scales?.x,
        ticks: {
          ...options.scales?.x?.ticks,
          font: {
            size: window.innerWidth < 640 ? 11 : 13,
            family: "system-ui",
            weight: "bold",
          },
          padding: 6,
          maxTicksLimit: window.innerWidth < 640 ? 5 : 6,
        },
        title: {
          display: true,
          text: "Age (Years)",
          font: {
            size: window.innerWidth < 640 ? 11 : 13,
            family: "system-ui",
            weight: "normal",
          },
          padding: { top: 10, bottom: 0 },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
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
          // Find the base expenses dataset
          const baseExpensesData = incomeExpensesData.datasets.find(
            (d) => d.label === "Base Expenses"
          );
          const baseExpenses = baseExpensesData
            ? Number(baseExpensesData.data[i])
            : 0;

          // Find the kids expenses dataset
          const kidsExpensesData = incomeExpensesData.datasets.find(
            (d) => d.label === "Kids Expenses"
          );
          const kidsExpenses = kidsExpensesData
            ? Number(kidsExpensesData.data[i])
            : 0;

          // Find the elderly care expenses dataset
          const elderlyCareExpensesData = incomeExpensesData.datasets.find(
            (d) => d.label === "Elderly Care Expenses"
          );
          const elderlyCareExpenses = elderlyCareExpensesData
            ? Number(elderlyCareExpensesData.data[i])
            : 0;

          // Find the additional retirement expenses dataset
          const additionalRetirementExpensesData =
            incomeExpensesData.datasets.find(
              (d) => d.label === "Additional Retirement Expenses"
            );
          const additionalRetirementExpenses = additionalRetirementExpensesData
            ? Number(additionalRetirementExpensesData.data[i])
            : 0;

          // Sum all expenses
          const totalExpenses =
            baseExpenses +
            kidsExpenses +
            elderlyCareExpenses +
            additionalRetirementExpenses;

          return totalExpenses;
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
      <div ref={containerRef} className="bg-white p-4 space-y-6 w-full">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight">FreedomFIRE</h1>
          <p className="text-gray-500 mt-2">
            Your Financial Independence Summary
          </p>
        </div>

        {/* Key Results */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-light mb-4">Key Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="space-y-6">
          <div className="bg-gray-50 p-0 sm:p-4 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[400px]">
              <Line
                data={simplifiedNetWorthData}
                options={{
                  ...getMobileOptions({
                    ...netWorthOptions,
                    plugins: {
                      ...netWorthOptions.plugins,
                      title: {
                        ...netWorthOptions.plugins?.title,
                        text: "Net Worth Over Time",
                        padding: { top: 20, bottom: 0 },
                      },
                      subtitle: {
                        display: true,
                        text: "All values in today's dollars",
                        color: "rgb(107, 114, 128)",
                        font: {
                          size: window.innerWidth < 640 ? 11 : 13,
                          family: "system-ui",
                        },
                        padding: { top: 8, bottom: 0 },
                      },
                    },
                  }),
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-0 sm:p-4 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[400px]">
              <Line
                data={simplifiedIncomeExpensesData}
                options={{
                  ...getMobileOptions({
                    ...incomeExpensesOptions,
                    plugins: {
                      ...incomeExpensesOptions.plugins,
                      title: {
                        ...incomeExpensesOptions.plugins?.title,
                        text: "Income & Expenses Over Time",
                        padding: { top: 20, bottom: 0 },
                      },
                      subtitle: {
                        display: true,
                        text: "All values in today's dollars",
                        color: "rgb(107, 114, 128)",
                        font: {
                          size: window.innerWidth < 640 ? 11 : 13,
                          family: "system-ui",
                        },
                        padding: { top: 8, bottom: 0 },
                      },
                    },
                  }),
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>

        {/* Key Assumptions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-light mb-4">Key Assumptions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Age:</span>{" "}
              {inputs.currentAge}
            </div>
            <div>
              <span className="text-gray-500">Current Assets:</span>{" "}
              {formatCurrency(inputs.currentSavings)}
            </div>
            <div>
              <span className="text-gray-500">Current Liabilities:</span>{" "}
              {formatCurrency(inputs.currentLiabilities)}
            </div>
            <div>
              <span className="text-gray-500">Net Worth:</span>{" "}
              {formatCurrency(
                inputs.currentSavings - inputs.currentLiabilities
              )}
            </div>
            <div>
              <span className="text-gray-500">Annual Income:</span>{" "}
              {formatCurrency(inputs.annualIncome)}
            </div>
            <div>
              <span className="text-gray-500">Annual Expenses:</span>{" "}
              {formatCurrency(
                inputs.annualExpenses +
                  inputs.additionalRetirementExpenses
                    .filter((e) => e.startAge === inputs.currentAge)
                    .reduce((sum, e) => sum + e.amount, 0) +
                  (inputs.hasKidsExpenses
                    ? inputs.kidsExpenses
                        .filter((e) => e.startAge === inputs.currentAge)
                        .reduce((sum, e) => sum + e.amount, 0)
                    : 0) +
                  (inputs.hasParentsCare
                    ? inputs.parentsCareExpenses
                        .filter((e) => e.startAge === inputs.currentAge)
                        .reduce((sum, e) => sum + e.amount, 0)
                    : 0)
              )}
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

      {/* Export Button */}
      <div className="mt-6">
        <button
          onClick={handleExport}
          className="w-full bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          {/iPad|iPhone|iPod/.test(navigator.userAgent)
            ? "Save Summary to Photos"
            : /mobile|android/i.test(navigator.userAgent)
            ? "Share Summary"
            : "Export Full Summary"}
        </button>
      </div>
    </div>
  );
}
