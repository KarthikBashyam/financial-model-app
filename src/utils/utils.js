export function formatCurrency(value) {
    const formattedNumber = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits:2
    }).format(value);
  
    return `$${formattedNumber}`; // Add $ manually
  }
  