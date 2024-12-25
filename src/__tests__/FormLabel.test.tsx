import { render, screen, fireEvent } from "@testing-library/react";
import FormLabel from "../components/FormLabel";

describe("FormLabel", () => {
  it("renders basic label correctly", () => {
    render(<FormLabel label="Test Label" htmlFor="test" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders tooltip when provided", () => {
    render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        tooltip="This is a tooltip"
      />
    );

    // Tooltip icon should be visible
    const tooltipIcon = screen.getByRole("img", { hidden: true });
    expect(tooltipIcon).toBeInTheDocument();

    // Hover over the tooltip icon to show the tooltip
    fireEvent.mouseEnter(tooltipIcon);
    expect(screen.getByText("This is a tooltip")).toBeInTheDocument();

    // Mouse leave should hide the tooltip
    fireEvent.mouseLeave(tooltipIcon);
    expect(screen.queryByText("This is a tooltip")).not.toBeInTheDocument();
  });

  it("shows today's dollar indicator when specified", () => {
    render(<FormLabel label="Test Label" htmlFor="test" showTodaysDollar />);

    expect(screen.getByText("(today's dollars)")).toBeInTheDocument();
  });

  it("shows future value when provided", () => {
    render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={1000}
        inflationRate={0.03}
        years={10}
      />
    );

    // Hover over the today's dollars text to show future value
    fireEvent.mouseEnter(screen.getByText("(today's dollars)"));
    expect(screen.getByText(/\$1,344 in 10 years/)).toBeInTheDocument();
  });

  it("shows detailed future value breakdown when specified", () => {
    render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={1000}
        inflationRate={0.03}
        years={10}
        showDetailedFutureValue
      />
    );

    // Hover over the today's dollars text
    fireEvent.mouseEnter(screen.getByText("(today's dollars)"));
    expect(screen.getByText(/Equivalent to/)).toBeInTheDocument();
    expect(screen.getByText(/with 3.0% annual inflation/)).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    render(
      <FormLabel label="Test Label" htmlFor="test" className="custom-class" />
    );

    const label = screen.getByText("Test Label").closest("label");
    expect(label).toHaveClass("custom-class");
  });

  it("renders children when provided", () => {
    render(
      <FormLabel label="Test Label" htmlFor="test">
        <span>Child Content</span>
      </FormLabel>
    );

    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("handles undefined optional props gracefully", () => {
    render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={undefined}
        inflationRate={undefined}
        years={undefined}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("(today's dollars)")).toBeInTheDocument();
  });

  it("formats large numbers correctly in future value", () => {
    render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={1000000}
        inflationRate={0.03}
        years={10}
        showDetailedFutureValue
      />
    );

    fireEvent.mouseEnter(screen.getByText("(today's dollars)"));
    expect(screen.getByText(/\$1,343,916/)).toBeInTheDocument();
  });

  it("shows correct inflation impact over different time periods", () => {
    const { rerender } = render(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={1000}
        inflationRate={0.03}
        years={5}
        showDetailedFutureValue
      />
    );

    // Check 5-year impact
    fireEvent.mouseEnter(screen.getByText("(today's dollars)"));
    expect(screen.getByText(/\$1,159/)).toBeInTheDocument();

    // Check 20-year impact
    rerender(
      <FormLabel
        label="Test Label"
        htmlFor="test"
        showTodaysDollar
        futureValue={1000}
        inflationRate={0.03}
        years={20}
        showDetailedFutureValue
      />
    );

    fireEvent.mouseEnter(screen.getByText("(today's dollars)"));
    expect(screen.getByText(/\$1,806/)).toBeInTheDocument();
  });
});
