import { useState } from "react";
import type { ExtendedFireInputs, FireResults } from "../types/fire";

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
          {/* TODO: Add FireForm component */}
          <div className="mb-6">
            <p className="text-gray-600">
              Input your financial details to calculate your path to Financial
              Independence.
            </p>
          </div>

          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isCalculating ? "Calculating..." : "Calculate FIRE"}
          </button>
        </div>

        {results && (
          <div className="mt-8">{/* TODO: Add FireResults component */}</div>
        )}
      </div>
    </div>
  );
}
