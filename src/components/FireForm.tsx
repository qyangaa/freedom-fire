import { ChangeEvent } from "react";
import type { ExtendedFireInputs, AdditionalExpense } from "../types/fire";

interface FireFormProps {
  inputs: ExtendedFireInputs;
  onInputChange: (
    name: keyof ExtendedFireInputs,
    value: number | boolean
  ) => void;
  onAddExpense: (
    type: "retirement" | "kids" | "parents",
    expense: AdditionalExpense
  ) => void;
  onRemoveExpense: (
    type: "retirement" | "kids" | "parents",
    id: string
  ) => void;
}

export default function FireForm({
  inputs,
  onInputChange,
  onAddExpense,
  onRemoveExpense,
}: FireFormProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      onInputChange(name as keyof ExtendedFireInputs, checked);
      return;
    }

    let parsedValue: number;
    if (type === "range") {
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

  const handleAddExpense = (type: "retirement" | "kids" | "parents") => {
    const newExpense: AdditionalExpense = {
      id: crypto.randomUUID(),
      name: "",
      amount: 0,
      startAge: inputs.currentAge,
    };
    onAddExpense(type, newExpense);
  };

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

      {/* Additional Expenses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Additional Expenses</h2>

        {/* Retirement Expenses */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Retirement Expenses</h3>
            <button
              type="button"
              onClick={() => handleAddExpense("retirement")}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Expense
            </button>
          </div>

          {inputs.additionalRetirementExpenses.map((expense) => (
            <div key={expense.id} className="bg-gray-50 p-4 rounded-md mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Name
                  </label>
                  <input
                    type="text"
                    value={expense.name}
                    onChange={(e) => {
                      const updatedExpense = {
                        ...expense,
                        name: e.target.value,
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => {
                      const updatedExpense = {
                        ...expense,
                        amount: parseFloat(e.target.value) || 0,
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Age
                  </label>
                  <input
                    type="number"
                    value={expense.startAge}
                    onChange={(e) => {
                      const updatedExpense = {
                        ...expense,
                        startAge:
                          parseFloat(e.target.value) || inputs.currentAge,
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min={inputs.currentAge}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={expense.endAge || ""}
                    onChange={(e) => {
                      const updatedExpense = {
                        ...expense,
                        endAge: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min={expense.startAge}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExpense("retirement", expense.id)}
                className="mt-2 text-red-600 text-sm hover:text-red-700"
              >
                Remove Expense
              </button>
            </div>
          ))}
        </div>

        {/* Kids Expenses */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="hasKidsExpenses"
              name="hasKidsExpenses"
              checked={inputs.hasKidsExpenses}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="hasKidsExpenses"
              className="ml-2 text-lg font-medium"
            >
              Include Kids Expenses
            </label>
          </div>

          {inputs.hasKidsExpenses && (
            <div className="pl-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Kids Expenses</h3>
                <button
                  type="button"
                  onClick={() => handleAddExpense("kids")}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Kid
                </button>
              </div>

              {inputs.kidsExpenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-gray-50 p-4 rounded-md mb-3"
                >
                  {/* Similar fields as retirement expenses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kid's Name
                      </label>
                      <input
                        type="text"
                        value={expense.name}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            name: e.target.value,
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Expenses ($)
                      </label>
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            amount: parseFloat(e.target.value) || 0,
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Age (Your Age)
                      </label>
                      <input
                        type="number"
                        value={expense.startAge}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            startAge:
                              parseFloat(e.target.value) || inputs.currentAge,
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min={inputs.currentAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Age (Your Age)
                      </label>
                      <input
                        type="number"
                        value={expense.endAge || ""}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            endAge: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min={expense.startAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveExpense("kids", expense.id)}
                    className="mt-2 text-red-600 text-sm hover:text-red-700"
                  >
                    Remove Kid
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parents Care Expenses */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="hasParentsCare"
              name="hasParentsCare"
              checked={inputs.hasParentsCare}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="hasParentsCare"
              className="ml-2 text-lg font-medium"
            >
              Include Parents Care Expenses
            </label>
          </div>

          {inputs.hasParentsCare && (
            <div className="pl-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Parents Care Expenses</h3>
                <button
                  type="button"
                  onClick={() => handleAddExpense("parents")}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Parent
                </button>
              </div>

              {inputs.parentsCareExpenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-gray-50 p-4 rounded-md mb-3"
                >
                  {/* Similar fields as retirement expenses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent's Name
                      </label>
                      <input
                        type="text"
                        value={expense.name}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            name: e.target.value,
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Care Expenses ($)
                      </label>
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            amount: parseFloat(e.target.value) || 0,
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Age (Your Age)
                      </label>
                      <input
                        type="number"
                        value={expense.startAge}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            startAge:
                              parseFloat(e.target.value) || inputs.currentAge,
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min={inputs.currentAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Age (Your Age)
                      </label>
                      <input
                        type="number"
                        value={expense.endAge || ""}
                        onChange={(e) => {
                          const updatedExpense = {
                            ...expense,
                            endAge: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min={expense.startAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveExpense("parents", expense.id)}
                    className="mt-2 text-red-600 text-sm hover:text-red-700"
                  >
                    Remove Parent
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
