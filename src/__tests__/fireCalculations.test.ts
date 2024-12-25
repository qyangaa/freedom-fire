import {
  calculateFireProjections,
  toNominalValue,
  toTodayValue,
} from "../utils/fireCalculations";
import type { ExtendedFireInputs } from "../types/fire";

describe("Fire Calculations", () => {
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

  describe("Value Conversions", () => {
    it("converts today's value to nominal value correctly", () => {
      const todayValue = 1000;
      const inflationRate = 0.03;
      const years = 10;

      const nominalValue = toNominalValue(todayValue, inflationRate, years);
      expect(nominalValue).toBeCloseTo(1343.92, 2);
    });

    it("converts nominal value to today's value correctly", () => {
      const nominalValue = 1343.92;
      const inflationRate = 0.03;
      const years = 10;

      const todayValue = toTodayValue(nominalValue, inflationRate, years);
      expect(todayValue).toBeCloseTo(1000, 2);
    });

    it("handles zero years correctly", () => {
      const value = 1000;
      const inflationRate = 0.03;
      const years = 0;

      expect(toNominalValue(value, inflationRate, years)).toBe(value);
      expect(toTodayValue(value, inflationRate, years)).toBe(value);
    });
  });

  describe("FIRE Projections", () => {
    it("calculates basic FIRE projections correctly", () => {
      const results = calculateFireProjections(mockInputs);

      expect(results.fireAge).toBeGreaterThan(mockInputs.currentAge);
      expect(results.yearlyProjections.length).toBeGreaterThan(0);
      expect(results.finalNetWorth).toBeGreaterThan(mockInputs.currentSavings);
    });

    it("handles zero current savings", () => {
      const results = calculateFireProjections({
        ...mockInputs,
        currentSavings: 0,
      });

      expect(results.fireAge).toBeGreaterThan(mockInputs.currentAge);
      expect(results.yearlyProjections[0].netWorth).toBe(0);
    });

    it("accounts for additional retirement expenses", () => {
      const resultsWithExpenses = calculateFireProjections({
        ...mockInputs,
        additionalRetirementExpenses: [
          {
            id: "test",
            name: "Test Expense",
            amount: 10000,
            startAge: 65,
          },
        ],
      });

      const baseResults = calculateFireProjections(mockInputs);

      expect(resultsWithExpenses.fireAge).toBeGreaterThan(baseResults.fireAge);
    });

    it("handles kids expenses correctly", () => {
      const resultsWithKids = calculateFireProjections({
        ...mockInputs,
        hasKidsExpenses: true,
        kidsExpenses: [
          {
            id: "kid1",
            name: "Child 1",
            amount: 10000,
            startAge: 30,
            endAge: 48,
          },
        ],
      });

      expect(resultsWithKids.fireAge).toBeGreaterThan(mockInputs.currentAge);
      expect(
        resultsWithKids.yearlyProjections.find((p) => p.age === 30)
          ?.kidsExpenses
      ).toBeDefined();
    });

    it("handles parents care expenses correctly", () => {
      const resultsWithParents = calculateFireProjections({
        ...mockInputs,
        hasParentsCare: true,
        parentsCareExpenses: [
          {
            id: "parent1",
            name: "Parent 1",
            amount: 12000,
            startAge: 55,
            endAge: 65,
          },
        ],
      });

      expect(resultsWithParents.fireAge).toBeGreaterThan(mockInputs.currentAge);
      expect(
        resultsWithParents.yearlyProjections.find((p) => p.age === 55)
          ?.parentsCareExpenses
      ).toBeDefined();
    });

    it("calculates investment returns correctly", () => {
      const results = calculateFireProjections(mockInputs);
      const firstYear = results.yearlyProjections[0];

      // First year investment returns should be currentSavings * investmentReturn
      expect(firstYear.investmentReturns).toBeCloseTo(
        mockInputs.currentSavings * mockInputs.investmentReturn,
        2
      );
    });

    it("adjusts income for career growth correctly", () => {
      const results = calculateFireProjections(mockInputs);
      const incomeAtSlowdown = results.yearlyProjections.find(
        (p) => p.age === mockInputs.careerGrowthSlowdownAge
      )?.annualIncome;

      expect(incomeAtSlowdown).toBeGreaterThan(mockInputs.annualIncome);
    });

    it("stops income after FIRE age", () => {
      const results = calculateFireProjections(mockInputs);
      const incomeAfterFire = results.yearlyProjections.find(
        (p) => p.age === results.fireAge + 1
      )?.annualIncome;

      expect(incomeAfterFire).toBe(0);
    });

    it("maintains expense purchasing power with inflation", () => {
      const results = calculateFireProjections(mockInputs);
      const firstYear = results.yearlyProjections[0];
      const lastYear =
        results.yearlyProjections[results.yearlyProjections.length - 1];

      // Real (inflation-adjusted) expenses should be roughly the same
      expect(firstYear.annualExpenses).toBeCloseTo(lastYear.annualExpenses, 0);
    });
  });
});
