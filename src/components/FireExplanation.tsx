import type { ExtendedFireInputs, FireResults } from "../types/fire";
import { toNominalValue } from "../utils/fireCalculations";

interface FireExplanationProps {
  inputs: ExtendedFireInputs;
  results: FireResults;
}

export default function FireExplanation({
  inputs,
  results,
}: FireExplanationProps) {
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

  // Get the projection at FIRE age
  const fireProjection = results.yearlyProjections.find(
    (p) => p.age === results.fireAge
  );

  // Calculate some example values for different time periods
  const yearsToFire = results.fireAge - inputs.currentAge;
  const nominalExpensesAtFire = toNominalValue(
    inputs.annualExpenses,
    inputs.inflationRate,
    yearsToFire
  );
  const nominalNetWorthAtFire = toNominalValue(
    fireProjection?.netWorth || 0,
    inputs.inflationRate,
    yearsToFire
  );

  // Calculate required net worth based on maximum expenses
  const maxExpenses = Math.max(
    inputs.annualExpenses,
    ...(inputs.kidsExpenses?.map((e) => e.amount) || []),
    ...(inputs.parentsCareExpenses?.map((e) => e.amount) || [])
  );
  const requiredNetWorth = (maxExpenses / inputs.investmentReturn) * 1.2;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">How the Numbers Work</h2>

      <div className="space-y-8">
        {/* Initial Situation */}
        <section>
          <h3 className="text-xl font-semibold mb-3">1. Your Starting Point</h3>
          <div className="pl-4 space-y-2">
            <p>• Current Age: {inputs.currentAge}</p>
            <p>• Current Savings: {formatCurrency(inputs.currentSavings)}</p>
            <p>• Annual Income: {formatCurrency(inputs.annualIncome)}</p>
            <p>• Annual Expenses: {formatCurrency(inputs.annualExpenses)}</p>
            <p className="text-sm text-gray-600 mt-2">
              These are your baseline numbers in today's dollars. All future
              projections are adjusted for inflation to maintain purchasing
              power.
            </p>
          </div>
        </section>

        {/* Growth Rates */}
        <section>
          <h3 className="text-xl font-semibold mb-3">
            2. Growth and Inflation Rates
          </h3>
          <div className="pl-4 space-y-2">
            <p>
              • Investment Return (after inflation):{" "}
              {formatPercentage(inputs.investmentReturn)}
            </p>
            <p>• Inflation Rate: {formatPercentage(inputs.inflationRate)}</p>
            <p>
              • Career Growth Rate (until age {inputs.careerGrowthSlowdownAge}):{" "}
              {formatPercentage(inputs.careerGrowthRate)}
            </p>
            <p>• Tax Rate: {formatPercentage(inputs.taxRate)}</p>
            <p className="text-sm text-gray-600 mt-2">
              Investment returns are in real terms (after inflation). Your
              career growth rate applies until your slowdown age, after which
              income grows only with inflation.
            </p>
          </div>
        </section>

        {/* FIRE Age Calculation */}
        <section>
          <h3 className="text-xl font-semibold mb-3">
            3. Net Worth Preservation Strategy
          </h3>
          <div className="pl-4 space-y-2">
            <p>• FIRE Age: {results.fireAge}</p>
            <p>• Years until FIRE: {yearsToFire}</p>
            <p>
              • Required Net Worth at FIRE: {formatCurrency(requiredNetWorth)}
            </p>
            <p>• Maximum Annual Expenses: {formatCurrency(maxExpenses)}</p>
            <p className="text-sm text-gray-600 mt-2">
              Your FIRE age is determined by when your net worth can generate
              sufficient investment returns to cover all expenses while
              preserving or growing your wealth in real terms. We require a 20%
              safety margin above the minimum required net worth.
            </p>
          </div>
        </section>

        {/* Calculation Steps */}
        <section>
          <h3 className="text-xl font-semibold mb-3">
            4. How We Calculate This
          </h3>
          <div className="pl-4 space-y-3">
            <p>
              1. <strong>Required Net Worth:</strong> We calculate the minimum
              net worth needed as:
            </p>
            <div className="pl-4">
              <p>
                Maximum Annual Expenses ÷ Investment Return Rate × 1.2 (safety
                margin)
              </p>
              <p>
                {formatCurrency(maxExpenses)} ÷{" "}
                {formatPercentage(inputs.investmentReturn)} × 1.2 ={" "}
                {formatCurrency(requiredNetWorth)}
              </p>
            </div>

            <p>
              2. <strong>Investment Returns:</strong> At{" "}
              {formatPercentage(inputs.investmentReturn)} real return, this
              generates:
            </p>
            <div className="pl-4">
              <p>
                {formatCurrency(requiredNetWorth)} ×{" "}
                {formatPercentage(inputs.investmentReturn)} ={" "}
                {formatCurrency(requiredNetWorth * inputs.investmentReturn)} per
                year
              </p>
            </div>

            <p>
              3. <strong>Sustainability Rules:</strong>
            </p>
            <div className="pl-4">
              <p>• Net worth must never decrease in real terms</p>
              <p>• Live only off investment returns, preserving principal</p>
              <p>• Maintain buffer for expense spikes (kids, parents care)</p>
              <p>• All values maintained in real (today's) dollars</p>
            </div>

            <p>
              4. <strong>FIRE Achievement:</strong> You reach FIRE when:
            </p>
            <div className="pl-4">
              <p>• Your net worth exceeds the required amount</p>
              <p>
                • Investment returns can cover all future expenses without
                touching principal
              </p>
              <p>• Net worth remains stable or growing in real terms</p>
            </div>
          </div>
        </section>

        {/* Additional Expenses Impact */}
        {(inputs.hasKidsExpenses ||
          inputs.hasParentsCare ||
          inputs.additionalRetirementExpenses.length > 0) && (
          <section>
            <h3 className="text-xl font-semibold mb-3">
              5. Impact of Additional Expenses
            </h3>
            <div className="pl-4 space-y-3">
              {inputs.additionalRetirementExpenses.length > 0 && (
                <div>
                  <p>
                    <strong>Retirement Expenses:</strong>
                  </p>
                  <ul className="list-disc pl-6">
                    {inputs.additionalRetirementExpenses.map((expense) => (
                      <li key={expense.id}>
                        {formatCurrency(expense.amount)} per year
                        {expense.startAge &&
                          ` starting at age ${expense.startAge}`}
                        {expense.endAge && ` until age ${expense.endAge}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inputs.hasKidsExpenses && inputs.kidsExpenses && (
                <div>
                  <p>
                    <strong>Kids Expenses:</strong>
                  </p>
                  <ul className="list-disc pl-6">
                    {inputs.kidsExpenses.map((expense) => (
                      <li key={expense.id}>
                        {formatCurrency(expense.amount)} per year
                        {expense.startAge &&
                          ` starting at age ${expense.startAge}`}
                        {expense.endAge && ` until age ${expense.endAge}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inputs.hasParentsCare && inputs.parentsCareExpenses && (
                <div>
                  <p>
                    <strong>Parents Care Expenses:</strong>
                  </p>
                  <ul className="list-disc pl-6">
                    {inputs.parentsCareExpenses.map((expense) => (
                      <li key={expense.id}>
                        {formatCurrency(expense.amount)} per year
                        {expense.startAge &&
                          ` starting at age ${expense.startAge}`}
                        {expense.endAge && ` until age ${expense.endAge}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-600">
                These additional expenses are factored into the required net
                worth calculation. The FIRE age ensures your investment returns
                can cover these expenses while maintaining your wealth in real
                terms.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
