<template>
    <div class="revenue-forecast">

        <div class="table-container">
            <div class="header">
                <h1>{{ companyHeader }}'s Historical Trend of Capital Expenditure</h1>
                <div class="currency-selector">
                    <label for="currency">Currency:</label>
                    <select v-model="selectedCurrency" id="currency">
                        <option value="CAD">CAD</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
            </div>
            <div class="revenue-table">
                <table>
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th v-for="year in historicalData.years" :key="year">{{ year }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Capital Spending Row -->
                        <tr>
                            <td>Capital Expenditure</td>
                            <td v-for="(revenue, index) in historicalData.revenues" :key="'revenue-' + index">
                                {{ formatCurrency(revenue) }}
                            </td>
                        </tr>
                        <!-- Capital Spending Growth Row -->
                        <tr>
                            <td>Capital Expenditure Growth</td>
                            <td v-for="(growth, index) in historicalData.growthRates" :key="'growth-' + index">
                                {{ growth ? growth + '%' : 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
        <div class="table-container">
            <div class="forecast-assumptions">
                <div class="header">
                    <h1>Input Your Assumptions for Gross Margin (%) Forecasts</h1>
                </div>


                <div class="growth-type-container">
                    <div class="growth-type">
                        <label>Type of Forecast Method</label>
                        <div class="growth-buttons">
                            <button :class="{ active: selectedGrowthType === 'constant' }"
                                @click="changeGrowthType('constant')" class="growth-type-button">Constant</button>
                            <button :class="{ active: selectedGrowthType === 'gradient' }"
                                @click="changeGrowthType('gradient')" class="growth-type-button">Gradient</button>
                            <button :class="{ active: selectedGrowthType === 'staged' }"
                                @click="changeGrowthType('staged')" class="growth-type-button">Staged</button>
                            <button :class="{ active: selectedGrowthType === 'matchrevenuegrowth' }"
                                @click="changeGrowthType('matchrevenuegrowth')" class="growth-type-button">Match Revenue
                                Growth </button>
                        </div>
                        <!-- Constant Growth -->
                        <div v-if="selectedGrowthType === 'constant'" class="growth-input child-container">
                            <!-- Input for constant growth -->
                            <label>Input Growth Rate</label>
                            <input type="number" v-model="inputGrowthRate" min="0" max="100"
                                class="growth-rate-input" /> %
                        </div>
                        <!-- Gradient -->
                        <div v-if="selectedGrowthType === 'gradient'" class="gradient-growth-input">
                            <p>From FY {{ gradientStartYear }} - {{ gradientStartYear + forecastDuration }}</p>
                            <div class="input-group">
                                <div class="year-input">
                                    <label>{{ gradientStartYear }}e</label>
                                    <div class="input-container">
                                        <input type="number" v-model="gradientStart" />
                                    </div>
                                    %
                                </div>
                                <div class="year-input">
                                    <label>{{ gradientStartYear + forecastDuration }}e</label>
                                    <div class="input-container">
                                        <input type="number" v-model="gradientEnd" />
                                    </div>
                                    %
                                </div>
                            </div>
                            <div class="forecast-mode">
                                <label>Mode of Forecast</label>
                                <div class="forecast-buttons">
                                    <button :class="{ active: forecastMode === 'linear' }"
                                        @click="forecastMode = 'linear'">Linear</button>
                                    <button :class="{ active: forecastMode === 'exponential' }"
                                        @click="forecastMode = 'exponential'">Exponential</button>
                                </div>
                            </div>
                        </div>
                        <!-- Staged Growth-->
                        <div v-if="selectedGrowthType === 'staged'" class="staged-growth-input">
                            <label>Number of Growth Stages</label>
                            <input type="number" v-model="numStages" min="1" @input="updateStages" /> Stages
                            <div class="stage-container">
                                <table class="staged-table">
                                    <thead>
                                        <tr>
                                            <th>Stage</th>
                                            <th>Growth Rate (%)</th>
                                            <th>Duration (Years)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(stage, index) in stages" :key="index" class="stage-">
                                            <td>{{ index + 1 }}</td>
                                            <td>
                                                <div class="input-container">
                                                    <input type="number" v-model="stage.rate" />
                                                </div>
                                            </td>
                                            <td>
                                                <div class="input-container">
                                                    <input type="number" v-model="stage.duration" />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
        <!-- Preview section-->
        <div class="table-container" v-if="forecastItems && forecastItems.length > 0">
            <div class="forecast-preview">
                <h2>Preview of Operating Expenses Growth Forecast</h2>
                <div class="revenue-table-container">
                    <table class="revenue-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <!-- Dynamically generate table headers for each year -->
                                <th v-for="year in forecastYears" :key="year">
                                    {{ year }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Loop through forecastItems to display data for each line item -->
                            <tr v-for="(item, itemIndex) in forecastItems" :key="itemIndex">
                                <!-- Line item name -->
                                <td>{{ item.lineItemName }}</td>
                                <!-- Display values for each year -->
                                <td v-for="(value, yearIndex) in item.values" :key="yearIndex">
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
export default {
    props: ['companyName'],
    created() {
        this.fetchHistoricalData();
        this.loadUserSelections();
    },
    data() {
        const savedForecastDuration = sessionStorage.getItem('userSelections-foreCastDuration');
        return {
            forecastData: [],
            forecastItems: [],
            isLoading: false,
            isOpen: false,
            selectedGrowthType: 'constant',
            selectedCurrency: 'CAD',
            forecastDuration: savedForecastDuration ? JSON.parse(savedForecastDuration) : 3,
            growthType: 'constant',
            inputGrowthRate: 3,
            numStages: 3,
            historicalData: {
                years: [],
                capitalExpenditure: [],
                grossMarginPercent: []
            },
            gradientStartYear: new Date().getFullYear(), // Current year dynamically set
            gradientStart: 0,  // Beginning gross margin for gradient
            gradientEnd: 0,    // Terminal gross margin for gradient
            forecastMode: 'linear',
            forecastedRevenues: [],
            forecastedGrowthRates: [],
            forecastedYears: [],
            stages: [
                { rate: null, duration: null },
                { rate: null, duration: null },
                { rate: null, duration: null }
            ],
            forecastedData: {
                years: [2024, 2025, 2026],
                revenues: [14.1, 16.5, 17.32],
                growthRates: [7, 4.3, 3],
            }
        };
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // This runs after the route change, and the component is created
            if (from.name === 'WorkingCapitalAssumptionsForecast') { // Adjust 'NextPageComponent' to the actual next page's name
                //vm.companyId = vm.getCompanyIdFromSession(); // Load the company ID

                // Call the API to fetch forecast data when the user navigates back
                vm.fetchForecastedData();
            }
        });
    },
    methods: {
        formatValueByType(value, type) {
            if (type === 'percentage') {
                return value.toFixed(2) + '%';
            } else if (type === 'currency') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            } else {
                return value; // Default fallback
            }
        },
        calculateGrowthRates(values) {
            const growthRates = [null]; // No growth rate for the first year
            for (let i = 1; i < values.length; i++) {
                const prevValue = values[i - 1];
                const currValue = values[i];
                const growthRate = prevValue === 0 ? null : ((currValue - prevValue) / prevValue) * 100;
                growthRates.push(growthRate);
            }
            return growthRates;
        },
        loadUserSelections() {
            const savedSelections = sessionStorage.getItem('userSelections-capitalSpendingForecast');
            if (savedSelections) {
                const parsedSelections = JSON.parse(savedSelections);
                this.selectedGrowthType = parsedSelections.growthType || 'staged';
                this.numStages = parsedSelections.numStages || 1;
                this.stages = parsedSelections.stages || [{ rate: null, duration: null }];
                this.inputGrowthRate = parsedSelections.inputGrowthRate || 0;
                this.forecastDuration = parsedSelections.forecastDuration || 1;
                this.selectedCurrency = parsedSelections.currency || 'CAD';
            }
        },
        fetchForecastedData() {
            fetch(`http://localhost:8080/api/revenue-forecast/fetch?companyId=1`)
                .then(response => response.json())
                .then(forecastData => {
                    this.forecastData = forecastData; // Set the forecast data for preview
                })
                .catch(error => {
                    console.error('Error fetching forecasted data:', error);
                });
        },
        fetchHistoricalData() {
            const url = 'http://localhost:8080/api/lineItems/historical';
            const requestBody = {
                companyId: 1, // Replace with the actual companyId dynamically if needed
                lineItemIds: [24, 37] // Replace with the actual lineItemIds if needed
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

                    // Map values for Revenue
                    const revenueItem = data.find(item => item.lineItemId === 24);
                    this.historicalData.revenues = years.map(year => {
                        const annualValue = revenueItem.annualValues.find(av => av.year === year);
                        return annualValue ? annualValue.value : 0; // Default to 0 if value for the year is missing
                    });

                    // Map values for Revenue Growth
                    const growthItem = data.find(item => item.lineItemId === 37);
                    this.historicalData.growthRates = years.map(year => {
                        const annualValue = growthItem.annualValues.find(av => av.year === year);
                        return annualValue ? annualValue.value : 0; // Default to 0 if value for the year is missing
                    });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
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
                console.log(JSON.stringify(forecastRequest));
                // Send the forecast request to the backend API
                fetch('http://localhost:8080/api/forecast/single', {
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
            } finally {
                this.isLoading = false;
            }
        },
        async showPreview() {
            try {
                if (this.forecastData && this.forecastData.length > 0) {
                    console.log('Using existing forecasted data for preview.');
                    return;
                }

                this.isLoading = true;

                const fetchForecastRequest = {
                    companyId: 1,
                    lineItemIds: [24,37],
                };

                const response = await fetch('http://localhost:8080/api/lineItems/forecasted', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fetchForecastRequest),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Forecasted Data:', data);

                const years = [...new Set(data.flatMap((item) => item.annualValues.map((av) => av.year)))].sort();
                this.forecastYears = [...new Set(data.flatMap((item) => item.annualValues.map((av) => av.year)))].sort();

                this.forecastItems = data.map((item) => ({
                    lineItemId: item.lineItemId,
                    lineItemName: item.lineItemName,
                    unitType: item.unitType,
                    values: years.map((year) =>
                        item.annualValues.find((av) => av.year === year)?.value || 0
                    ),
                }));

                console.log('Mapped Forecast Items:', this.forecastItems);
            } catch (error) {
                console.error('Error in showPreview:', error);
            } finally {
                this.isLoading = false;
            }
        }
        ,
        formatCurrency(value) {
            return new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: this.selectedCurrency
            }).format(value);
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
            if (this.numStages > this.stages.length) {
                while (this.stages.length < this.numStages) {
                    this.stages.push({ rate: 0, duration: 1 });
                }
            } else if (this.numStages < this.stages.length) {
                this.stages.splice(this.numStages);
            }
        },
        goBack() {
            this.$router.go(-1);
        },
        goForward() {
            let selctedOptions = {
                growthType: this.selectedGrowthType,
                numStages: this.numStages,
                stages: this.stages,
                inputGrowthRate: this.inputGrowthRate,
                forecastDuration: this.forecastDuration,
            };
            sessionStorage.setItem('userSelections-workingCapitalForecast', JSON.stringify(selctedOptions));
            this.$router.push({ name: 'WorkingCapitalForecast' });
        }
    },
    computed: {
        endYear() {
            return this.gradientStartYear + this.forecastDuration;
        },
        isInputsValid() {
            return this.inputGrowthRate > 0 && this.forecastDuration > 0;
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

.input-container input {
    width: 50px;
    /* Adjust width as needed */
    padding: 5px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.input-group {
    display: flex;
    justify-content: space-between;
    /* Distribute space evenly */
    align-items: center;
    /* Vertically center elements */
}

.year-input {
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
</style>