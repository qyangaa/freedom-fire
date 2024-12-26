// Basic input parameters
export interface FireInputs {
  currentAge: number;
  currentSavings: number;
  annualIncome: number;
  annualExpenses: number;
  investmentReturn: number; // as decimal (e.g., 0.07 for 7%)
  inflationRate: number; // as decimal (e.g., 0.03 for 3%)
  taxRate: number; // as decimal (e.g., 0.25 for 25%)
  careerGrowthRate: number; // as decimal (e.g., 0.03 for 3%)
  careerGrowthSlowdownAge: number;
}

// Optional expenses
export interface AdditionalExpense {
  id: string;
  name: string;
  amount: number;
  startAge: number;
  endAge?: number; // Optional end age
}

// Extended inputs including optional parameters
export interface ExtendedFireInputs {
  currentAge: number;
  currentSavings: number;
  currentLiabilities: number;
  annualIncome: number;
  annualExpenses: number;
  investmentReturn: number;
  inflationRate: number;
  taxRate: number;
  careerGrowthRate: number;
  careerGrowthSlowdownAge: number;

  additionalRetirementExpenses: AdditionalExpense[];
  hasKidsExpenses: boolean;
  kidsExpenses: AdditionalExpense[];
  hasParentsCare: boolean;
  parentsCareExpenses: AdditionalExpense[];
}

// Yearly projection data for charts
export interface YearlyProjection {
  age: number;
  netWorth: number;
  annualExpenses: number;
  annualIncome: number;
  investmentReturns: number;
  savings: number; // Can be negative after retirement (drawing down from investments)
  baseExpenses: number; // Base living expenses
  kidsExpenses?: number; // Optional kids expenses
  parentsCareExpenses?: number; // Optional parents care expenses
  additionalRetirementExpenses?: number; // Optional additional retirement expenses
}

// Final calculation results
export interface FireResults {
  fireAge: number;
  yearsToFire: number;
  finalNetWorth: number;
  projectedAnnualExpensesAtFire: number;
  realInvestmentReturn: number; // After inflation
  yearlyProjections: YearlyProjection[];
}

// Form field validation
export interface FireInputErrors {
  [key: string]: string;
}
