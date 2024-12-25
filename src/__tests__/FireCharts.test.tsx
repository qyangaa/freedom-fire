import { render, screen } from "@testing-library/react";
import FireCharts from "../components/FireCharts";
import type { YearlyProjection } from "../types/fire";

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock("chartjs-plugin-annotation", () => ({}));

jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="mock-chart">Mock Chart</div>,
}));

describe("FireCharts", () => {
  const mockProjections: YearlyProjection[] = [
    {
      age: 25,
      netWorth: 10000,
      annualExpenses: 40000,
      annualIncome: 60000,
      investmentReturns: 700,
      savings: 15000,
      baseExpenses: 35000,
      kidsExpenses: 0,
      parentsCareExpenses: 0,
      additionalRetirementExpenses: 5000,
    },
    {
      age: 26,
      netWorth: 27000,
      annualExpenses: 41200,
      annualIncome: 61800,
      investmentReturns: 1890,
      savings: 15450,
      baseExpenses: 36050,
      kidsExpenses: 0,
      parentsCareExpenses: 0,
      additionalRetirementExpenses: 5150,
    },
  ];

  it("renders both charts", () => {
    render(
      <FireCharts
        projections={mockProjections}
        fireAge={65}
        inflationRate={0.03}
      />
    );

    const charts = screen.getAllByTestId("mock-chart");
    expect(charts).toHaveLength(2);
  });

  it("displays chart descriptions", () => {
    render(
      <FireCharts
        projections={mockProjections}
        fireAge={65}
        inflationRate={0.03}
      />
    );

    expect(
      screen.getAllByText(/All values are adjusted for inflation/i)
    ).toHaveLength(2);
  });

  it("renders with empty projections", () => {
    render(<FireCharts projections={[]} fireAge={65} inflationRate={0.03} />);

    const charts = screen.getAllByTestId("mock-chart");
    expect(charts).toHaveLength(2);
  });

  it("handles undefined optional expense values", () => {
    const projectionsWithoutOptional: YearlyProjection[] = [
      {
        age: 25,
        netWorth: 10000,
        annualExpenses: 40000,
        annualIncome: 60000,
        investmentReturns: 700,
        savings: 15000,
        baseExpenses: 35000,
      },
    ];

    render(
      <FireCharts
        projections={projectionsWithoutOptional}
        fireAge={65}
        inflationRate={0.03}
      />
    );

    const charts = screen.getAllByTestId("mock-chart");
    expect(charts).toHaveLength(2);
  });
});
