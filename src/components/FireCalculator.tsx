import { useState } from "react";
import type {
  ExtendedFireInputs,
  FireResults,
  AdditionalExpense,
} from "../types/fire";
import FireForm from "./FireForm";

const defaultInputs: ExtendedFireInputs = {
  // Basic inputs
  currentAge: 25,
  currentSavings: 10000,
  annualIncome: 60000,
  annualExpenses: 40000,
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
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    // TODO: Implement calculation logic
    setIsCalculating(false);
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
          <div className="mt-8">{/* TODO: Add FireResults component */}</div>
        )}
      </div>
    </div>
  );
}
