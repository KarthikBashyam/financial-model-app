export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
      return '$0.0'; // Handle invalid values
  }

  // Convert to number and apply rounding (HALF_UP equivalent)
  const roundedValue = Math.round(value * 10) / 10;

  // Format the number with exactly one decimal place
  const formattedNumber = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
  }).format(roundedValue);

  return `$${formattedNumber}`; // Add $ manually
}