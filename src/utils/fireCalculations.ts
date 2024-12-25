import type {
  ExtendedFireInputs,
  FireResults,
  YearlyProjection,
  AdditionalExpense,
} from "../types/fire";

const calculateTotalExpensesForAge = (
  baseExpenses: number,
  age: number,
  additionalExpenses: AdditionalExpense[]
): number => {
  return additionalExpenses.reduce((total, expense) => {
    const isActive =
      age >= expense.startAge && (!expense.endAge || age <= expense.endAge);
    return total + (isActive ? expense.amount : 0);
  }, baseExpenses);
};

const calculateAnnualSavings = (
  income: number,
  expenses: number,
  taxRate: number
): number => {
  const afterTaxIncome = income * (1 - taxRate);
  return afterTaxIncome - expenses;
};

const calculateIncomeForAge = (
  baseIncome: number,
  currentAge: number,
  targetAge: number,
  growthRate: number,
  slowdownAge: number
): number => {
  const yearsGrowing = Math.min(
    targetAge - currentAge,
    slowdownAge - currentAge
  );
  const yearsStagnant = Math.max(0, targetAge - slowdownAge);

  // Apply growth until slowdown age
  let finalIncome = baseIncome * Math.pow(1 + growthRate, yearsGrowing);

  // After slowdown, apply inflation-level growth (assumed at 2%)
  if (yearsStagnant > 0) {
    finalIncome *= Math.pow(1.02, yearsStagnant);
  }

  return finalIncome;
};

export const calculateFireProjections = (
  inputs: ExtendedFireInputs
): FireResults => {
  const projections: YearlyProjection[] = [];
  let fireAge = inputs.currentAge;
  let netWorth = inputs.currentSavings;
  let foundFireAge = false;

  // Calculate real return rate (after inflation)
  const realInvestmentReturn =
    (1 + inputs.investmentReturn) / (1 + inputs.inflationRate) - 1;

  // Project for the next 50 years or until FIRE is achieved
  for (let age = inputs.currentAge; age <= inputs.currentAge + 50; age++) {
    // Calculate income for current age
    const annualIncome = calculateIncomeForAge(
      inputs.annualIncome,
      inputs.currentAge,
      age,
      inputs.careerGrowthRate,
      inputs.careerGrowthSlowdownAge
    );

    // Calculate total expenses including additional expenses
    const baseExpenses = inputs.annualExpenses;
    const retirementExpenses = calculateTotalExpensesForAge(
      0,
      age,
      inputs.additionalRetirementExpenses
    );
    const kidsExpenses = inputs.hasKidsExpenses
      ? calculateTotalExpensesForAge(0, age, inputs.kidsExpenses || [])
      : 0;
    const parentsCareExpenses = inputs.hasParentsCare
      ? calculateTotalExpensesForAge(0, age, inputs.parentsCareExpenses || [])
      : 0;

    const totalExpenses =
      baseExpenses + retirementExpenses + kidsExpenses + parentsCareExpenses;

    // Calculate investment returns
    const investmentReturns = netWorth * realInvestmentReturn;

    // Calculate savings
    const annualSavings = calculateAnnualSavings(
      annualIncome,
      totalExpenses,
      inputs.taxRate
    );

    // Update net worth
    netWorth = netWorth + investmentReturns + annualSavings;

    // Store yearly projection
    projections.push({
      age,
      netWorth,
      annualExpenses: totalExpenses,
      annualIncome,
      investmentReturns,
    });

    // Check if FIRE is achieved (when investment returns cover expenses)
    if (!foundFireAge && investmentReturns >= totalExpenses * 1.1) {
      // 10% buffer for safety
      fireAge = age;
      foundFireAge = true;
    }
  }

  return {
    fireAge,
    yearsToFire: fireAge - inputs.currentAge,
    finalNetWorth: netWorth,
    projectedAnnualExpensesAtFire:
      projections.find((p) => p.age === fireAge)?.annualExpenses || 0,
    realInvestmentReturn,
    yearlyProjections: projections,
  };
};
