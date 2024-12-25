import type { ExtendedFireInputs, FireResults } from "../types/fire";
import { toNominalValue, toTodayValue } from "../utils/fireCalculations";

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
              These are your baseline numbers in today's dollars.
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
          <h3 className="text-xl font-semibold mb-3">3. Your FIRE Numbers</h3>
          <div className="pl-4 space-y-2">
            <p>• Years until FIRE: {yearsToFire}</p>
            <p>• FIRE Age: {results.fireAge}</p>
            <p>• Annual Expenses at FIRE:</p>
            <div className="pl-4">
              <p>
                - In today's dollars:{" "}
                {formatCurrency(results.projectedAnnualExpensesAtFire)}
              </p>
              <p>
                - In future dollars: {formatCurrency(nominalExpensesAtFire)}
              </p>
            </div>
            <p>• Required Net Worth at FIRE:</p>
            <div className="pl-4">
              <p>
                - In today's dollars:{" "}
                {formatCurrency(fireProjection?.netWorth || 0)}
              </p>
              <p>
                - In future dollars: {formatCurrency(nominalNetWorthAtFire)}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              FIRE is achieved when your investment returns can cover your
              annual expenses with a 10% safety margin.
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
              1. <strong>Expense Growth:</strong> Your annual expenses of{" "}
              {formatCurrency(inputs.annualExpenses)} grow with inflation at{" "}
              {formatPercentage(inputs.inflationRate)} per year.
            </p>

            <p>
              2. <strong>Investment Returns:</strong> Your investments grow at a
              real rate of {formatPercentage(inputs.investmentReturn)} after
              inflation. The nominal rate is{" "}
              {formatPercentage(
                (1 + inputs.investmentReturn) * (1 + inputs.inflationRate) - 1
              )}
              .
            </p>

            <p>
              3. <strong>Income Growth:</strong> Your income of{" "}
              {formatCurrency(inputs.annualIncome)}:
            </p>
            <div className="pl-4">
              <p>
                - Grows at {formatPercentage(inputs.careerGrowthRate)} plus
                inflation until age {inputs.careerGrowthSlowdownAge}
              </p>
              <p>
                - After that, grows only with inflation to maintain purchasing
                power
              </p>
            </div>

            <p>
              4. <strong>Savings Rate:</strong> Each year, we calculate:
            </p>
            <div className="pl-4">
              <p>
                - After-tax income: Income × (1 -{" "}
                {formatPercentage(inputs.taxRate)})
              </p>
              <p>- Annual savings: After-tax income - Annual expenses</p>
              <p>- These savings are added to your investments</p>
            </div>

            <p>
              5. <strong>FIRE Achievement:</strong> You reach FIRE when:
            </p>
            <div className="pl-4">
              <p>- Annual investment returns ≥ Annual expenses × 1.1</p>
              <p>- The 1.1 multiplier adds a 10% safety margin</p>
              <p>- All comparisons are made in real (today's) dollars</p>
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
                        {expense.name}: {formatCurrency(expense.amount)} per
                        year
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
                        {expense.name}: {formatCurrency(expense.amount)} per
                        year
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
                        {expense.name}: {formatCurrency(expense.amount)} per
                        year
                        {expense.startAge &&
                          ` starting at age ${expense.startAge}`}
                        {expense.endAge && ` until age ${expense.endAge}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-600">
                All additional expenses are adjusted for inflation each year to
                maintain purchasing power.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
