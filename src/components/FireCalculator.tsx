import { useState } from "react";
import type {
  ExtendedFireInputs,
  FireResults,
  AdditionalExpense,
} from "../types/fire";
import { calculateFireProjections } from "../utils/fireCalculations";
import FireForm from "./FireForm";
import FireCharts from "./FireCharts";
import FireExplanation from "./FireExplanation";
import ImportExportModal from "./ImportExportModal";

const defaultInputs: ExtendedFireInputs = {
  // Basic inputs
  currentAge: 30,
  currentSavings: 100000,
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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-light tracking-tight">FreedomFIRE</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Plan Your Path to Financial Independence
          </p>
        </div>
        <button
          onClick={() => setIsImportExportOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Import/Export Data
        </button>
      </div>

      <div className="space-y-12">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
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
          <>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-light mb-8">Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    FIRE Age
                  </h3>
                  <p className="text-4xl font-light">{results.fireAge}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Years to FIRE: {results.yearsToFire}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Final Net Worth
                  </h3>
                  <p className="text-4xl font-light">
                    ${Math.round(results.finalNetWorth).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Annual Expenses at FIRE
                  </h3>
                  <p className="text-4xl font-light">
                    $
                    {Math.round(
                      results.projectedAnnualExpensesAtFire
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Real Investment Return
                  </h3>
                  <p className="text-4xl font-light">
                    {(results.realInvestmentReturn * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-500 text-sm mt-1">After inflation</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <FireCharts
                projections={results.yearlyProjections}
                fireAge={results.fireAge}
                inflationRate={inputs.inflationRate}
                inputs={inputs}
                results={results}
              />
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <FireExplanation inputs={inputs} results={results} />
            </div>
          </>
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
