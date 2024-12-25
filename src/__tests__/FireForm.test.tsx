import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FireForm from "../components/FireForm";
import type { ExtendedFireInputs } from "../types/fire";

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

describe("FireForm", () => {
  const mockOnInputChange = jest.fn();
  const mockOnAddExpense = jest.fn();
  const mockOnRemoveExpense = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders basic information fields correctly", () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    // Check if basic fields are rendered
    expect(screen.getByLabelText(/Current Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Savings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Expenses/i)).toBeInTheDocument();
  });

  it("renders rate inputs with correct percentage values", () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    // Check if rate inputs show correct percentage values
    expect(screen.getByLabelText(/Investment Return Rate/i)).toHaveValue(7);
    expect(screen.getByLabelText(/Inflation Rate/i)).toHaveValue(3);
    expect(screen.getByLabelText(/Tax Rate/i)).toHaveValue(25);
    expect(screen.getByLabelText(/Career Growth Rate/i)).toHaveValue(3);
  });

  it("handles basic input changes correctly", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const currentAgeInput = screen.getByLabelText(/Current Age/i);
    await userEvent.clear(currentAgeInput);
    await userEvent.type(currentAgeInput, "30");

    expect(mockOnInputChange).toHaveBeenCalledWith("currentAge", 30);
  });

  it("handles percentage input changes correctly", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const investmentReturnInput = screen.getByLabelText(
      /Investment Return Rate/i
    );
    await userEvent.clear(investmentReturnInput);
    await userEvent.type(investmentReturnInput, "8");

    expect(mockOnInputChange).toHaveBeenCalledWith("investmentReturn", 0.08);
  });

  it("toggles kids expenses section correctly", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const kidsToggle = screen.getByLabelText(/Include Kids Expenses/i);
    await userEvent.click(kidsToggle);

    expect(mockOnInputChange).toHaveBeenCalledWith("hasKidsExpenses", true);
  });

  it("adds retirement expense correctly", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const addButton = screen.getByRole("button", { name: /Add Expense/i });
    await userEvent.click(addButton);

    expect(mockOnAddExpense).toHaveBeenCalledWith(
      "retirement",
      expect.objectContaining({
        name: "",
        amount: 0,
        startAge: mockInputs.currentAge,
      })
    );
  });

  it("removes retirement expense correctly", async () => {
    const inputsWithExpense = {
      ...mockInputs,
      additionalRetirementExpenses: [
        {
          id: "test-id",
          name: "Test Expense",
          amount: 1000,
          startAge: 65,
        },
      ],
    };

    render(
      <FireForm
        inputs={inputsWithExpense}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const removeButton = screen.getByRole("button", {
      name: /Remove Expense/i,
    });
    await userEvent.click(removeButton);

    expect(mockOnRemoveExpense).toHaveBeenCalledWith("retirement", "test-id");
  });

  it("updates expense fields correctly", async () => {
    const inputsWithExpense = {
      ...mockInputs,
      additionalRetirementExpenses: [
        {
          id: "test-id",
          name: "Test Expense",
          amount: 1000,
          startAge: 65,
        },
      ],
    };

    render(
      <FireForm
        inputs={inputsWithExpense}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const nameInput = screen.getByDisplayValue("Test Expense");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Expense");

    expect(mockOnAddExpense).toHaveBeenCalledWith(
      "retirement",
      expect.objectContaining({
        id: "test-id",
        name: "Updated Expense",
        amount: 1000,
        startAge: 65,
      })
    );
  });

  it("validates input ranges", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const investmentReturnInput = screen.getByLabelText(
      /Investment Return Rate/i
    );

    // Test min value
    await userEvent.clear(investmentReturnInput);
    await userEvent.type(investmentReturnInput, "-3");
    expect(investmentReturnInput).toHaveValue(-2);

    // Test max value
    await userEvent.clear(investmentReturnInput);
    await userEvent.type(investmentReturnInput, "15");
    expect(investmentReturnInput).toHaveValue(12);
  });

  it("handles parents care expenses correctly", async () => {
    render(
      <FireForm
        inputs={mockInputs}
        onInputChange={mockOnInputChange}
        onAddExpense={mockOnAddExpense}
        onRemoveExpense={mockOnRemoveExpense}
      />
    );

    const parentsToggle = screen.getByLabelText(
      /Include Parents Care Expenses/i
    );
    await userEvent.click(parentsToggle);

    expect(mockOnInputChange).toHaveBeenCalledWith("hasParentsCare", true);
  });
});
