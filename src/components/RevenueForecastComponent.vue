<template>
  <div class="revenue-forecast">

    <div class="table-container">
      <div class="header">
        <h4>{{ companyHeader }}'s Historical Revenue and Growth (%)</h4>
        <div class="relative">
          <select v-model="selectedFormat" id="currency"
            class="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
            <option value="USD">USD</option>
            <option value="Millions">Millions</option>
            <option value="Billions">Billions</option>
          </select>
        </div>
      </div>
      <div class="revenue-table">
        <table>
          <thead class="bg-body">
            <tr class="year-row">
              <th>Year</th>
              <th v-for="year in historicalData.years" :key="'year-' + year">{{ year }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Revenue Row -->
            <tr>
              <td>Revenue</td>
              <td v-for="(revenue, index) in historicalData.revenues" :key="'revenue-' + index">
                {{ formatRevenue(revenue, selectedFormat) }}
              </td>
            </tr>
            <!-- Revenue Growth Row -->
            <tr>
              <td>Revenue Growth</td>
              <td v-for="(growth, index) in historicalData.growthRates" :key="'growth-' + index">
                {{ formatGrowthRate(growth) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>
    <div class="table-container">
      <div class="forecast-assumptions">
        <div class="header">
          <h4>Input Your Assumptions for Revenue Growth</h4>
        </div>


        <div class="growth-type-container">
          <div class="growth-type">
            <label><b>Type of Growth</b></label>
            <div class="growth-buttons">
              <button :class="{ active: selectedGrowthType === 'constant' }" @click="changeGrowthType('constant')"
                class="btn btn-secondary btn-radios" >Constant</button>
              <button :class="{ active: selectedGrowthType === 'gradient' }" @click="changeGrowthType('gradient')"
                class="btn btn-secondary btn-radio">Gradient</button>
              <button :class="{ active: selectedGrowthType === 'staged' }" @click="changeGrowthType('staged')"
                class="btn btn-secondary btn-radio">Staged</button>
            </div>

            <!-- Constant Growth -->
            <div v-if="selectedGrowthType === 'constant'" class="form-row mt-20" id="constantRow"
              style="display: flex;">
              <div class="form-floating col-md-3">
                <input type="text" v-model="inputGrowthRate" min="0" max="100" class="form-control flatAllow" />
                <label for="grownthRate">Input Growth Rate</label>
                <span class="yRateTag">%</span>
                <div class="invalid-feedback growthRateErr" style="display: none;"></div>
              </div>
            </div>
            <!-- Gradient -->
            <div v-if="selectedGrowthType === 'gradient'">
              <div class="row mt-20 g-4">
                <div class="col-md-3">
                  <div class="form-floating">
                    <input type="text" id="startYearRate" name="startYearRate" v-model="gradientStart"
                      class="form-control floatAllow" value="16">
                    <label for="startYearRate">Beginning Year Rate</label>
                    <span class="yRateTag">%</span>
                    <span class="form-span">Year: {{ nextYear }}</span>
                    <div class="invalid-feedback startYearRateErr"></div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-floating">
                    <input type="text" id="terminalYearRate" name="terminalYearRate" class="form-control floatAllow"
                      value="8" v-model="gradientEnd">
                    <label for="terminalYearRate">Terminal Year Rate</label>
                    <span class="yRateTag">%</span>
                    <span class="form-span">Year: {{ nextYear + forecastDuration - 1 }}</span>
                    <div class="invalid-feedback terminalYearRateErr"></div>
                  </div>
                </div>
              </div>

              <div class="form-row text-start mt-20"><strong>Mode of Forecast</strong></div>
              <div class="forecast-mode">
                <div class="forecast-buttons">
                  <button :class="{ active: forecastMode === 'linear' }"
                    @click="forecastMode = 'linear'" >Linear</button>
                  <button :class="{ active: forecastMode === 'exponential' }"
                    @click="forecastMode = 'exponential'">Exponential</button>
                </div>
              </div>
            </div>
            <!-- Staged Growth-->
            <div v-if="selectedGrowthType === 'staged'" class="staged-growth-input">
              <div class="row" id="stagedRow" style="display: flex;">
                <div class="form-row">
                  <div class="form-floating col-md-4">
                    <select id="numStages" name="numStages" class="form-select" v-model="numStages"
                      @change="updateStages">
                      <option value="">Select Stages</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                    <label for="modelType">Number of Stages</label>
                    <div class="invalid-feedback numStagesErr"></div>
                  </div>
                </div>
                <div class="col-md-12" id="stagesTable" style="display: none;"></div>
              </div>

              <!-- Show the stage container only if numStages has a value -->
              <div v-if="numStages" class="mt-20">
                <div class="col-md-12" id="stagesTable" style="display: block;">
                  <div v-for="(stage, index) in stages" :key="index" class="form-row align-items-center"
                    :id="`stageRow${index}`">
                    <!-- Stage Label -->
                    <div class="row col-md-10 form-left">
                      <div class="form-group col-md-1">
                        <label class="stage-label">Stage {{ index + 1 }}:</label>
                      </div>
                      <!-- Growth Rate Input -->
                      <div class="form-floating col-md-2">
                        <input type="text" :id="`stageGrowthRate${index}`" name="stageGrowthRate[]"
                          class="form-control floatAllow" v-model="stage.rate" />
                        <label :for="`stageGrowthRate${index}`">Growth Rate</label>
                        <span class="yRateTag">%</span>
                        <div class="invalid-feedback" :class="`stageGrowthRate${index}Err`"></div>
                      </div>

                      <!-- Duration Dropdown -->
                      <div class="form-floating col-md-2">
                        <select :id="`stageDuration${index}`" name="stageDuration[]" class="form-select duration"
                          v-model="stage.duration">
                          <option value="">Select years</option>
                          <option value="1">1 Years</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="4">4 Years</option>
                          <option value="5">5 Years</option>
                          <option value="6">6 Years</option>
                          <option value="7">7 Years</option>
                          <option value="8">8 Years</option>
                          <option value="9">9 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                        <label :for="`stageDuration${index}`">Duration</label>
                        <div class="invalid-feedback" :class="`stageDuration${index}Err`"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>

          </div>
        </div>
        <button class="submit-button" @click="submitInputs">Submit Inputs</button>
      </div>
    </div>
    <div v-if="isLoading" class="spinner-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    <!-- Preview Section -->
    <div class="table-container" v-if="this.forecastItems && this.forecastItems.length > 0 && !this.isLoading">
      <div class="forecast-preview">
        <h4>Preview the Revenue Growth Forecast</h4>
        <div class="revenue-table-container">
          <table class="revenue-table">
            <thead>
              <tr class="year-row">
                <th>Year</th>
                <th v-for="year in forecastYears" :key="year">{{ year }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in forecastItems" :key="item.lineItemId">
                <td>{{ item.lineItemName }}</td>
                <td v-for="(value, index) in item.values" :key="index">
                  {{ formatValueByType(value, item.unitType) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="goBack">Back</button>
      <button @click="goForward" :disabled="!isInputsValid">Continue</button>
    </div>
  </div>
</template>

<script>
import { currencyMixin } from '@/mixins/currencyMixin';
export default {
  mixins: [currencyMixin],
  props: ['companyName'],
  created() {
    this.companyId = sessionStorage.getItem('companyId');
    this.fetchHistoricalData();
    this.loadUserSelections();
    this.showPreview();
  },
  data() {
    const savedForecastDuration = sessionStorage.getItem('userSelections-foreCastDuration');
    return {
      nextYear: null,
      forecastedData: [],
      stagesOptions: [1, 2, 3, 4, 5],
      forecastMode: 'linear',
      rawHistoricalData: [],
      isLoading: false,
      isOpen: false,
      selectedGrowthType: 'constant',
      selectedFormat: 'USD',
      forecastDuration: savedForecastDuration ? JSON.parse(savedForecastDuration) : 3, // Use sessionStorage value or fallback to 3
      growthType: 'constant',
      inputGrowthRate: null,
      numStages: null,
      historicalData: {
        years: [],
        revenues: [],
        growthRates: []
      },
      gradientStartYear: new Date().getFullYear(), // Current year dynamically set
      gradientStart: 0,  // Beginning gross margin for gradient
      gradientEnd: 0,    // Terminal gross margin for gradient
      //  forecastData: [],
      forecastedRevenues: [],
      forecastedGrowthRates: [],
      forecastedYears: [],
      stages: [
        { rate: null, duration: null },
        { rate: null, duration: null },
        { rate: null, duration: null }
      ]

    };
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // This runs after the route change, and the component is created
      if (from.name === 'GrowthMarginForecast') { // Adjust 'NextPageComponent' to the actual next page's name
        //vm.companyId = vm.getCompanyIdFromSession(); // Load the company ID

        // Call the API to fetch forecast data when the user navigates back
        vm.showPreview();
      }
    });
  },
  methods: {
    loadUserSelections() {
      const savedSelections = sessionStorage.getItem('userSelections-revenueForecast');
      if (savedSelections) {
        const parsedSelections = JSON.parse(savedSelections);
        this.selectedGrowthType = parsedSelections.growthType || 'staged';
        this.forecastDuration = parsedSelections.forecastDuration || 1;
        this.selectedFormat = parsedSelections.currency || 'USD';

        if (this.selectedGrowthType === 'gradient') {
          this.gradientStart = parsedSelections.gradientStart || null;
          this.gradientEnd = parsedSelections.gradientEnd || null;
        } else if (this.selectedGrowthType === 'constant') {
          this.inputGrowthRate = parsedSelections.inputGrowthRate || 0;
        } else if (this.selectedGrowthType === 'staged') {
          this.numStages = parsedSelections.numStages || 1;
          this.stages = parsedSelections.stages || [{ rate: null, duration: null }];
        }
      }
    },
    formatValueByType(value, type) {
      if (type === 'PERCENTAGES') {
        return value % 1 === 0 ? value + '%' : value.toFixed(2) + '%';
      } else if (type === 'DOLLARS') {
        return value % 1 === 0
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
          : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      } else {
        return value; // Default fallback
      }
    },
    /*formatRevenue(value) {
      switch (this.selectedFormat) {
        case 'Millions':
          return `${(value / 1e6).toFixed(2)}M`;
        case 'Billions':
          return `${(value / 1e9).toFixed(2)}B`;
        default:
          return this.formatCurrency(value);
      }
    },*/
    fetchHistoricalData() {
      const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/historical`;
      const requestBody = {
        companyId: this.companyId, // Replace with the actual companyId dynamically if needed
        lineItemIds: [1, 66] // Replace with the actual lineItemIds if needed
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.rawHistoricalData = data;
          // Extract unique years from the annualValues of both items
          const years = [...new Set(data.flatMap(item => item.annualValues.map(av => av.year)))];
          years.sort(); // Sort years in ascending order
          this.historicalData.years = years;

          this.nextYear = years[years.length - 1] + 1;
          // Map values for Revenue
          const revenueItem = data.find(item => item.lineItemId === 1);
          this.historicalData.revenues = years.map(year => {
            const annualValue = revenueItem.annualValues.find(av => av.year === year);
            return annualValue ? annualValue.value : 0; // Default to 0 if value for the year is missing
          });

          // Map values for Revenue Growth
          const growthItem = data.find(item => item.lineItemId === 66);
          this.historicalData.growthRates = years.map(year => {
            const annualValue = growthItem.annualValues.find(av => av.year === year);
            return annualValue ? annualValue.value : 0; // Default to 0 if value for the year is missing
          });
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          this.isLoading = false;
        });
    },
    mounted() {
      this.updateStages();
    },

    async submitInputs() {
      try {
        // Prepare the forecast request
        this.isLoading = true;
        this.forecastedData = [];
        // Prepare forecast request
        const forecastRequest = {
          forecastDuration: this.forecastDuration,
          growthType: this.selectedGrowthType,
          inputGrowthRate: this.inputGrowthRate,
          numberOfGrowthStages: this.numStages,
          forecastMode: this.forecastMode,
          growthStages: this.stages,
          gradientStartYear: this.gradientStart,
          gradientEndYear: this.gradientEnd,
          companyId: this.companyId,
          forecastItems: this.rawHistoricalData.map(item => {
            // Find the max year entry from annualValues
            const maxYearData = item.annualValues.reduce((max, current) => {
              return current.year > max.year ? current : max;
            });

            return {
              lineItemId: item.lineItemId,
              internalAlias: item.internalAlias,
              unitType: item.unitType,
              historicalValues: [maxYearData] // Pass only the max year's data as a list
            };
          })
        };
        // Send the forecast request to the backend API
        const forecastUrl = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/forecast/single`
        fetch(forecastUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(forecastRequest)
        })
          .then(response => {
            if (response.ok) {
              this.showPreview()
              // Parse the forecasted data from the response
            } else {
              console.error('Error saving forecast data:', response.statusText);
            }
          })
          .catch(error => {
            console.error('Error submitting forecast data:', error);
          });
      } catch (error) {
        console.error('Error in submitInputs:', error);
      }
    }
    ,
    async showPreview() {
      try {

        this.isLoading = true;
        const fetchForecastRequest = {
          companyId: this.companyId, // Replace with dynamic value if needed
          lineItemIds: [1, 66], // Replace with selected line item IDs          
        };
        const previewUrl = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/forecasted`
        const response = await fetch(previewUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fetchForecastRequest),
        });
        if (!response.ok) {
          console.error('Error fetching forecasted data:', response.statusText);
          return;
        }

        this.forecastedData = await response.json();

        // Prepare forecast table data
        const years = [...new Set(this.forecastedData.flatMap(item => item.annualValues.map(av => av.year)))];
        this.forecastYears = years.sort(); // Sort years in ascending order

        this.forecastItems = this.forecastedData.map(item => ({
          lineItemId: item.lineItemId,
          lineItemName: item.lineItemName,
          unitType: item.unitType,
          values: this.forecastYears.map(year =>
            item.annualValues.find(av => av.year === year)?.value || 0
          ),
        }));
      } catch (error) {
        console.error('Error in showPreview:', error);
      } finally {
        this.isLoading = false;
      }
    }
    ,
    calculateGrowth(previousRevenue, currentRevenue) {
      if (previousRevenue === 0) return 'N/A';
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      return growth.toFixed(2);
    },
    togglePreview() {
      this.isOpen = !this.isOpen;
    },
    changeGrowthType(type) {
      this.selectedGrowthType = type;
      this.growthType = type;
    },
    updateStages() {
      // Adjust the stages array to match the number of stages input by the user
      if (this.numStages && this.numStages > 0) {
        // Populate the stages array based on the selected number of stages
        this.stages = Array.from({ length: this.numStages }, () => ({ rate: 0, duration: 0 }));
      } else {
        // Clear stages if no valid selection is made
        this.stages = [];
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    goForward() {
      let selectedOptions = {
        growthType: this.selectedGrowthType,
        forecastDuration: this.forecastDuration,
      };

      if (this.selectedGrowthType === 'gradient') {
        selectedOptions.gradientStart = this.gradientStart;
        selectedOptions.gradientEnd = this.gradientEnd;
      } else if (this.selectedGrowthType === 'constant') {
        selectedOptions.inputGrowthRate = this.inputGrowthRate;
      } else if (this.selectedGrowthType === 'staged') {
        selectedOptions.numStages = this.numStages;
        selectedOptions.stages = this.stages;
      }

      sessionStorage.setItem('userSelections-revenueForecast', JSON.stringify(selectedOptions));
      this.$router.push({ name: 'GrowthMarginForecast' });
    }
  },
  computed: {
    endYear() {
      return this.gradientStartYear + this.forecastDuration;
    },
    isInputsValid() {
      if (this.selectedGrowthType === 'gradient') {
        return this.gradientStart !== null && this.gradientEnd !== null && this.forecastDuration > 0;
      } else if (this.selectedGrowthType === 'constant') {
        return this.inputGrowthRate > 0 && this.forecastDuration > 0;
      } else if (this.selectedGrowthType === 'staged') {
        return this.numStages > 0 && this.stages.every(stage => stage.rate !== null && stage.duration !== null) && this.forecastDuration > 0;
      }
      return false;
    },
    companyHeader() {
      const stockInfoString = sessionStorage.getItem('selectedStock');
      const stockInfo = JSON.parse(stockInfoString);
      return `${stockInfo.companyName}`;
    }
  }
};
</script>

<style scoped>
.table-container {
  padding: 20px;
  margin: 20px 0;
  background-color: #ffffff;
  /* White background for the table container */
  border: 1px solid #ccc;
  /* Light grey border */
  border-radius: 8px;
  /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */
}

.revenue-forecast {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: x-small;
  font-family: 'Roboto', sans-serif;
}

.revenue-table,
.forecast-results {
  margin-top: 20px;
  font-family: 'Roboto', sans-serif;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.forecast-assumptions {
  margin-top: 20px;
  font-family: 'Roboto', sans-serif;
}

.forecast-assumptions>div {
  margin-bottom: 10px;
  font-family: 'Roboto', sans-serif;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #004488;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.currency-selector {
  display: flex;
  align-items: center;
}

.growth-buttons button {
  background-color: #e0e7ff;
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 25px;
  /* This makes the buttons rounded */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.growth-buttons button.active {
  background-color: #4a90e2;
  color: #fff;
}

.growth-buttons button:hover {
  background-color: #4a90e2;
  color: #fff;
}

.forecast-duration {
  display: flex;
  align-items: center;
}

.forecast-duration label {
  font-weight: bold;
  margin-right: 10px;
  /* Adjust the spacing between the label and input */
}

.forecast-duration-input {
  display: flex;
  align-items: center;
}

.forecast-duration-input input[type="number"] {
  width: 50px;
  /* Adjust width as necessary */
  padding: 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
  /* Space between input and "Years" label */
}

.years-label {
  background-color: #e0e0e0;
  /* Adjust background color */
  padding: 5px 10px;
  color: #666;
  display: inline-block;
  border-left: 1px solid #ccc;
}

.years-label {
  padding-left: 5px;
  /* Space between the input box and the text "Years" */
  color: #666;
}

.growth-type-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* Add spacing between elements */
}

.growth-input {
  margin-top: 20px;
}

.child-container {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.growth-rate-input {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.growth-input,
.staged-growth-input {
  margin-top: 20px;
}

.staged-growth-input .stage-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}


.stage-input label {
  margin-right: 5px;
}

.stage-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  /* Adjusts the space between elements */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.growth-type-button {
  margin-right: 30px;
  /* Adjust this value for the desired spacing */
}

.growth-type-button:last-child {
  margin-right: 0;
  /* Remove margin from the last button to prevent overflow */
}

.forecast-buttons {
  margin-top: 8px;
  /* Add margin to separate from the label */
}

.forecast-buttons button {
  margin-right: 10px;
  /* Optional: add some space between the buttons */
  background-color: #e0e7ff;
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 25px;
  /* This makes the buttons rounded */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.forecast-buttons button.active {
  background-color: #4a90e2;
  color: #fff;
}

.forecast-buttons button:hover {
  background-color: #4a90e2;
  color: #fff;
}

.staged-table {
  width: 100%;
  border-collapse: collapse;
  /* Remove gaps between table cells */
}

.staged-table th,
.staged-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.stage-input {
  /* Style the stage rows as needed */
}

/* New CSS for input field alignment */
.input-container {
  display: flex;
  align-items: center;
  /* Vertically align input fields */
}



.input-group {
  display: flex;
  justify-content: right;
  /* Distribute space evenly */
  align-items: center;
  /* Vertically center elements */
}

.year-input {
  display: flex;
  align-items: center;
}

.year-input label {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 5px;
}

.year-input .input-container {
  display: flex;
  align-items: center;
}

.input-container {
  margin-left: 5px;
  /* Add spacing between label and input */
}

.forecast-preview h2 {
  font-family: 'Roboto', sans-serif;
  /* Match the font used in the assumptions section */
  font-weight: bold;
}

.forecast-preview .revenue-table {
  font-family: 'Roboto', sans-serif;
  /* Match the font used in the assumptions section */
  table-layout: fixed;
  width: 100%;
}

.forecast-preview .revenue-table-container {
  overflow-x: auto;
  white-space: nowrap;
}

.forecast-preview .revenue-table {
  table-layout: fixed;
  width: 100%;
}

.forecast-preview .revenue-table th,
.forecast-preview .revenue-table td {
  /* ... existing styles for table cells ... */
  width: 1fr;
  /* Divide the available width evenly among columns */
}

.forecast-preview .revenue-table td:nth-child(2) {
  width: 20%;
  /* Adjust the width as needed */
}

.forecast-preview .revenue-table td:nth-child(3) {
  width: 10%;
  /* Adjust the width as needed */
}

.spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #4a90e2;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.gradient-growth-input {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.input-group {
  display: flex;
  gap: 10px;
  /* Minimal spacing between the inputs */
  align-items: center;
  justify-content: flex-start;
}

.year-input {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-dropdown {
  display: block;
  width: 25%;
  /* Full width */
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  /* Adjust padding for dropdown size */
  font-family: Arial, sans-serif;
  /* Replace with your desired font */
  font-size: 16px;
  /* Adjust for readability */
  font-weight: 400;
  /* Normal font weight */
  line-height: 1.5;
  color: #495057;
  /* Standard text color */
  background-color: #fff;
  /* White background */
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"%3E%3Cpath fill="%23ccc" d="M2 0L0 2h4zm0 5L0 3h4z"/%3E'), none;
  /* Dropdown arrow */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  /* Position arrow */
  background-size: 10px 10px;
  /* Size arrow */
  border: 1px solid #ced4da;
  /* Light gray border */
  border-radius: 0.25rem;
  /* Rounded corners */
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
  /* Subtle inner shadow */
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  /* Smooth transitions */
  appearance: none;
  /* Remove default styling for consistent look */

  /* Focus state styling */
  &:focus {
    border-color: #80bdff;
    /* Blue border on focus */
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    /* Glow effect on focus */
  }

  /* Styles for multiple selection or size attributes */
  &[multiple],
  &[size]:not([size="1"]) {
    padding-right: 0.75rem;
    /* Adjust padding */
    background-image: none;
    /* Remove arrow for multiple selection */
  }
}







.year-input label {
  font-size: 1rem;
  color: #555;
  margin-bottom: 5px;
}

.input-container {
  display: flex;
  align-items: center;
}

.input-container input {
  width: 150px;
  padding: 5px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: right;
}

.input-container span {
  margin-left: 5px;
  font-size: 1rem;
  color: #555;
}

.year-input {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.year-input label {
  font-size: 1rem;
  color: #555;
  margin-bottom: 5px;
}

.year-input input {

  width: 150px;
  padding: 5px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: right;
  height: 30px;
}

.growth-type {
  margin-bottom: 20px;
}

.growth-type label {
  display: block;
  font-size: 1rem;
  color: #555;
  margin-bottom: 10px;
  /* Add spacing below the label */
}

.growth-buttons {
  display: flex;
  gap: 10px;
  /* Add spacing between buttons */
}

.growth-type-button {
  padding: 10px 20px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.growth-type-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.yRateTag {
  position: absolute;
  top: 20px;
  right: 4px;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  padding: .375rem .75rem;
}

.mt-20 {
  margin-top: 20px;
}

.stage-label {
  padding-top: 12px;
  font-weight: 500;
}

.year-row {
  background-color: #ECECEC;
  font-weight: bold;
}
</style>
