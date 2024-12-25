import type {
  ExtendedFireInputs,
  FireResults,
  YearlyProjection,
  AdditionalExpense,
} from "../types/fire";

// Convert today's value to nominal (future) value
const toNominalValue = (
  todayValue: number,
  inflationRate: number,
  years: number
): number => {
  return todayValue * Math.pow(1 + inflationRate, years);
};

// Convert nominal (future) value to today's value
const toTodayValue = (
  nominalValue: number,
  inflationRate: number,
  years: number
): number => {
  return nominalValue / Math.pow(1 + inflationRate, years);
};

// Calculate nominal return rate from real return rate
const getNominalReturnRate = (
  realReturn: number,
  inflationRate: number
): number => {
  return (1 + realReturn) * (1 + inflationRate) - 1;
};

const calculateTotalExpensesForAge = (
  baseExpenses: number,
  age: number,
  currentAge: number,
  inflationRate: number,
  additionalExpenses: AdditionalExpense[]
): number => {
  // Convert base expenses to nominal value for this age
  const years = age - currentAge;
  const nominalBaseExpenses = toNominalValue(
    baseExpenses,
    inflationRate,
    years
  );

  // Calculate additional expenses in nominal terms
  const nominalAdditionalExpenses = additionalExpenses.reduce(
    (total, expense) => {
      const isActive =
        age >= expense.startAge && (!expense.endAge || age <= expense.endAge);
      if (!isActive) return total;

      // Convert expense amount to nominal value
      const nominalAmount = toNominalValue(
        expense.amount,
        inflationRate,
        years
      );
      return total + nominalAmount;
    },
    0
  );

  return nominalBaseExpenses + nominalAdditionalExpenses;
};

const calculateAnnualSavings = (
  nominalIncome: number,
  nominalExpenses: number,
  taxRate: number
): number => {
  const afterTaxIncome = nominalIncome * (1 - taxRate);
  return afterTaxIncome - nominalExpenses;
};

const calculateIncomeForAge = (
  baseIncome: number,
  currentAge: number,
  targetAge: number,
  careerGrowthRate: number,
  slowdownAge: number,
  inflationRate: number
): number => {
  const years = targetAge - currentAge;
  const yearsGrowing = Math.min(
    targetAge - currentAge,
    slowdownAge - currentAge
  );
  const yearsStagnant = Math.max(0, targetAge - slowdownAge);

  // Calculate real career growth (adjusted for inflation)
  const realCareerGrowth = (1 + careerGrowthRate) / (1 + inflationRate) - 1;

  // Calculate income growth in real terms
  let realIncome = baseIncome * Math.pow(1 + realCareerGrowth, yearsGrowing);

  // After slowdown, income just keeps pace with inflation (no real growth)
  if (yearsStagnant > 0) {
    realIncome = realIncome; // No additional real growth
  }

  // Convert to nominal value for the target age
  return toNominalValue(realIncome, inflationRate, years);
};

export const calculateFireProjections = (
  inputs: ExtendedFireInputs
): FireResults => {
  const projections: YearlyProjection[] = [];
  let fireAge = inputs.currentAge;
  let nominalNetWorth = inputs.currentSavings;
  let foundFireAge = false;

  // Calculate nominal investment return rate
  const nominalReturnRate = getNominalReturnRate(
    inputs.investmentReturn,
    inputs.inflationRate
  );

  // Project for the next 50 years or until FIRE is achieved
  for (let age = inputs.currentAge; age <= inputs.currentAge + 50; age++) {
    const years = age - inputs.currentAge;

    // Calculate nominal values for this age
    const nominalIncome = calculateIncomeForAge(
      inputs.annualIncome,
      inputs.currentAge,
      age,
      inputs.careerGrowthRate,
      inputs.careerGrowthSlowdownAge,
      inputs.inflationRate
    );

    const nominalExpenses = calculateTotalExpensesForAge(
      inputs.annualExpenses,
      age,
      inputs.currentAge,
      inputs.inflationRate,
      inputs.additionalRetirementExpenses
    );

    // Add kids and parents expenses if enabled
    const nominalKidsExpenses = inputs.hasKidsExpenses
      ? calculateTotalExpensesForAge(
          0,
          age,
          inputs.currentAge,
          inputs.inflationRate,
          inputs.kidsExpenses || []
        )
      : 0;

    const nominalParentsCareExpenses = inputs.hasParentsCare
      ? calculateTotalExpensesForAge(
          0,
          age,
          inputs.currentAge,
          inputs.inflationRate,
          inputs.parentsCareExpenses || []
        )
      : 0;

    const totalNominalExpenses =
      nominalExpenses + nominalKidsExpenses + nominalParentsCareExpenses;

    // Calculate investment returns in nominal terms
    const nominalInvestmentReturns = nominalNetWorth * nominalReturnRate;

    // Calculate savings in nominal terms
    const nominalSavings = calculateAnnualSavings(
      nominalIncome,
      totalNominalExpenses,
      inputs.taxRate
    );

    // Update nominal net worth
    nominalNetWorth =
      nominalNetWorth + nominalInvestmentReturns + nominalSavings;

    // Convert values back to today's dollars for display and comparison
    const realNetWorth = toTodayValue(
      nominalNetWorth,
      inputs.inflationRate,
      years
    );
    const realExpenses = toTodayValue(
      totalNominalExpenses,
      inputs.inflationRate,
      years
    );
    const realIncome = toTodayValue(nominalIncome, inputs.inflationRate, years);
    const realInvestmentReturns = toTodayValue(
      nominalInvestmentReturns,
      inputs.inflationRate,
      years
    );

    // Store yearly projection in today's dollars
    projections.push({
      age,
      netWorth: realNetWorth,
      annualExpenses: realExpenses,
      annualIncome: realIncome,
      investmentReturns: realInvestmentReturns,
    });

    // Check if FIRE is achieved (using real values)
    if (!foundFireAge && realInvestmentReturns >= realExpenses * 1.1) {
      fireAge = age;
      foundFireAge = true;
    }
  }

  return {
    fireAge,
    yearsToFire: fireAge - inputs.currentAge,
    finalNetWorth: projections[projections.length - 1].netWorth,
    projectedAnnualExpensesAtFire:
      projections.find((p) => p.age === fireAge)?.annualExpenses || 0,
    realInvestmentReturn: inputs.investmentReturn, // This is already a real return rate
    yearlyProjections: projections,
  };
};
