<template>
  <div class="intrinsic-value-container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <div class="value-card">
        <p>{{ companyName }}'s Intrinsic Value is</p>
        <h2>USD {{ formatCurrency(intrinsicValue) }} Per Share</h2>
      </div>
      <div class="button-container">
        <button class="watchlist-button" @click="addToWatchlist">
          <i class="bi bi-bookmark-check me-2"></i>
          Save to Watch List
        </button>
      </div>

      <!-- Supporting Calculations Section -->
      <div class="supporting-calculations mt-4">
        <div class="collapsible-header" @click="toggleCalculations">
          <span class="expand-icon" :class="{ 'expanded': isCalculationsVisible }">▶</span>
          <h3>Supporting Calculations</h3>
        </div>
        <div class="collapsible-content" :class="{ 'expanded': isCalculationsVisible }">
          <!-- Filters -->
          <div class="filters d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="text-muted me-2">FY END</span>
              <span class="fw-bold"></span>
            </div>
            <div>
              <span class="text-muted me-2">Sort</span>
              <i class="bi bi-arrow-down-up"></i>
              <span class="text-muted mx-2">Filter</span>
              <i class="bi bi-funnel"></i>
            </div>
            <div>
              <span class="text-muted me-2">CURRENCY: USD</span>
              <select v-model="selectedFormat" class="form-select form-select-sm d-inline-block w-auto">                
                <option value="Millions">Millions</option>
                <option value="Billions">Billions</option>
              </select>
            </div>
          </div>

          <!-- Data Table -->
          <div class="data-table">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>VALUATION</th>
                  <th v-for="year in forecastYears" :key="'header-' + year">{{ year }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EBIT*(1-T)</td>
                  <td v-for="year in forecastYears" :key="'ebit-' + year">{{ formatValue(forecastedEBITCosts[year]) }}
                  </td>
                </tr>
                <tr>
                  <td>D&A</td>
                  <td v-for="year in forecastYears" :key="'da-' + year">{{ formatValue(forecastedDARates[year]) }}</td>
                </tr>
                <tr>
                  <td>Capital Expenditure</td>
                  <td v-for="year in forecastYears" :key="'capex-' + year">{{ formatValue(capExCosts[year]) }}</td>
                </tr>
                <tr>
                  <td>Net Change in Working Capital</td>
                  <td v-for="year in forecastYears" :key="'nwc-' + year">{{ formatValue(forecastedNWCCosts[year]) }}
                  </td>
                </tr>
                <tr>
                  <td>FCFF</td>
                  <td v-for="year in forecastYears" :key="'fcff-' + year">{{ formatValue(forecastedFCFFCosts[year]) }}
                  </td>
                </tr>
                <tr>
                  <td>PV of FCFF</td>
                  <td v-for="year in forecastYears" :key="'pvfcff-' + year">{{ formatValue(presentValueOfFCFFMap[year])
                    }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Non-tabular Values -->
          <div class="non-tabular-values mt-4">
            <div class="value-item">
              <span class="label">Terminal EV:</span>
              <span class="value">{{ formatCurrency(terminalEV) }}</span>
            </div>
            <div class="value-item">
              <span class="label">PV of Terminal EV:</span>
              <span class="value">{{ formatCurrency(presentValueOfTerminalEV) }}</span>
            </div>
            <div class="value-item">
              <span class="label">Intrinsic Enterprise Value:</span>
              <span class="value ">{{ formatCurrency(intrinsicEnterpriseValue) }}</span>
            </div>
            <div class="value-item">
              <span class="label">Intrinsic Equity Value:</span>
              <span class="value">{{ formatCurrency(intrinsicEquityValue) }}</span>
            </div>
            <div class="value-item">
              <span class="label">Intrinsic Value (per share):</span>
              <span class="value">{{ formatCurrency(intrinsicValue) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  data() {
    return {
      intrinsicValue: '',
      loading: true,
      companyId: '',
      companyName: "",
      forecastYears: [],
      forecastedEBITCosts: {},
      forecastedDARates: {},
      capExCosts: {},
      forecastedNWCCosts: {},
      forecastedFCFFCosts: {},
      presentValueOfFCFFMap: {},
      isCalculationsVisible: ref(true),
      terminalEV: 0,
      presentValueOfTerminalEV: 0,
      intrinsicEnterpriseValue: 0,
      intrinsicEquityValue: 0
    };
  },
  async mounted() {
    try {
      // Fetch companyName from sessionStorage
      const stockInfoString = sessionStorage.getItem("selectedStock");
      if (stockInfoString) {
        const stockInfo = JSON.parse(stockInfoString);
        this.companyName = stockInfo.companyName || "Unknown Company";
      } else {
        this.companyName = "Unknown Company";
      }

      // Retrieve the stored assumptions from sessionStorage
      const storedAssumptions = JSON.parse(sessionStorage.getItem('valuationAssumptions')) || {};

      // Retrieve companyId from sessionStorage or another source
      this.companyId = sessionStorage.getItem('companyId') || '';

      // Create a new object with only the fields present in the DTO
      const assumptions = {
        companyId: parseInt(this.companyId),
        forecastDuration: parseInt(sessionStorage.getItem('forecastDuration')) || 5,
        selectedFinalApproach: storedAssumptions.selectedApproach || '',
        costOfCapital: parseFloat(storedAssumptions.costOfCapital) || 0,
        terminalGrowthRate: parseFloat(storedAssumptions.terminalGrowthRate) || 0,
        terminalEVEBITDAMultiple: parseFloat(storedAssumptions.terminalEVEBITDAMultiple) || 0
      };

      // Prepare the request URL and options
      const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/intrinsic/estimate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assumptions)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Intrinsic Value Response:', responseData);

      // Handle the response data as needed
      this.intrinsicValue = responseData.intrinsicValue !== null ? responseData.intrinsicValue : "N/A";

      // Populate the forecast data
      this.forecastYears = this.getYears(responseData.forecastedEBITCosts);
      this.forecastedEBITCosts = responseData.forecastedEBITCosts || {};
      this.forecastedDARates = responseData.forecastedDARates || {};
      this.capExCosts = responseData.capExCosts || {};
      this.forecastedNWCCosts = responseData.forecastedNWCCosts || {};
      this.forecastedFCFFCosts = responseData.forecastedFCFFCosts || {};
      this.presentValueOfFCFFMap = responseData.presentValueOfFCFFMap || {};

      // Populate non-tabular values
      this.terminalEV = responseData.terminalEV || 0;
      this.presentValueOfTerminalEV = responseData.presentValueOfTerminalEV || 0;
      this.intrinsicEnterpriseValue = responseData.intrinsicEnterpriseValue || 0;
      this.intrinsicEquityValue = responseData.intrinsicEquityValue || 0;
    } catch (error) {
      console.error('Error fetching intrinsic value:', error);
      this.intrinsicValue = "Error";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    addToWatchlist() {
      alert(`${this.companyName} has been added to your watchlist.`);
    },
    async downloadExcel() {
      try {
        const companyId = sessionStorage.getItem('companyId') || '';
        const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/intrinsic/download?companyId=${companyId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = `${this.companyName}_Intrinsic_Value.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (error) {
        console.error('Error downloading Excel file:', error);
      }
    },
    formatValue(value) {
      return value !== null ? value : 'N/A';
    },
    toggleCalculations() {
      this.isCalculationsVisible = !this.isCalculationsVisible;
    },
    getYears(data) {
      const allYears = new Set();
      Object.keys(data || {}).forEach(year => allYears.add(year));
      return Array.from(allYears).sort();
    },
    formatCurrency(value) {
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  }
};
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css");
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css");

.intrinsic-value-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
}

.value-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
  text-align: center;
}

.value-card p {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.value-card h2 {
  font-size: 2.5rem;
  color: #343a40;
  margin: 0;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
  /* Add margin between buttons */
}

.watchlist-button,
.download-button {
  background-color: #2d89ef;
  color: white;
  border: none;
  border-radius: 10px;
  /* Increased border radius */
  padding: 15px 25px;
  /* Larger button */
  font-size: 1.2rem;
  /* Larger font size */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.watchlist-button:hover,
.download-button:hover {
  background-color: #2163c7;
}

.supporting-calculations {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.collapsible-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin-bottom: 10px;
}

.collapsible-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #495057;
}

.collapsible-content {
  transition: max-height 0.3s ease-out;
  max-height: 0;
  overflow: hidden;
}

.collapsible-content.expanded {
  max-height: 2000px;
}

.expand-icon {
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.filters {
  font-size: 0.9rem;
}

.data-table {
  margin-top: 20px;
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #dee2e6;
}

.data-table th:first-child,
.data-table td:first-child {
  text-align: left;
}

.data-table th {
  background-color: #e9ecef;
  font-weight: bold;
  color: #495057;
}

.data-table td {
  color: #212529;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #6c757d;
  margin-top: 50px;
}

.non-tabular-values {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.non-tabular-values h4 {
  color: #495057;
  margin-bottom: 15px;
}

.value-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0.75rem;
}


.label {
  font-weight: bold;
  min-width: 250px;
  margin-right: 1rem;
}

.value-item:last-child {
  border-bottom: none;
}

.value-item .label {
  font-weight: bold;
  color: #495057;
}

.value {
  flex-grow: 1;
}

.mt-4 {
  margin-top: 1rem;
}

.value-item .value {
  color: #007bff;
  font-weight: bold;
  text-align: right;
  flex: 0 0 auto;
  min-width: 120px;
}
</style>
