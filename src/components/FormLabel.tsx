import Tooltip from "./Tooltip";

interface FormLabelProps {
  htmlFor?: string;
  label: string;
  tooltip?: string;
  className?: string;
  showTodaysDollar?: boolean;
  futureValue?: number;
  inflationRate?: number;
  years?: number;
  showDetailedFutureValue?: boolean;
}

export default function FormLabel({
  htmlFor,
  label,
  tooltip,
  className = "",
  showTodaysDollar = false,
  futureValue,
  inflationRate,
  years,
  showDetailedFutureValue = false,
}: FormLabelProps) {
  const baseClasses = "block text-sm font-medium text-gray-700 mb-1";
  const combinedClasses = `${baseClasses} ${className}`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFutureValueDetails = () => {
    if (
      futureValue === undefined ||
      inflationRate === undefined ||
      years === undefined
    ) {
      return null;
    }

    const futureAmount = futureValue * Math.pow(1 + inflationRate, years);
    const inflationImpact = futureAmount - futureValue;
    const inflationPercentage =
      ((futureAmount - futureValue) / futureValue) * 100;

    if (showDetailedFutureValue) {
      return {
        text: `${formatCurrency(futureAmount)} in ${years} years`,
        tooltip: `
          Today's Value: ${formatCurrency(futureValue)}
          Future Value: ${formatCurrency(futureAmount)}
          Inflation Impact: ${formatCurrency(
            inflationImpact
          )} (+${inflationPercentage.toFixed(1)}%)
          Years: ${years}
          Annual Inflation: ${(inflationRate * 100).toFixed(1)}%
        `.trim(),
      };
    }

    return {
      text: `(${formatCurrency(futureAmount)} in ${years} years)`,
      tooltip: `Includes ${(inflationRate * 100).toFixed(1)}% annual inflation`,
    };
  };

  const futureValueDetails = getFutureValueDetails();
  const labelText = (
    <span>
      {label}
      {showTodaysDollar && (
        <span className="text-gray-500 text-sm ml-1">(today's dollars)</span>
      )}
    </span>
  );

  const labelContent = (
    <span className="flex flex-col">
      <span className="flex items-center">
        {labelText}
        {tooltip && (
          <span className="ml-1 text-gray-400 hover:text-gray-600">ⓘ</span>
        )}
      </span>
      {futureValueDetails && (
        <span className="text-xs text-gray-500 mt-0.5">
          <Tooltip text={futureValueDetails.tooltip}>
            {futureValueDetails.text}
          </Tooltip>
        </span>
      )}
    </span>
  );

  if (tooltip) {
    return (
      <label htmlFor={htmlFor} className={combinedClasses}>
        <Tooltip text={tooltip}>{labelContent}</Tooltip>
      </label>
    );
  }

  return (
    <label htmlFor={htmlFor} className={combinedClasses}>
      {labelContent}
    </label>
  );
}
