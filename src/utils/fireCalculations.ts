import type {
  ExtendedFireInputs,
  FireResults,
  YearlyProjection,
  AdditionalExpense,
} from "../types/fire";

// Convert today's value to nominal (future) value
export const toNominalValue = (
  todayValue: number,
  inflationRate: number,
  years: number
): number => {
  return todayValue * Math.pow(1 + inflationRate, years);
};

// Convert nominal (future) value to today's value
export const toTodayValue = (
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
  inflationRate: number,
  fireAge: number | null
): number => {
  // If we've reached FIRE age, income drops to zero (retirement)
  if (fireAge !== null && targetAge >= fireAge) {
    return 0;
  }

  const years = targetAge - currentAge;
  const yearsGrowing = Math.min(
    targetAge - currentAge,
    slowdownAge - currentAge
  );
  const yearsStagnant = Math.max(0, targetAge - slowdownAge);

  // Calculate income with career growth
  let nominalIncome = baseIncome * Math.pow(1 + careerGrowthRate, yearsGrowing);

  // After slowdown, income only grows with inflation
  if (yearsStagnant > 0) {
    nominalIncome = nominalIncome * Math.pow(1 + inflationRate, yearsStagnant);
  }

  // Apply inflation for all years
  return nominalIncome * Math.pow(1 + inflationRate, years);
};

// Calculate maximum yearly expenses over the projection period
const calculateMaxYearlyExpenses = (
  inputs: ExtendedFireInputs,
  startAge: number,
  endAge: number = 90
): number => {
  let maxExpenses = 0;

  for (let age = startAge; age <= endAge; age++) {
    const baseExpenses = calculateTotalExpensesForAge(
      inputs.annualExpenses,
      age,
      inputs.currentAge,
      inputs.inflationRate,
      []
    );

    const retirementExpenses = calculateTotalExpensesForAge(
      0,
      age,
      inputs.currentAge,
      inputs.inflationRate,
      inputs.additionalRetirementExpenses
    );

    const kidsExpenses = inputs.hasKidsExpenses
      ? calculateTotalExpensesForAge(
          0,
          age,
          inputs.currentAge,
          inputs.inflationRate,
          inputs.kidsExpenses || []
        )
      : 0;

    const parentsCareExpenses = inputs.hasParentsCare
      ? calculateTotalExpensesForAge(
          0,
          age,
          inputs.currentAge,
          inputs.inflationRate,
          inputs.parentsCareExpenses || []
        )
      : 0;

    const totalExpenses =
      baseExpenses + retirementExpenses + kidsExpenses + parentsCareExpenses;
    maxExpenses = Math.max(maxExpenses, totalExpenses);
  }

  return maxExpenses;
};

// Calculate required net worth for a given FIRE age
const calculateRequiredNetWorth = (
  inputs: ExtendedFireInputs,
  fireAge: number
): number => {
  const maxExpenses = calculateMaxYearlyExpenses(inputs, fireAge);
  // Required net worth = max yearly expenses / real return rate × safety margin
  return (maxExpenses / inputs.investmentReturn) * 1.2;
};

