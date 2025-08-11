import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";

/**
 * This part of the code creates reusable components for formatted values
 * Automatically applies user settings to display currency, dates, and numbers
 */

interface FormattedCurrencyProps {
  value: number | null | undefined;
  className?: string;
}

export function FormattedCurrency({ value, className = "" }: FormattedCurrencyProps) {
  const { formatCurrency } = useSettingsIntegration();
  return <span className={className}>{formatCurrency(value)}</span>;
}

interface FormattedDateProps {
  value: Date | string | null | undefined;
  className?: string;
}

export function FormattedDate({ value, className = "" }: FormattedDateProps) {
  const { formatDate } = useSettingsIntegration();
  return <span className={className}>{formatDate(value)}</span>;
}

interface FormattedNumberProps {
  value: number | null | undefined;
  className?: string;
}

export function FormattedNumber({ value, className = "" }: FormattedNumberProps) {
  const { formatNumber } = useSettingsIntegration();
  return <span className={className}>{formatNumber(value)}</span>;
}

interface FormattedPercentageProps {
  value: number | null | undefined;
  className?: string;
}

export function FormattedPercentage({ value, className = "" }: FormattedPercentageProps) {
  const { formatPercentage } = useSettingsIntegration();
  return <span className={className}>{formatPercentage(value)}</span>;
}
