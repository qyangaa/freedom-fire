import { ChangeEvent } from "react";
import type { ExtendedFireInputs } from "../types/fire";

interface FireFormProps {
  inputs: ExtendedFireInputs;
  onInputChange: (name: keyof ExtendedFireInputs, value: number) => void;
}

export default function FireForm({ inputs, onInputChange }: FireFormProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: number;

    if (type === "range") {
      // Convert percentage to decimal for slider inputs
      parsedValue = parseFloat(value) / 100;
    } else {
      parsedValue = parseFloat(value);
    }

    if (!isNaN(parsedValue)) {
      onInputChange(name as keyof ExtendedFireInputs, parsedValue);
    }
  };

  // Format decimal to percentage for display
  const toPercentage = (value: number) => (value * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="currentAge"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Age
            </label>
            <input
              type="number"
              id="currentAge"
              name="currentAge"
              value={inputs.currentAge}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="currentSavings"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Savings ($)
            </label>
            <input
              type="number"
              id="currentSavings"
              name="currentSavings"
              value={inputs.currentSavings}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="annualIncome"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Annual Income ($)
            </label>
            <input
              type="number"
              id="annualIncome"
              name="annualIncome"
              value={inputs.annualIncome}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="annualExpenses"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Annual Expenses ($)
            </label>
            <input
              type="number"
              id="annualExpenses"
              name="annualExpenses"
              value={inputs.annualExpenses}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rates and Projections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rates and Projections</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Return Rate ({toPercentage(inputs.investmentReturn)}%)
            </label>
            <input
              type="range"
              name="investmentReturn"
              value={toPercentage(inputs.investmentReturn)}
              onChange={handleInputChange}
              min="0"
              max="15"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inflation Rate ({toPercentage(inputs.inflationRate)}%)
            </label>
            <input
              type="range"
              name="inflationRate"
              value={toPercentage(inputs.inflationRate)}
              onChange={handleInputChange}
              min="0"
              max="10"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate ({toPercentage(inputs.taxRate)}%)
            </label>
            <input
              type="range"
              name="taxRate"
              value={toPercentage(inputs.taxRate)}
              onChange={handleInputChange}
              min="0"
              max="50"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Career Growth Rate ({toPercentage(inputs.careerGrowthRate)}%)
              </label>
              <input
                type="range"
                name="careerGrowthRate"
                value={toPercentage(inputs.careerGrowthRate)}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="careerGrowthSlowdownAge"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Growth Slowdown Age
              </label>
              <input
                type="number"
                id="careerGrowthSlowdownAge"
                name="careerGrowthSlowdownAge"
                value={inputs.careerGrowthSlowdownAge}
                onChange={handleInputChange}
                min={inputs.currentAge}
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
