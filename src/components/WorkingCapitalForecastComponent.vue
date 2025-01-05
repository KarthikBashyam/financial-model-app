<template>
    <div class="revenue-forecast">

        <div class="table-container">
            <div class="header">
                <h1>{{ companyHeader }}'s Historical Trend of Working Capital Expenses</h1>
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
                            <th v-for="year in historicalData.years" :key="'year-' + year">{{ year }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamically loop through historicalData.items -->
                        <tr v-for="item in historicalData.items" :key="item.lineItemId">
                            <td>{{ item.name }}</td>
                            <td v-for="(value, index) in item.values" :key="'value-' + index">
                                {{ item.unitType === 'PERCENTAGES' ? (value ? value.toFixed(2) + '%' : 'N/A') : value }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <div class="table-container">
            <div class="forecast-assumptions">
                <div class="header">
                    <h1>Input Your Assumptions for Each Expense</h1>
                </div>

                <div class="growth-type-container" v-for="(section, index) in expenseSections"
                    :key="section.internalAlias">
                    <div><b>{{ section.name }}</b> (Alias: {{ section.internalAlias }})</div>

                    <div class="growth-type">
                        <label>Type of Forecast Method</label>
                        <div class="growth-buttons">
                            <button :class="{ active: section.selectedGrowthType === 'constant' }"
                                @click="changeGrowthType(index, 'constant')" class="growth-type-button">
                                Constant
                            </button>
                            <button :class="{ active: section.selectedGrowthType === 'gradient' }"
                                @click="changeGrowthType(index, 'gradient')" class="growth-type-button">
                                Gradient
                            </button>
                            <button :class="{ active: section.selectedGrowthType === 'staged' }"
                                @click="changeGrowthType(index, 'staged')" class="growth-type-button">
                                Staged
                            </button>
                            <button :class="{ active: section.selectedGrowthType === 'matchrevenuegrowth' }"
                                @click="changeGrowthType(index, 'matchrevenuegrowth')" class="growth-type-button">
                                Match Revenue Growth
                            </button>
                        </div>

                        <!-- Constant Growth -->
                        <div v-if="section.selectedGrowthType === 'constant'" class="growth-input child-container">
                            <label>Input Growth Rate</label>
                            <input type="number" v-model="section.inputGrowthRate" min="0" max="100"
                                class="growth-rate-input"
                                @input="updateInputGrowthRate(index, section.inputGrowthRate)" /> %
                        </div>

                        <!-- Gradient Growth -->
                        <div v-if="section.selectedGrowthType === 'gradient'" class="gradient-growth-input">
                            <p>From FY {{ gradientStartYear }} - {{ gradientStartYear + forecastDuration }}</p>
                            <div class="input-group">
                                <div class="year-input">
                                    <label>{{ gradientStartYear }}e</label>
                                    <input type="number" v-model="section.gradientStart" /> %
                                </div>
                                <div class="year-input">
                                    <label>{{ gradientStartYear + forecastDuration }}e</label>
                                    <input type="number" v-model="section.gradientEnd" /> %
                                </div>
                            </div>
                            <div class="forecast-mode">
                                <label>Mode of Forecast</label>
                                <div class="forecast-buttons">
                                    <button :class="{ active: section.forecastMode === 'linear' }"
                                        @click="setForecastMode(index, 'linear')" class="growth-type-button">
                                        Linear
                                    </button>
                                    <button :class="{ active: section.forecastMode === 'exponential' }"
                                        @click="setForecastMode(index, 'exponential')" class="growth-type-button">
                                        Exponential
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Staged Growth -->
                        <div v-if="section.selectedGrowthType === 'staged'" class="staged-growth-input">
                            <label>Number of Growth Stages</label>
                            <input type="number" v-model="section.numStages" min="1" @input="updateStages(index)" />
                            Stages

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
                                        <tr v-for="(stage, sIndex) in section.stages"
                                            :key="stage.rate + '-' + stage.duration">
                                            <td>{{ sIndex + 1 }}</td>
                                            <td>
                                                <input type="number" v-model="stage.rate" />
                                            </td>
                                            <td>
                                                <input type="number" v-model="stage.duration" />
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
        this.fetchHistoricalData().then(() => {
            this.initializeExpenseSections();
        });
    },

    data() {
        const savedForecastDuration = sessionStorage.getItem('userSelections-foreCastDuration');
        return {
            historicalData: {
                years: [],
                items: [],
            },
            expenseSections: [],
            forecastData: [],
            forecastItems: [],
            forecastDuration: savedForecastDuration ? JSON.parse(savedForecastDuration) : 3,
            selectedCurrency: 'CAD',
            isLoading: false,
        };
    },
    computed: {
        isInputsValid() {
            // Validate all expense sections
            return this.expenseSections.every(section => {
                if (section.selectedGrowthType === 'constant') {
                    return section.inputGrowthRate > 0;
                } else if (section.selectedGrowthType === 'gradient') {
                    return section.gradientStart > 0 && section.gradientEnd > 0;
                } else if (section.selectedGrowthType === 'staged') {
                    return section.stages.every(stage => stage.rate > 0 && stage.duration > 0);
                }
                return true; // Default to valid for other types
            });
        },
        companyHeader() {
            const stockInfoString = sessionStorage.getItem('selectedStock');
            const stockInfo = JSON.parse(stockInfoString);
            return `${stockInfo.companyName}`;
        }
    }
    ,
    methods: {
        changeGrowthType(index, type) {
            // Update the selectedGrowthType for the expense section
            this.expenseSections[index].selectedGrowthType = type;

            // Reset specific properties based on the selected growth type
            if (type === 'constant') {
                // Reset gradient and staged growth properties
                this.expenseSections[index].gradientStart = 0;
                this.expenseSections[index].gradientEnd = 0;
                this.expenseSections[index].stages = []; // Clear stages if switching back to constant
            } else if (type === 'gradient') {
                // Reset constant and staged growth properties
                this.expenseSections[index].inputGrowthRate = 0;
                this.expenseSections[index].stages = []; // Clear stages if switching to gradient
            } else if (type === 'staged') {
                // Reset constant and gradient growth properties
                this.expenseSections[index].inputGrowthRate = 0;
                this.expenseSections[index].gradientStart = 0;
                this.expenseSections[index].gradientEnd = 0;
                // Initialize default stages
                this.expenseSections[index].stages = [
                    { rate: 0, duration: 1 },
                    { rate: 0, duration: 1 },
                    { rate: 0, duration: 1 }
                ];
            }
            // If additional growth types are added (e.g., 'matchrevenuegrowth'), handle them here
        }
        ,
        goForward() {
            const selectedOptions = this.expenseSections.map((section) => ({
                name: section.name, // Name of the expense
                growthType: section.selectedGrowthType, // Selected growth type
                numStages: section.numStages, // Number of growth stages
                stages: section.stages.map((stage) => ({
                    rate: stage.rate,
                    duration: stage.duration,
                })), // Stages with growth rate and duration
                inputGrowthRate: section.inputGrowthRate, // Input growth rate for constant growth
                forecastDuration: this.forecastDuration, // Forecast duration
                gradientStart: section.gradientStart, // Gradient start value for gradient growth
                gradientEnd: section.gradientEnd, // Gradient end value for gradient growth
                forecastMode: section.forecastMode, // Forecast mode (linear or exponential)
            }));

            // Store the selections in session storage
            sessionStorage.setItem(
                'userSelections-workingCapitalForecast',
                JSON.stringify(selectedOptions)
            );
           // this.$router.push({ name: 'CapitalSpendingForecast' });
           this.$router.push({name: 'IntrinsicValueForecast'});
        },
        goBack() {
            this.$router.go(-1);
        },
        async initializePage() {
            try {
                this.isLoading = true;
                await this.fetchHistoricalData();
                this.initializeExpenseSections();
                console.log('Page Initialized Successfully');
            } catch (error) {
                console.error('Error initializing the page:', error);
            } finally {
                this.isLoading = false;
            }
        },
        formatValueByType(value, type) {
            if (type === 'PERCENTAGE') {
                return value.toFixed(2) + '%';
            } else if (type === 'Dollars') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            } else {
                return value; // Default fallback
            }
        },
        updateInputGrowthRate(index, value) {
            // Update the input growth rate for the given section
            if (this.expenseSections[index]) {
                this.expenseSections[index].inputGrowthRate = value;
            } else {
                console.warn(`No section found at index ${index}`);
            }
        },
        async fetchHistoricalData() {
            const url = 'http://localhost:8080/api/lineItems/historical';
            const requestBody = {
                companyId: 1, // Replace with dynamic value if needed
                lineItemIds: [13, 12,16, 44, 45, 46] // Main and growth item IDs
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Raw Historical Data:', data);

                // Extract unique years from the API response
                const years = [...new Set(data.flatMap((item) => item.annualValues.map((av) => av.year)))];
                this.historicalData.years = years.sort();

                // Map the API data directly to historicalData.items
                this.historicalData.items = data.map((item) => ({
                    name: item.lineItemName,
                    lineItemId: item.lineItemId,
                    internalAlias: item.internalAlias,
                    unitType: item.unitType,
                    values: years.map(
                        (year) => item.annualValues.find((av) => av.year === year)?.value || 0
                    ),
                }));

                console.log('Mapped Historical Data:', this.historicalData.items);
            } catch (error) {
                console.error('Error fetching historical data:', error);
            }
        }


        ,
        initializeExpenseSections() {
            // Ensure historicalData is populated before mapping
            if (!this.historicalData.items || this.historicalData.items.length === 0) {
                console.warn('Historical data is not loaded yet.');
                return;
            }

            // Filter out growth items (i.e., items where internalAlias ends with "Growth")
            const regularItems = this.historicalData.items.filter(
                (item) => !item.internalAlias.endsWith('Growth')
            );

            // Map only regular items to expenseSections
            this.expenseSections = regularItems.map((item) => ({
                name: item.name, // Display name for the item
                lineItemId: item.lineItemId, // ID for backend reference
                internalAlias: item.internalAlias, // Alias for backend reference
                selectedGrowthType: 'constant', // Default forecast type
                isOpen: false, // Default to collapsed
                numStages: 3, // Default number of growth stages
                stages: [
                    { rate: 4, duration: 3 }, // Default stage values
                    { rate: 6, duration: 4 },
                    { rate: 9, duration: 3 },
                ],
                inputGrowthRate: 0, // Default growth rate
                gradientStart: 0, // Default gradient start
                gradientEnd: 0, // Default gradient end
                forecastMode: 'linear', // Default forecast mode
            }));

            console.log('Initialized Expense Sections:', this.expenseSections);
        }

        ,
        async submitInputs() {
            try {
                this.isLoading = true;

                // Create forecast requests for each expense section
                const forecastRequests = this.expenseSections.map((section) => {
                    // Find the corresponding regular item in historical data
                    const regularItem = this.historicalData.items.find(
                        (item) => item.internalAlias === section.internalAlias
                    );

                    // Find the growth item in historical data for the same section
                    const growthItem = this.historicalData.items.find(
                        (item) => item.internalAlias === `${section.internalAlias}Growth`
                    );

                    // Get the most recent year's data for the regular item
                    const mostRecentRegularValue = regularItem?.values
                        .map((value, index) => ({
                            year: this.historicalData.years[index],
                            value,
                        }))
                        .pop();

                    // Get the most recent year's data for the growth item
                    const mostRecentGrowthValue = growthItem?.values
                        .map((value, index) => ({
                            year: this.historicalData.years[index],
                            value,
                        }))
                        .filter((data) => data.value !== 0) // Exclude empty or zero values
                        .pop();

                    // Build the forecastItems array for the API request
                    const forecastItems = [];
                    if (mostRecentRegularValue) {
                        forecastItems.push({
                            lineItemId: regularItem.lineItemId,
                            internalAlias: regularItem.internalAlias,
                            unitType: regularItem.unitType,
                            historicalValues: [mostRecentRegularValue], // Include only the most recent year's value
                        });
                    }
                    if (mostRecentGrowthValue) {
                        forecastItems.push({
                            lineItemId: growthItem.lineItemId,
                            internalAlias: growthItem.internalAlias,
                            unitType: growthItem.unitType,
                            historicalValues: [mostRecentGrowthValue], // Include only the most recent year's value
                        });
                    }

                    // Return the forecast request object for this section
                    return {
                        forecastDuration: this.forecastDuration,
                        growthType: section.selectedGrowthType,
                        inputGrowthRate: Number(section.inputGrowthRate) || 0,
                        numberOfGrowthStages: section.numStages,
                        growthStages: section.stages.map((stage) => ({
                            rate: Number(stage.rate) || 0,
                            duration: Number(stage.duration) || 0,
                        })),
                        forecastMode: section.forecastMode || 'linear',
                        forecastItems,
                        gradientStartYear: Number(section.gradientStart) || 0,
                        gradientEndYear: Number(section.gradientEnd) || 0,
                        companyId: 1, // Replace with dynamic value if needed
                    };
                });

                console.log('Forecast Requests:', forecastRequests);

                // Submit the forecast requests to the backend
                const response = await fetch('http://localhost:8080/api/forecast/multiple', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(forecastRequests),
                });

                if (!response.ok) {
                    throw new Error(`Error saving forecast data: ${response.statusText}`);
                }

                // Parse the forecasted data
                //const forecastData = await response.json();
                //console.log('Forecasted Data:', forecastData);

                // Store the forecasted data for preview
                //this.forecastData = forecastData;
                this.showPreview();
            } catch (error) {
                console.error('Error in submitInputs:', error);
            } finally {
                this.isLoading = false;
            }
        }

        ,
        async showPreview() {
            try {
                if (this.forecastData && this.forecastData.length > 0) {
                    console.log('Using existing forecasted data for preview.');
                    return;
                }

                this.isLoading = true;

                const fetchForecastRequest = {
                    companyId: 1,
                    lineItemIds: [13, 12,16, 44, 45, 46],
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
        },
    },
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

.collapsible-section {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}
</style>