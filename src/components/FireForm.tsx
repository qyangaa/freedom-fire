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

const toPercentage = (value: number) => Math.round(value * 100);
const fromPercentage = (value: number) => value / 100;

export default function FireForm({
  inputs,
  onInputChange,
  onAddExpense,
  onRemoveExpense,
}: FireFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: number | boolean = parseFloat(value);

    if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (name.includes("Rate")) {
      // Convert percentage input to decimal
      parsedValue = fromPercentage(parsedValue);
    }

    onInputChange(name as keyof ExtendedFireInputs, parsedValue);
  };

  const handleAddExpense = (type: "retirement" | "kids" | "parents") => {
    const newExpense: AdditionalExpense = {
      id: crypto.randomUUID(),
      name:
        type === "retirement"
          ? ""
          : `${type === "kids" ? "Child" : "Parent"} Expenses`,
      amount: 0,
      startAge: inputs.currentAge,
    };
    onAddExpense(type, newExpense);
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel
              htmlFor="currentAge"
              label="Current Age"
              tooltip="Your current age"
            />
            <input
              type="number"
              id="currentAge"
              name="currentAge"
              value={inputs.currentAge === 0 ? "" : inputs.currentAge}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "currentAge",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="currentSavings"
              label="Current Assets"
              tooltip="Total value of everything you own (savings, investments, property, etc.)"
              showTodaysDollar
            />
            <input
              type="number"
              id="currentSavings"
              name="currentSavings"
              value={inputs.currentSavings === 0 ? "" : inputs.currentSavings}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "currentSavings",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="currentLiabilities"
              label="Current Liabilities"
              tooltip="Total value of everything you owe (mortgages, loans, credit cards, etc.). Enter 0 if you have no debt."
              showTodaysDollar
            />
            <input
              type="number"
              id="currentLiabilities"
              name="currentLiabilities"
              value={inputs.currentLiabilities}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "currentLiabilities",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Current Net Worth:</span>
              <span className="text-xl font-light">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(
                  inputs.currentSavings - (inputs.currentLiabilities || 0)
                )}
              </span>
            </div>
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
              showDetailedFutureValue
            />
            <input
              type="number"
              id="annualIncome"
              name="annualIncome"
              value={inputs.annualIncome === 0 ? "" : inputs.annualIncome}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "annualIncome",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
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
              showDetailedFutureValue
            />
            <input
              type="number"
              id="annualExpenses"
              name="annualExpenses"
              value={inputs.annualExpenses === 0 ? "" : inputs.annualExpenses}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "annualExpenses",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rates and Projections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rates and Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel
              htmlFor="investmentReturn"
              label="Investment Return Rate (%)"
              tooltip="Expected annual return on investments after inflation (real return)"
            />
            <input
              type="number"
              id="investmentReturn"
              name="investmentReturn"
              value={
                inputs.investmentReturn === 0
                  ? ""
                  : toPercentage(inputs.investmentReturn)
              }
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue =
                  value === "" ? 0 : fromPercentage(parseFloat(value));
                onInputChange("investmentReturn", parsedValue);
              }}
              min="-2"
              max="12"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="inflationRate"
              label="Inflation Rate (%)"
              tooltip="Expected annual inflation rate"
            />
            <input
              type="number"
              id="inflationRate"
              name="inflationRate"
              value={
                inputs.inflationRate === 0
                  ? ""
                  : toPercentage(inputs.inflationRate)
              }
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue =
                  value === "" ? 0 : fromPercentage(parseFloat(value));
                onInputChange("inflationRate", parsedValue);
              }}
              min="0"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="taxRate"
              label="Tax Rate (%)"
              tooltip="Your effective tax rate"
            />
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={inputs.taxRate === 0 ? "" : toPercentage(inputs.taxRate)}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue =
                  value === "" ? 0 : fromPercentage(parseFloat(value));
                onInputChange("taxRate", parsedValue);
              }}
              min="0"
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="careerGrowthRate"
              label="Career Growth Rate (%)"
              tooltip="Expected annual income growth rate above inflation"
            />
            <input
              type="number"
              id="careerGrowthRate"
              name="careerGrowthRate"
              value={
                inputs.careerGrowthRate === 0
                  ? ""
                  : toPercentage(inputs.careerGrowthRate)
              }
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue =
                  value === "" ? 0 : fromPercentage(parseFloat(value));
                onInputChange("careerGrowthRate", parsedValue);
              }}
              min="0"
              max="15"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="careerGrowthSlowdownAge"
              label="Career Growth Slowdown Age"
              tooltip="Age at which your career growth starts to level off"
            />
            <input
              type="number"
              id="careerGrowthSlowdownAge"
              name="careerGrowthSlowdownAge"
              value={
                inputs.careerGrowthSlowdownAge === 0
                  ? ""
                  : inputs.careerGrowthSlowdownAge
              }
              onChange={(e) => {
                const value = e.target.value;
                onInputChange(
                  "careerGrowthSlowdownAge",
                  value === "" ? 0 : parseFloat(value)
                );
              }}
              min={inputs.currentAge + 1}
              max="80"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                    showDetailedFutureValue
                  />
                  <input
                    type="number"
                    value={expense.amount === 0 ? "" : expense.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedExpense = {
                        ...expense,
                        amount: value === "" ? 0 : parseFloat(value),
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <FormLabel
                    label="Start (Years from Now)"
                    tooltip="When will this expense start, in years from now"
                  />
                  <input
                    type="number"
                    value={expense.startAge - inputs.currentAge}
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedExpense = {
                        ...expense,
                        startAge:
                          value === ""
                            ? inputs.currentAge
                            : inputs.currentAge + parseFloat(value),
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <FormLabel
                    label="Duration (Years)"
                    tooltip="How long will this expense last (leave empty for lifelong)"
                  />
                  <input
                    type="number"
                    value={
                      expense.endAge ? expense.endAge - expense.startAge : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const updatedExpense = {
                        ...expense,
                        endAge: value
                          ? expense.startAge + parseFloat(value)
                          : undefined,
                      };
                      onAddExpense("retirement", updatedExpense);
                    }}
                    min="1"
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
                        showDetailedFutureValue
                      />
                      <input
                        type="number"
                        value={expense.amount === 0 ? "" : expense.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            amount: value === "" ? 0 : parseFloat(value),
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <FormLabel
                        label="Start (Years from Now)"
                        tooltip="When will these expenses start, in years from now"
                      />
                      <input
                        type="number"
                        value={expense.startAge - inputs.currentAge}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            startAge:
                              value === ""
                                ? inputs.currentAge
                                : inputs.currentAge + parseFloat(value),
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <FormLabel
                        label="Duration (Years)"
                        tooltip="How long will these expenses last (e.g., until college graduation)"
                      />
                      <input
                        type="number"
                        value={
                          expense.endAge
                            ? expense.endAge - expense.startAge
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            endAge: value
                              ? expense.startAge + parseFloat(value)
                              : undefined,
                          };
                          onAddExpense("kids", updatedExpense);
                        }}
                        min="1"
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
              label="Include Elderly Care Expenses"
              tooltip="Add expenses for elderly family care and support"
              className="ml-2 text-lg !mb-0"
            />
          </div>

          {inputs.hasParentsCare && (
            <div className="pl-6">
              <div className="flex justify-between items-center mb-4">
                <FormLabel label="Elderly Care Expenses" />
                <button
                  type="button"
                  onClick={() => handleAddExpense("parents")}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Care Plan
                </button>
              </div>

              {inputs.parentsCareExpenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-gray-50 p-4 rounded-md mb-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        showDetailedFutureValue
                      />
                      <input
                        type="number"
                        value={expense.amount === 0 ? "" : expense.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            amount: value === "" ? 0 : parseFloat(value),
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <FormLabel
                        label="Start (Years from Now)"
                        tooltip="When will these care expenses start, in years from now"
                      />
                      <input
                        type="number"
                        value={expense.startAge - inputs.currentAge}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            startAge:
                              value === ""
                                ? inputs.currentAge
                                : inputs.currentAge + parseFloat(value),
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <FormLabel
                        label="Duration (Years)"
                        tooltip="How long will these care expenses last (leave empty for lifelong)"
                      />
                      <input
                        type="number"
                        value={
                          expense.endAge
                            ? expense.endAge - expense.startAge
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const updatedExpense = {
                            ...expense,
                            endAge: value
                              ? expense.startAge + parseFloat(value)
                              : undefined,
                          };
                          onAddExpense("parents", updatedExpense);
                        }}
                        min="1"
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
    </form>
  );
}
