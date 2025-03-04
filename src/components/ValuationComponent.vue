<template>
    <div class="revenue-forecast">
        <div class="table-container">
            <div class="forecast-preview">
                <h4>Preview</h4>
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
        <div class="card shadow-sm mt-4"> <!-- Added mt-4 for spacing above -->
            <div class="card-header">
                <h6 class="mb-0">Input your assumptions</h6> <!-- Plain text header -->
            </div>
            <div id="assumptionsCollapse" class="collapse show">
                <div class="card-body">
                    <form>
                        <!-- Cost of Capital -->
                        <div class="form-floating col-md-3 mb-3"> <!-- Form floating styling -->
                            <input type="text" v-model="costOfCapital" min="0" max="100" class="form-control flatAllow"
                                id="costOfCapital" placeholder="Cost of Capital" required />
                            <label for="costOfCapital">Cost of Capital*</label>
                            <span class="yRateTag">%</span>
                            <div class="invalid-feedback" style="display: none;">Invalid Cost of Capital</div>
                        </div>

                        <!-- Approach Dropdown -->
                        <div class="form-floating col-md-3 mb-3">
                            <select v-model="selectedApproach" class="form-select" id="approachSelect" required>
                                <option value="">Select an Approach</option>
                                <option value="terminalGrowthRate">Terminal Growth Rate</option>
                                <option value="terminalEVEBITDAMultiple">Terminal EV/EBITDA Multiple</option>
                            </select>
                            <label for="approachSelect">Select an Approach*</label>
                            <div class="invalid-feedback" style="display: none;">Invalid Approach</div>
                        </div>

                        <!-- Terminal Growth Rate -->
                        <div v-if="selectedApproach === 'terminalGrowthRate'" class="form-floating col-md-3 mb-3">
                            <input type="text" v-model="terminalGrowthRate" min="0" max="100"
                                class="form-control flatAllow" id="terminalGrowthRate"
                                placeholder="Terminal Growth Rate" required />
                            <label for="terminalGrowthRate">Terminal Growth Rate*</label>
                            <span class="yRateTag">%</span>
                            <div class="invalid-feedback" style="display: none;">Invalid Terminal Growth Rate</div>
                        </div>

                        <!-- Terminal EV/EBITDA Multiple -->
                        <div v-else-if="selectedApproach === 'terminalEVEBITDAMultiple'"
                            class="form-floating col-md-3 mb-3">
                            <input type="text" v-model="terminalEVEBITDAMultiple" min="0" max="100"
                                class="form-control flatAllow" id="terminalEVEBITDAMultiple"
                                placeholder="Terminal EV/EBITDA Multiple" required />
                            <label for="terminalEVEBITDAMultiple">Terminal EV/EBITDA Multiple*</label>
                            <div class="invalid-feedback" style="display: none;">Invalid Terminal EV/EBITDA Multiple
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Next Page Button -->
        <div class="text-end mt-3"> <!-- Right-aligned button with margin-top -->
            <button class="btn btn-primary" @click="goToNextPage">Get Intrinsic Value</button>
        </div>

    </div>
</template>

<script>
import { currencyMixin } from '@/mixins/currencyMixin';
export default {
    mixins: [currencyMixin],
    created() {
        this.companyId = sessionStorage.getItem('companyId');

    },
    data() {
        return {
            costOfCapital: '',
            terminalGrowthRate: '',
            terminalEVEBITDAMultiple: '',
            selectedApproach: '',
            forecastYears: [],       // <-- Add this
            forecastItems: [],       // <-- And this
            forecastedData: []
        };
    },
    mounted() {
        // Retrieve the stored assumptions from sessionStorage
        this.showPreview();
        const storedAssumptions = JSON.parse(sessionStorage.getItem('valuationAssumptions'));
        if (storedAssumptions) {
            this.costOfCapital = storedAssumptions.costOfCapital || '';
            this.terminalGrowthRate = storedAssumptions.terminalGrowthRate || '';
            this.terminalEVEBITDAMultiple = storedAssumptions.terminalEVEBITDAMultiple || '';
            this.selectedApproach = storedAssumptions.selectedApproach || '';
        }
    },
    methods: {
        async showPreview() {
            try {

                const fetchForecastRequest = {
                    companyId: this.companyId, // Replace with dynamic value if needed
                    lineItemIds: [1, 3, 8, 9, 13], // Replace with selected line item IDs          
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

                // Get the latest year
                const latestYear = Math.max(...this.forecastYears);


                this.forecastItems = this.forecastedData.map(item => ({
                    lineItemId: item.lineItemId,
                    lineItemName: item.lineItemName,
                    unitType: item.unitType,
                    values: this.forecastYears.map(year =>
                        item.annualValues.find(av => av.year === year)?.value || 0
                    ),
                }))
                .filter(item => {
                    // Filter out items where the latest year's value is 0
                    const latestYearValue = item.values[this.forecastYears.indexOf(latestYear)];
                    return latestYearValue !== 0;
                });

            } catch (error) {
                console.error('Error in showPreview:', error);
            }
        },
        goToNextPage() {
            // Store the selected values in session storage
            const assumptions = {
                costOfCapital: this.costOfCapital,
                selectedApproach: this.selectedApproach,
                terminalGrowthRate: this.terminalGrowthRate,
                terminalEVEBITDAMultiple: this.terminalEVEBITDAMultiple
            };
            sessionStorage.setItem('valuationAssumptions', JSON.stringify(assumptions));

            // Navigate to the IntrinsicValueComponent
            this.$router.push({ name: 'IntrinsicValueForecast' });
        },
        goBack() {
            this.$router.go(-1);
        },
        getIntrinsicValue() {
            // existing method code
        },
        formatValueByType(value, type) {
            if (type === 'PERCENTAGES') {
                return this.formatGrowthRate(value) + '%';
            } else if (type === 'DOLLARS') {
                return this.formatRevenue(value, this.selectedFormat);
            } else {
                return value; // Default fallback
            }
        }
    },
};
</script>

<style scoped>
.card {
    border-radius: 8px;
    border: 1px solid #ddd;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    padding: 10px 15px;
}

.card-body {
    padding: 20px;
}

.yRateTag {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    font-size: 14px;
    color: #555;
}

.flatAllow {
    border-radius: 0.25rem;
}

.text-end {
    display: flex;
    justify-content: flex-end;
}

.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

button {
    padding: 10px 20px;
    border: none;
    background-color: #004488;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
}

.year-row {
    background-color: #f0f0f0;
    font-weight: bold;
}

.revenue-table,
.forecast-results {
    margin-top: 20px;
    font-family: 'Roboto', sans-serif;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Roboto', sans-serif;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}
.table-container {
    padding: 24px;
    margin: 24px 0;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
</style>