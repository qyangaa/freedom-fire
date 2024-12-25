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

const defaultInputs: ExtendedFireInputs = {
  // Basic inputs
  currentAge: 31,
  currentSavings: 800000,
  annualIncome: 300000,
  annualExpenses: 40000,
  investmentReturn: 0.04,
  inflationRate: 0.02,
  taxRate: 0.35,
  careerGrowthRate: 0.03,
  careerGrowthSlowdownAge: 45,

  // Additional expenses
  additionalRetirementExpenses: [],
  hasKidsExpenses: true,
  kidsExpenses: [
    {
      id: "kid1",
      name: "Kid 1",
      amount: 50000,
      startAge: 31,
      endAge: 55,
    },
  ],
  hasParentsCare: true,
  parentsCareExpenses: [
    {
      id: "parent1",
      name: "Parent 1",
      amount: 50000,
      startAge: 50,
      endAge: 70,
    },
  ],
};

export default function FireCalculator() {
  const [inputs, setInputs] = useState<ExtendedFireInputs>(defaultInputs);
  const [results, setResults] = useState<FireResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        retirement: "additionalRetirementExpenses",
        kids: "kidsExpenses",
        parents: "parentsCareExpenses",
      };
      const key = expenses[type];
      const currentExpenses = prev[key] || [];
      const expenseIndex = currentExpenses.findIndex(
        (e) => e.id === expense.id
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
        retirement: "additionalRetirementExpenses",
        kids: "kidsExpenses",
        parents: "parentsCareExpenses",
      };
      const key = expenses[type];
      const currentExpenses = prev[key] || [];

      return {
        ...prev,
        [key]: currentExpenses.filter((expense) => expense.id !== id),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">FIRE Calculator</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <FireForm
            inputs={inputs}
            onInputChange={handleInputChange}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isCalculating ? "Calculating..." : "Calculate FIRE"}
            </button>
          </div>
        </div>

        {results && (
          <>
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">FIRE Age</h3>
                  <p className="text-3xl text-blue-600">{results.fireAge}</p>
                  <p className="text-gray-600">
                    Years to FIRE: {results.yearsToFire}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Final Net Worth
                  </h3>
                  <p className="text-3xl text-blue-600">
                    ${Math.round(results.finalNetWorth).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Annual Expenses at FIRE
                  </h3>
                  <p className="text-3xl text-blue-600">
                    $
                    {Math.round(
                      results.projectedAnnualExpensesAtFire
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Real Investment Return
                  </h3>
                  <p className="text-3xl text-blue-600">
                    {(results.realInvestmentReturn * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-600">After inflation</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <FireCharts
                projections={results.yearlyProjections}
                fireAge={results.fireAge}
                inflationRate={inputs.inflationRate}
              />
            </div>

            <div className="mt-8">
              <FireExplanation inputs={inputs} results={results} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
