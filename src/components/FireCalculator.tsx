import { useState, useRef } from "react";
import type {
  ExtendedFireInputs,
  FireResults,
  AdditionalExpense,
} from "../types/fire";
import { calculateFireProjections } from "../utils/fireCalculations";
import FireForm from "./FireForm";
import FireSummaryExport from "./FireSummaryExport";
import FireExplanation from "./FireExplanation";
import ImportExportModal from "./ImportExportModal";

const defaultInputs: ExtendedFireInputs = {
  // Basic inputs
  currentAge: 30,
  currentSavings: 100000,
  currentLiabilities: 0,
  annualIncome: 100000,
  annualExpenses: 50000,
  investmentReturn: 0.07,
  inflationRate: 0.03,
  taxRate: 0.25,
  careerGrowthRate: 0.03,
  careerGrowthSlowdownAge: 45,

  // Additional expenses
  additionalRetirementExpenses: [],
  hasKidsExpenses: false,
  kidsExpenses: [],
  hasParentsCare: false,
  parentsCareExpenses: [],
};

export default function FireCalculator() {
  const [inputs, setInputs] = useState<ExtendedFireInputs>(defaultInputs);
  const [results, setResults] = useState<FireResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    name: keyof ExtendedFireInputs,
    value: number | boolean
  ) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value,
      // Reset related expenses when toggling off
      ...(name === "hasKidsExpenses" && !value && { kidsExpenses: [] }),
      ...(name === "hasParentsCare" && !value && { parentsCareExpenses: [] }),
    }));
    // Clear previous results when inputs change
    setResults(null);
    setError(null);
  };

  const handleAddExpense = (
    type: "retirement" | "kids" | "parents",
    expense: AdditionalExpense
  ) => {
    setInputs((prev) => {
      const expenses = {
        retirement: "additionalRetirementExpenses" as const,
        kids: "kidsExpenses" as const,
        parents: "parentsCareExpenses" as const,
      };
      const key = expenses[type];
      const currentExpenses = prev[key] || [];
      const expenseIndex = currentExpenses.findIndex(
        (e: AdditionalExpense) => e.id === expense.id
      );

      if (expenseIndex === -1) {
        // Add new expense
        return {
          ...prev,
          [key]: [...currentExpenses, expense],
        };
      } else {
        // Update existing expense
        const updatedExpenses = [...currentExpenses];
        updatedExpenses[expenseIndex] = expense;
        return {
          ...prev,
          [key]: updatedExpenses,
        };
      }
    });
    // Clear previous results when expenses change
    setResults(null);
    setError(null);
  };

  const handleRemoveExpense = (
    type: "retirement" | "kids" | "parents",
    id: string
  ) => {
    setInputs((prev) => {
      const expenses = {
        retirement: "additionalRetirementExpenses" as const,
        kids: "kidsExpenses" as const,
        parents: "parentsCareExpenses" as const,
      };
      const key = expenses[type];
      const currentExpenses = prev[key] || [];

      return {
        ...prev,
        [key]: currentExpenses.filter(
          (expense: AdditionalExpense) => expense.id !== id
        ),
      };
    });
    // Clear previous results when expenses change
    setResults(null);
    setError(null);
  };

  const validateInputs = (): boolean => {
    if (inputs.annualExpenses > inputs.annualIncome) {
      setError("Annual expenses cannot be greater than annual income");
      return false;
    }
    if (inputs.careerGrowthSlowdownAge <= inputs.currentAge) {
      setError("Career growth slowdown age must be greater than current age");
      return false;
    }
    return true;
  };

  const handleCalculate = () => {
    setError(null);
    if (!validateInputs()) {
      return;
    }

    setIsCalculating(true);
    try {
      // Wrap in setTimeout to allow UI to update with loading state
      setTimeout(() => {
        const results = calculateFireProjections(inputs);
        setResults(results);
        setIsCalculating(false);

        // Scroll to results after a short delay to ensure content is rendered
        setTimeout(() => {
          if (resultsRef.current) {
            const yOffset = -20; // Add some padding from the top
            const element = resultsRef.current;
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 100);
      }, 100);
    } catch (err) {
      setError(
        "An error occurred while calculating. Please check your inputs."
      );
      setIsCalculating(false);
    }
  };

  const handleImport = (newInputs: ExtendedFireInputs) => {
    setInputs(newInputs);
    setResults(null);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 px-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight">FreedomFIRE</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Plan Your Path to Financial Independence
          </p>
        </div>
        <button
          onClick={() => setIsImportExportOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm w-full sm:w-auto"
        >
          Import/Export Data
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-4 sm:p-8">
          <FireForm
            inputs={inputs}
            onInputChange={handleInputChange}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition-colors text-sm font-medium"
            >
              {isCalculating ? "Calculating..." : "Calculate FIRE"}
            </button>
          </div>
        </div>

        {results && (
          <div ref={resultsRef}>
            <div className="bg-white p-4 sm:p-8">
              <FireSummaryExport
                inputs={inputs}
                results={results}
                netWorthData={{
                  labels: results.yearlyProjections.map((p) => p.age),
                  datasets: [
                    {
                      label: "Net Worth",
                      data: results.yearlyProjections.map((p) => p.netWorth),
                      borderColor: "rgb(59, 130, 246)",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                netWorthOptions={{
                  plugins: {
                    title: {
                      display: true,
                      text: "Net Worth Projection (in today's dollars)",
                    },
                  },
                }}
                incomeExpensesData={{
                  labels: results.yearlyProjections.map((p) => p.age),
                  datasets: [
                    {
                      label: "Employment Income",
                      data: results.yearlyProjections.map(
                        (p) => p.annualIncome
                      ),
                      borderColor: "rgb(34, 197, 94)",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Investment Returns",
                      data: results.yearlyProjections.map(
                        (p) => p.investmentReturns
                      ),
                      borderColor: "rgb(168, 85, 247)",
                      backgroundColor: "rgba(168, 85, 247, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Base Expenses",
                      data: results.yearlyProjections.map(
                        (p) => p.baseExpenses
                      ),
                      borderColor: "rgb(239, 68, 68)",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                    ...(inputs.hasKidsExpenses
                      ? [
                          {
                            label: "Kids Expenses",
                            data: results.yearlyProjections.map(
                              (p) => p.kidsExpenses || 0
                            ),
                            borderColor: "rgb(245, 158, 11)",
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                            fill: true,
                            tension: 0.4,
                          },
                        ]
                      : []),
                    ...(inputs.hasParentsCare
                      ? [
                          {
                            label: "Elderly Care Expenses",
                            data: results.yearlyProjections.map(
                              (p) => p.parentsCareExpenses || 0
                            ),
                            borderColor: "rgb(236, 72, 153)",
                            backgroundColor: "rgba(236, 72, 153, 0.1)",
                            fill: true,
                            tension: 0.4,
                          },
                        ]
                      : []),
                  ],
                }}
                incomeExpensesOptions={{
                  plugins: {
                    title: {
                      display: true,
                      text: "Income, Expenses & Investment Returns (in today's dollars)",
                    },
                  },
                }}
              />
            </div>
            <div className="bg-white p-4 sm:p-8">
              <FireExplanation inputs={inputs} results={results} />
            </div>
          </div>
        )}
      </div>

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImport={handleImport}
        currentInputs={inputs}
      />
    </div>
  );
}
