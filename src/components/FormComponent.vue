  <template>
    <div class="container">
      <h1>Balance Sheet</h1>
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
      <h1>Cash Flow Statements</h1>
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
  </template>

  <script>
  export default {
    data() {
      return {
        balanceSheetUniqueYears: [],
        cashFlowUniqueYears: [],
        balanceSheetGroups: [],
        cashFlowGroups: []
      };
    },
    created() {
      this.fetchCombinedFinancialStatementData();
    },
    methods: {
      async fetchCombinedFinancialStatementData() {
        try {
          const response = await fetch('http://localhost:8080/api/balance-sheet');
          const data = await response.json();
          console.log('Fetched data:', data); // Debugging step
          this.balanceSheetUniqueYears = data.balanceSheetUniqueYears;
          this.cashFlowUniqueYears = data.cashFlowUniqueYears;
          this.balanceSheetGroups = data.balanceSheetGroups;
          this.cashFlowGroups = data.cashFlowGroups;
        } catch (error) {
          console.error('Error fetching financial statement data:', error);
        }
      },
      formatAmount(amount) {
        if (amount == null) return '-';
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    },
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
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: #003366;
  margin-bottom: 20px;
  border-bottom: 2px solid #003366;
  padding-bottom: 10px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 16px;
}

.styled-table thead tr {
  background-color: #003366;
  color: #ffffff;
  text-align: left;
}

.styled-table th, .styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #003366;
}

.styled-table tbody tr:hover {
  background-color: #e0e7ff;
}

.group-name {
  font-weight: bold;
  text-align: left;
  background-color: #cce0ff;
  font-size: 18px;
  padding: 10px;
  border-left: 4px solid #003366;
}

.item-name {
  text-align: left;
  font-size: 16px;
  padding: 10px;
}

.amount-cell {
  text-align: right;
  font-size: 16px;
  padding: 10px;
  white-space: nowrap;
  color: #003366;
}

.amount-cell::before {
  content: '$ ';
}

.negative-value {
  color: #d9534f;
}

</style>
