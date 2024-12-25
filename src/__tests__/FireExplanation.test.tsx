import { render, screen } from "@testing-library/react";
import FireExplanation from "../components/FireExplanation";
import type { ExtendedFireInputs, FireResults } from "../types/fire";

describe("FireExplanation", () => {
  const mockInputs: ExtendedFireInputs = {
    currentAge: 25,
    currentSavings: 10000,
    annualIncome: 60000,
    annualExpenses: 40000,
    investmentReturn: 0.07,
    inflationRate: 0.03,
    taxRate: 0.25,
    careerGrowthRate: 0.03,
    careerGrowthSlowdownAge: 45,
    additionalRetirementExpenses: [],
    hasKidsExpenses: false,
    kidsExpenses: [],
    hasParentsCare: false,
    parentsCareExpenses: [],
  };

  const mockResults: FireResults = {
    fireAge: 45,
    yearsToFire: 20,
    finalNetWorth: 2000000,
    projectedAnnualExpensesAtFire: 50000,
    realInvestmentReturn: 0.07,
    yearlyProjections: [
      {
        age: 25,
        netWorth: 10000,
        annualExpenses: 40000,
        annualIncome: 60000,
        investmentReturns: 700,
        savings: 15000,
        baseExpenses: 40000,
      },
      {
        age: 45,
        netWorth: 2000000,
        annualExpenses: 50000,
        annualIncome: 0,
        investmentReturns: 140000,
        savings: -50000,
        baseExpenses: 50000,
      },
    ],
  };

  it("renders basic information section correctly", () => {
    render(<FireExplanation inputs={mockInputs} results={mockResults} />);

    expect(screen.getByText("1. Your Starting Point")).toBeInTheDocument();
    expect(screen.getByText(/Current Age: 25/)).toBeInTheDocument();
    expect(screen.getByText(/Current Savings: \$10,000/)).toBeInTheDocument();
    expect(screen.getByText(/Annual Income: \$60,000/)).toBeInTheDocument();
    expect(screen.getByText(/Annual Expenses: \$40,000/)).toBeInTheDocument();
  });

  it("renders growth rates section correctly", () => {
    render(<FireExplanation inputs={mockInputs} results={mockResults} />);

    expect(
      screen.getByText("2. Growth and Inflation Rates")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Investment Return \(after inflation\): 7.0%/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Inflation Rate: 3.0%/)).toBeInTheDocument();
    expect(
      screen.getByText(/Career Growth Rate \(until age 45\): 3.0%/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Tax Rate: 25.0%/)).toBeInTheDocument();
  });

  it("renders FIRE numbers section correctly", () => {
    render(<FireExplanation inputs={mockInputs} results={mockResults} />);

    expect(screen.getByText("3. Your FIRE Numbers")).toBeInTheDocument();
    expect(screen.getByText(/Years until FIRE: 20/)).toBeInTheDocument();
    expect(screen.getByText(/FIRE Age: 45/)).toBeInTheDocument();
    expect(
      screen.getByText(/In today's dollars: \$50,000/)
    ).toBeInTheDocument();
  });

  it("renders calculation steps section correctly", () => {
    render(<FireExplanation inputs={mockInputs} results={mockResults} />);

    expect(screen.getByText("4. How We Calculate This")).toBeInTheDocument();
    expect(screen.getByText(/Expense Growth:/)).toBeInTheDocument();
    expect(screen.getByText(/Investment Returns:/)).toBeInTheDocument();
    expect(screen.getByText(/Income Growth:/)).toBeInTheDocument();
    expect(screen.getByText(/Savings Rate:/)).toBeInTheDocument();
    expect(screen.getByText(/FIRE Achievement:/)).toBeInTheDocument();
  });

  it("renders additional expenses section when present", () => {
    const inputsWithExpenses: ExtendedFireInputs = {
      ...mockInputs,
      additionalRetirementExpenses: [
        {
          id: "1",
          name: "Travel",
          amount: 10000,
          startAge: 45,
        },
      ],
      hasKidsExpenses: true,
      kidsExpenses: [
        {
          id: "2",
          name: "College Fund",
          amount: 15000,
          startAge: 40,
          endAge: 44,
        },
      ],
    };

    render(
      <FireExplanation inputs={inputsWithExpenses} results={mockResults} />
    );

    expect(
      screen.getByText("5. Impact of Additional Expenses")
    ).toBeInTheDocument();
    expect(screen.getByText(/Travel: \$10,000 per year/)).toBeInTheDocument();
    expect(
      screen.getByText(/College Fund: \$15,000 per year/)
    ).toBeInTheDocument();
  });

  it("does not render additional expenses section when none present", () => {
    render(<FireExplanation inputs={mockInputs} results={mockResults} />);

    expect(
      screen.queryByText("5. Impact of Additional Expenses")
    ).not.toBeInTheDocument();
  });

  it("formats currency values correctly", () => {
    const inputsWithLargeNumbers: ExtendedFireInputs = {
      ...mockInputs,
      currentSavings: 1500000,
      annualIncome: 150000,
    };

    render(
      <FireExplanation inputs={inputsWithLargeNumbers} results={mockResults} />
    );

    expect(
      screen.getByText(/Current Savings: \$1,500,000/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Annual Income: \$150,000/)).toBeInTheDocument();
  });

  it("formats percentage values correctly", () => {
    const inputsWithDecimalRates: ExtendedFireInputs = {
      ...mockInputs,
      investmentReturn: 0.0725,
      inflationRate: 0.0275,
    };

    render(
      <FireExplanation inputs={inputsWithDecimalRates} results={mockResults} />
    );

    expect(
      screen.getByText(/Investment Return \(after inflation\): 7.3%/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Inflation Rate: 2.8%/)).toBeInTheDocument();
  });
});
