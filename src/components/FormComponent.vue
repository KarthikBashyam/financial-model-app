<template>
  <div>
    <header>
      <div class="header-content">
        <h1 class="pi-symbol">&#8508;</h1>
        <button class="download-button" @click="downloadExcel">
          <i class="fas fa-file-excel"></i> Download Excel
        </button>
      </div>
    </header>

    <div class="main-content">
    <div class="container">
        <h2>Statement Of Income</h2>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Item</th>
              <th v-for="year in statementOfIncomeUniqueYears" :key="year">{{ year }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in statementOfIncomeGroups" :key="group.groupName">
              <tr class="group-row">
                <td :colspan="statementOfIncomeUniqueYears.length + 1" class="group-name">{{ group.groupName }}</td>
              </tr>
              <tr v-for="item in group.items" :key="item.itemName">
                <td class="item-name">{{ item.itemName }}</td>
                <td v-for="year in statementOfIncomeUniqueYears" :key="year" class="amount-cell">
                  {{ formatAmount(item.values[year]) || '-' }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="container">
        <h2>Balance Sheet</h2>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Item</th>
              <th v-for="year in balanceSheetUniqueYears" :key="year">{{ year }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in balanceSheetGroups" :key="group.groupName">
              <tr class="group-row">
                <td :colspan="balanceSheetUniqueYears.length + 1" class="group-name">{{ group.groupName }}</td>
              </tr>
              <tr v-for="item in group.items" :key="item.itemName">
                <td class="item-name">{{ item.itemName }}</td>
                <td v-for="year in balanceSheetUniqueYears" :key="year" class="amount-cell">
                  {{ formatAmount(item.values[year]) || '-' }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="container">
        <h2>Cash Flow Statements</h2>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Item</th>
              <th v-for="year in cashFlowUniqueYears" :key="year">{{ year }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in cashFlowGroups" :key="group.groupName">
              <tr class="group-row">
                <td :colspan="cashFlowUniqueYears.length + 1" class="group-name">{{ group.groupName }}</td>
              </tr>
              <tr v-for="item in group.items" :key="item.itemName">
                <td class="item-name">{{ item.itemName }}</td>
                <td v-for="year in cashFlowUniqueYears" :key="year" class="amount-cell">
                  {{ formatAmount(item.values[year]) || '-' }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      balanceSheetUniqueYears: [],
      cashFlowUniqueYears: [],
      statementOfIncomeUniqueYears: [],
      balanceSheetGroups: [],
      cashFlowGroups: [],
      statementOfIncomeGroups: []
    };
  },
  created() {
    this.fetchCombinedFinancialStatementData();
  },
  methods: {
    async fetchCombinedFinancialStatementData() {
      try {
        const response = await fetch('http://localhost:8080/api/balance-sheet/standard');
        const data = await response.json();
        console.log('Fetched data:', data); // Debugging step
        this.balanceSheetUniqueYears = data.balanceSheetUniqueYears;
        this.cashFlowUniqueYears = data.cashFlowUniqueYears;
        this.statementOfIncomeUniqueYears = data.statementOfIncomeUniqueYears;
        this.balanceSheetGroups = data.balanceSheetGroups;
        this.cashFlowGroups = data.cashFlowGroups;
        this.statementOfIncomeGroups = data.statementOfIncomeGroups;
      } catch (error) {
        console.error('Error fetching financial statement data:', error);
      }
    },
    formatAmount(amount) {
      if (amount == null) return '-';
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    downloadExcel() {
      // Implement the download functionality
    }
  }
};
</script>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background-color: #f4f6f8;
  margin: 0;
  padding: 0;
}

header {
  background-color: #003366;
  color: #ffffff;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.download-button {
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.download-button:hover {
  background-color: #005bb5;
}

.main-content {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: #003366;
  margin-bottom: 10px;
  border-bottom: 2px solid #003366;
  padding-bottom: 5px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 14px;
}

.styled-table thead tr {
  background-color: #003366;
  color: #ffffff;
  text-align: left;
}

.styled-table th, .styled-table td {
  padding: 8px 10px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 1px solid #003366;
}

.styled-table tbody tr:hover {
  background-color: #e0e7ff;
}

.group-name {
  font-weight: bold;
  text-align: left;
  background-color: #cce0ff;
  font-size: 16px;
  padding: 8px;
  border-left: 4px solid #003366;
}

.item-name {
  text-align: left;
  font-size: 14px;
  padding: 8px;
}

.amount-cell {
  text-align: right;
  font-size: 14px;
  padding: 8px;
  white-space: nowrap;
  color: #003366;
}

.amount-cell::before {
  content: '$ ';
}

.negative-value {
  color: #d9534f;
}

.pi-symbol {
  font-size: 50px;
}
</style>
