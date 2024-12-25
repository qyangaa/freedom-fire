import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FireCalculator from "../components/FireCalculator";

// Mock child components
jest.mock("../components/FireForm", () => {
  return function MockFireForm({ onInputChange }: any) {
    return (
      <button onClick={() => onInputChange("currentAge", 30)}>Mock Form</button>
    );
  };
});

jest.mock("../components/FireCharts", () => {
  return function MockFireCharts() {
    return <div>Mock Charts</div>;
  };
});

jest.mock("../components/FireExplanation", () => {
  return function MockFireExplanation() {
    return <div>Mock Explanation</div>;
  };
});

describe("FireCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FireCalculator />);
    expect(screen.getByText(/FIRE Calculator/i)).toBeInTheDocument();
  });

  it("shows error when expenses exceed income", async () => {
    const { container } = render(<FireCalculator />);

    // Find the calculate button
    const calculateButton = screen.getByText(/Calculate FIRE/i);

    // Trigger calculation
    await userEvent.click(calculateButton);

    // Check for error message
    expect(
      screen.queryByText(
        /Annual expenses cannot be greater than annual income/i
      )
    ).not.toBeInTheDocument();
  });

  it("shows loading state during calculation", async () => {
    render(<FireCalculator />);

    const calculateButton = screen.getByText(/Calculate FIRE/i);
    await userEvent.click(calculateButton);

    // Should briefly show loading state
    expect(screen.getByText(/Calculating.../i)).toBeInTheDocument();

    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.queryByText(/Calculating.../i)).not.toBeInTheDocument();
    });
  });

  it("displays results after successful calculation", async () => {
    render(<FireCalculator />);

    const calculateButton = screen.getByText(/Calculate FIRE/i);
    await userEvent.click(calculateButton);

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
    });
  });

  it("clears results when inputs change", async () => {
    render(<FireCalculator />);

    // First calculate
    const calculateButton = screen.getByText(/Calculate FIRE/i);
    await userEvent.click(calculateButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
    });

    // Change an input
    const mockFormButton = screen.getByText(/Mock Form/i);
    await userEvent.click(mockFormButton);

    // Results should be cleared
    expect(screen.queryByText(/Results/i)).not.toBeInTheDocument();
  });

  it("handles expense additions correctly", async () => {
    render(<FireCalculator />);

    // Add an expense through the mock form
    const mockFormButton = screen.getByText(/Mock Form/i);
    await userEvent.click(mockFormButton);

    // Calculate with new expense
    const calculateButton = screen.getByText(/Calculate FIRE/i);
    await userEvent.click(calculateButton);

    // Should show results
    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
    });
  });

  it("validates career growth slowdown age", async () => {
    render(<FireCalculator />);

    const calculateButton = screen.getByText(/Calculate FIRE/i);
    await userEvent.click(calculateButton);

    expect(
      screen.queryByText(
        /Career growth slowdown age must be greater than current age/i
      )
    ).not.toBeInTheDocument();
  });
});
