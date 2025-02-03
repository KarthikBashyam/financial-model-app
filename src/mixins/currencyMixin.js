import { formatCurrency } from '@/utils/utils';

export const currencyMixin = {
  methods: {
    formatCurrency(value) {
      return formatCurrency(value);
    },
    formatRevenue(value, format) {
      switch (format) {
        case 'Millions':
          return `${(value / 1e6).toFixed(2)}M`;
        case 'Billions':
          return `${(value / 1e9).toFixed(3)}B`;
        default:
          return this.formatCurrency(value);
      }
    },
    formatGrowthRate(value) {
      return `${value.toFixed(1)}`;
    }
  }
};