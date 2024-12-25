import { ChangeEvent } from "react";
import type { ExtendedFireInputs, AdditionalExpense } from "../types/fire";
import FormLabel from "./FormLabel";

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
            <FormLabel
              htmlFor="currentAge"
              label="Current Age"
              tooltip="Your current age in years"
            />
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
            <FormLabel
              htmlFor="currentSavings"
              label="Current Savings"
              tooltip="Your current total savings and investments"
              showTodaysDollar
            />
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
            <FormLabel
              htmlFor="annualIncome"
              label="Annual Income"
              tooltip="Your total annual income before taxes"
              showTodaysDollar
              futureValue={inputs.annualIncome}
              inflationRate={inputs.inflationRate}
              years={10}
            />
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
            <FormLabel
              htmlFor="annualExpenses"
              label="Annual Expenses"
              tooltip="Your total annual living expenses"
              showTodaysDollar
              futureValue={inputs.annualExpenses}
              inflationRate={inputs.inflationRate}
              years={10}
            />
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
            <FormLabel
              label="Investment Return Rate"
              tooltip="Expected annual return on investments after inflation (real return)"
            >
              {toPercentage(inputs.investmentReturn)}%
            </FormLabel>
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
            <FormLabel
              label="Inflation Rate"
              tooltip="Expected annual inflation rate"
            >
              {toPercentage(inputs.inflationRate)}%
            </FormLabel>
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
            <FormLabel
              label="Tax Rate"
              tooltip="Your effective tax rate on income"
            >
              {toPercentage(inputs.taxRate)}%
            </FormLabel>
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
              <FormLabel
                label="Career Growth Rate"
                tooltip="Expected annual income growth rate above inflation"
              >
                {toPercentage(inputs.careerGrowthRate)}%
              </FormLabel>
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
              <FormLabel
                htmlFor="careerGrowthSlowdownAge"
                label="Growth Slowdown Age"
                tooltip="Age at which career growth slows to match inflation"
              />
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
            <FormLabel
              label="Retirement Expenses"
              tooltip="Additional expenses you expect in retirement"
            />
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
                  <FormLabel label="Expense Name" />
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
                  <FormLabel
                    label="Amount"
                    showTodaysDollar
                    futureValue={expense.amount}
                    inflationRate={inputs.inflationRate}
                    years={
                      expense.startAge
                        ? expense.startAge - inputs.currentAge
                        : 0
                    }
                  />
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
                  <FormLabel
                    label="Start Age"
                    tooltip="Age when this expense starts"
                  />
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
                  <FormLabel
                    label="End Age"
                    tooltip="Optional: Age when this expense ends"
                  />
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
            <FormLabel
              htmlFor="hasKidsExpenses"
              label="Include Kids Expenses"
              tooltip="Add expenses for children's needs and education"
              className="ml-2 text-lg !mb-0"
            />
          </div>

          {inputs.hasKidsExpenses && (
            <div className="pl-6">
              <div className="flex justify-between items-center mb-4">
                <FormLabel label="Kids Expenses" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel label="Kid's Name" />
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
                      <FormLabel
                        label="Annual Expenses"
                        showTodaysDollar
                        futureValue={expense.amount}
                        inflationRate={inputs.inflationRate}
                        years={
                          expense.startAge
                            ? expense.startAge - inputs.currentAge
                            : 0
                        }
                      />
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
                      <FormLabel
                        label="Start Age (Your Age)"
                        tooltip="Your age when these expenses start"
                      />
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
                      <FormLabel
                        label="End Age (Your Age)"
                        tooltip="Your age when these expenses end"
                      />
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
            <FormLabel
              htmlFor="hasParentsCare"
              label="Include Parents Care Expenses"
              tooltip="Add expenses for parents' care and support"
              className="ml-2 text-lg !mb-0"
            />
          </div>

          {inputs.hasParentsCare && (
            <div className="pl-6">
              <div className="flex justify-between items-center mb-4">
                <FormLabel label="Parents Care Expenses" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel label="Parent's Name" />
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
                      <FormLabel
                        label="Annual Care Expenses"
                        showTodaysDollar
                        futureValue={expense.amount}
                        inflationRate={inputs.inflationRate}
                        years={
                          expense.startAge
                            ? expense.startAge - inputs.currentAge
                            : 0
                        }
                      />
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
                      <FormLabel
                        label="Start Age (Your Age)"
                        tooltip="Your age when these expenses start"
                      />
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
                      <FormLabel
                        label="End Age (Your Age)"
                        tooltip="Your age when these expenses end"
                      />
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