// Simulate retirement scenario for a given FIRE age
const simulateRetirement = (
  inputs: ExtendedFireInputs,
  fireAge: number,
  endAge: number = 90
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];
  let nominalNetWorth = inputs.currentSavings;
  const nominalReturnRate = getNominalReturnRate(
    inputs.investmentReturn,
    inputs.inflationRate
  );

  for (let age = inputs.currentAge; age <= endAge; age++) {
    const years = age - inputs.currentAge;

    // Calculate nominal values for this age
    const nominalIncome = calculateIncomeForAge(
      inputs.annualIncome,
      inputs.currentAge,
      age,
      inputs.careerGrowthRate,
      inputs.careerGrowthSlowdownAge,
      inputs.inflationRate,
      fireAge
    );

    // Calculate expenses
    const nominalBaseExpenses = calculateTotalExpensesForAge(
      inputs.annualExpenses,
      age,
      inputs.currentAge,
      inputs.inflationRate,
      []
    );

    const nominalRetirementExpenses = calculateTotalExpensesForAge(
      0,
      age,
      inputs.currentAge,
      inputs.inflationRate,
      inputs.additionalRetirementExpenses
    );

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
      nominalBaseExpenses +
      nominalRetirementExpenses +
      nominalKidsExpenses +
      nominalParentsCareExpenses;

    // Calculate investment returns
    const nominalInvestmentReturns = nominalNetWorth * nominalReturnRate;

    // Calculate savings/withdrawals
    let nominalSavings: number;
    if (age >= fireAge) {
      // In retirement: only withdraw investment returns, preserve principal
      nominalSavings = Math.max(
        -nominalInvestmentReturns,
        -totalNominalExpenses
      );
    } else {
      // Before retirement: save from income
      nominalSavings = calculateAnnualSavings(
        nominalIncome,
        totalNominalExpenses,
        inputs.taxRate
      );
    }

    // Update net worth
    nominalNetWorth =
      nominalNetWorth + nominalInvestmentReturns + nominalSavings;

    // Convert to today's dollars for the projection
    const realNetWorth = toTodayValue(
      nominalNetWorth,
      inputs.inflationRate,
      years
    );

    // Store projection
    projections.push({
      age,
      netWorth: realNetWorth,
      annualExpenses: toTodayValue(
        totalNominalExpenses,
        inputs.inflationRate,
        years
      ),
      annualIncome: toTodayValue(nominalIncome, inputs.inflationRate, years),
      investmentReturns: toTodayValue(
        nominalInvestmentReturns,
        inputs.inflationRate,
        years
      ),
      savings: toTodayValue(nominalSavings, inputs.inflationRate, years),
      baseExpenses: toTodayValue(
        nominalBaseExpenses,
        inputs.inflationRate,
        years
      ),
      additionalRetirementExpenses: toTodayValue(
        nominalRetirementExpenses,
        inputs.inflationRate,
        years
      ),
      kidsExpenses: inputs.hasKidsExpenses
        ? toTodayValue(nominalKidsExpenses, inputs.inflationRate, years)
        : undefined,
      parentsCareExpenses: inputs.hasParentsCare
        ? toTodayValue(nominalParentsCareExpenses, inputs.inflationRate, years)
        : undefined,
    });
  }

  return projections;
};

// Check if retirement is sustainable at a given FIRE age
const isRetirementSustainable = (
  projections: YearlyProjection[],
  fireAge: number,
  requiredNetWorth: number
): boolean => {
  let previousNetWorth = -Infinity;

  for (const proj of projections) {
    if (proj.age === fireAge) {
      // Check if we have enough net worth at retirement
      if (proj.netWorth < requiredNetWorth) {
        return false;
      }
      previousNetWorth = proj.netWorth;
    } else if (proj.age > fireAge) {
      // After retirement, net worth must never decrease in real terms
      if (proj.netWorth < previousNetWorth) {
        return false;
      }
      previousNetWorth = proj.netWorth;
    }
  }

  return true;
};

// Binary search for optimal FIRE age
const findOptimalFireAge = (
  inputs: ExtendedFireInputs,
  minAge: number,
  maxAge: number
): number => {
  while (minAge <= maxAge) {
    const midAge = Math.floor((minAge + maxAge) / 2);
    const requiredNetWorth = calculateRequiredNetWorth(inputs, midAge);
    const projections = simulateRetirement(inputs, midAge);

    if (isRetirementSustainable(projections, midAge, requiredNetWorth)) {
      // Try a lower age
      maxAge = midAge - 1;
    } else {
      // Try a higher age
      minAge = midAge + 1;
    }
  }

  return minAge;
};

export const calculateFireProjections = (
  inputs: ExtendedFireInputs
): FireResults => {
  // Find optimal FIRE age
  const fireAge = findOptimalFireAge(
    inputs,
    inputs.currentAge,
    inputs.currentAge + 50
  );

  // Generate final projections with the optimal FIRE age
  const projections = simulateRetirement(inputs, fireAge);
  const fireProjection = projections.find((p) => p.age === fireAge);

  return {
    fireAge,
    yearsToFire: fireAge - inputs.currentAge,
    finalNetWorth: projections[projections.length - 1].netWorth,
    projectedAnnualExpensesAtFire: fireProjection?.annualExpenses || 0,
    realInvestmentReturn: inputs.investmentReturn,
    yearlyProjections: projections,
  };
};
