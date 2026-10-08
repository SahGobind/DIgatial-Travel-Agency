/**
 * Format currency amounts in NPR or USD
 */
export const formatCurrency = (amount, currency = 'NPR') => {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency === 'NPR' ? 'NPR' : 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format standard readable dates
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
