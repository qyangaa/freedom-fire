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

  const getFutureValueText = () => {
    if (
      futureValue === undefined ||
      inflationRate === undefined ||
      years === undefined
    ) {
      return null;
    }
    const futureAmount = futureValue * Math.pow(1 + inflationRate, years);
    return `(${formatCurrency(futureAmount)} in ${years} years)`;
  };

  const labelContent = (
    <span>
      {label}
      {showTodaysDollar && (
        <span className="text-gray-500 text-sm ml-1">(today's dollars)</span>
      )}
      {getFutureValueText() && (
        <span className="text-gray-500 text-sm ml-1">
          {getFutureValueText()}
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
