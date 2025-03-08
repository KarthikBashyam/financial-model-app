<template>
    <div class="revenue-forecast">

        <div class="table-container">
            <div class="header">
                <h4>{{ companyHeader }}'s Historical Trend of Capital Expenditure</h4>
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
                    <thead>
                        <tr class="year-row">
                            <th>Year</th>
                            <th v-for="year in historicalData.years" :key="year">{{ year }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Capital Spending Row -->
                        <tr>
                            <td>Capital Expenditure</td>
                            <td v-for="(revenue, index) in historicalData.revenues" :key="'revenue-' + index">
                                {{ formatCurrency(revenue, selectedFormat) }}
                            </td>
                        </tr>
                        <!-- Capital Spending Growth Row -->
                        <tr>
                            <td>Capital Expenditure Growth</td>
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
                    <h4>Input Your Assumptions for Captital Expenditure's Growth Rate</h4>
                </div>

                <div class="growth-type-container">
                    <div class="growth-type">
                        <label><b>Type of Growth</b></label>
                        <div class="growth-buttons">
                            <button :class="{ active: selectedGrowthType === 'constant' }"
                                @click="changeGrowthType('constant')"
                                class="btn btn-secondary btn-radios">Constant</button>
                            <button :class="{ active: selectedGrowthType === 'gradient' }"
                                @click="changeGrowthType('gradient')" class="btn btn-secondary btn-radio"
                                :disabled="isSingleYearForecast">Gradient</button>
                            <button :class="{ active: selectedGrowthType === 'staged' }"
                                @click="changeGrowthType('staged')" class="btn btn-secondary btn-radio"
                                :disabled="isSingleYearForecast">Staged</button>
                            <button :class="{ active: selectedGrowthType === 'matchrevenuegrowth' }"
                                @click="changeGrowthType('matchrevenuegrowth')"
                                class="btn btn-secondary btn-radio">Match Revenue Growth</button>
                        </div>

                        <!-- Constant Growth -->
                        <div v-if="selectedGrowthType === 'constant'" class="form-row mt-20" id="constantRow"
                            style="display: flex;">
                            <div class="form-floating col-md-3">
                                <input type="text" v-model="inputGrowthRate" min="0" max="100"
                                    class="form-control flatAllow" />
                                <label for="growthRate">Input Growth Rate</label>
                                <span class="yRateTag">%</span>
                                <div class="invalid-feedback growthRateErr" style="display: none;"></div>
                            </div>
                        </div>

                        <!-- Gradient Growth -->
                        <div v-if="selectedGrowthType === 'gradient'" class="gradient-growth-input">
                            <div class="row mt-20 g-4">
                                <div class="col-md-3">
                                    <div class="form-floating">
                                        <input type="text" id="startYearRate" name="startYearRate"
                                            v-model="gradientStart" class="form-control floatAllow" />
                                        <label for="startYearRate">Beginning Year Rate</label>
                                        <span class="yRateTag">%</span>
                                        <span class="form-span">Year: {{ gradientStartYear }}</span>
                                        <div class="invalid-feedback startYearRateErr"></div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-floating">
                                        <input type="text" id="terminalYearRate" name="terminalYearRate"
                                            class="form-control floatAllow" v-model="gradientEnd" />
                                        <label for="terminalYearRate">Terminal Year Rate</label>
                                        <span class="yRateTag">%</span>
                                        <span class="form-span">Year: {{ gradientStartYear + forecastDuration - 1
                                            }}</span>
                                        <div class="invalid-feedback terminalYearRateErr"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-row text-start mt-20"><strong>Mode of Forecast</strong></div>
                            <div class="forecast-mode">
                                <div class="forecast-buttons">
                                    <button :class="{ active: forecastMode === 'linear' }"
                                        @click="forecastMode = 'linear'">Linear</button>
                                    <button :class="{ active: forecastMode === 'exponential' }"
                                        @click="forecastMode = 'exponential'">Exponential</button>
                                </div>
                            </div>
                        </div>

                        <!-- Staged Growth -->
                        <div v-if="selectedGrowthType === 'staged'" class="staged-growth-input">
                            <!-- Number of Stages Dropdown -->
                            <div class="form-row mt-20">
                                <div class="form-floating col-md-3">
                                    <select id="numStages" name="numStages" class="form-select" v-model="numStages"
                                        @change="updateStages">
                                        <option value="">Select Stages</option>
                                        <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                                    </select>
                                    <label for="numStages">Number of Stages</label>
                                    <div class="invalid-feedback numStagesErr"></div>
                                </div>
                            </div>

                            <!-- Stage Details -->
                            <div v-if="numStages" class="mt-20">
                                <div class="col-md-12" id="stagesTable" style="display: block;">
                                    <div v-for="(stage, index) in stages" :key="index"
                                        class="form-row align-items-center" :id="`stageRow${index}`">
                                        <!-- Stage Label -->
                                        <div class="row col-md-10 form-left">
                                            <div class="form-group col-md-1">
                                                <label class="stage-label">Stage {{ index + 1 }}:</label>
                                            </div>
                                            <!-- Growth Rate Input -->
                                            <div class="form-floating col-md-2">
                                                <input type="text" :id="`stageGrowthRate${index}`"
                                                    name="stageGrowthRate[]" class="form-control floatAllow"
                                                    v-model="stage.rate" />
                                                <label :for="`stageGrowthRate${index}`">Growth Rate</label>
                                                <span class="yRateTag">%</span>
                                                <div class="invalid-feedback" :class="`stageGrowthRate${index}Err`">
                                                </div>
                                            </div>

                                            <!-- Duration Dropdown -->
                                            <div class="form-floating col-md-2">
                                                <select :id="`stageDuration${index}`" name="stageDuration[]"
                                                    class="form-select duration" v-model="stage.duration"
                                                    @change="validateTotalDuration">
                                                    <option value="">Select years</option>
                                                    <option value=" 1">1 Years</option>
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
                                <div v-if="this.showErrorMessages && this.totalDurationExceeds" class="error-message">
                                    Total duration exceeds the forecast duration.</div>
                                <div v-if="this.showErrorMessages && this.totalDurationLess" class="error-message">Total
                                    duration is less than the forecast duration.</div>
                            </div>
                        </div>

                        <!-- Match Revenue Growth -->
                        <!-- Match Revenue Growth -->
                        <div v-if="selectedGrowthType === 'matchrevenuegrowth'"
                            class="match-revenue-growth-input mt-20">
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
        <div class="table-container" v-if="shouldShowPreview && forecastItems && forecastItems.length > 0">
            <div class="forecast-preview">
                <h4>Preview of Capital Spending Forecast</h4>
                <div class="revenue-table-container">
                    <table class="revenue-table">
                        <thead>
                            <tr class="year-row">
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
import { currencyMixin } from '@/mixins/currencyMixin';
export default {
    props: ['companyName'],
    mixins: [currencyMixin],
    created() {
        this.companyId = sessionStorage.getItem('companyId');
        this.fetchHistoricalData();
        this.loadUserSelections();
        this.checkPreviewStatus();
        //this.showPreview();
    },
    data() {
        const savedForecastDuration = sessionStorage.getItem('userSelections-foreCastDuration');
        return {
            shouldShowPreview: false,
            forecastData: [],
            forecastItems: [],
            isLoading: false,
            isOpen: false,
            selectedFormat: 'USD',
            selectedGrowthType: 'constant', // Initialize selectedGrowthType
            numStages: 1, // Initialize numStages
            stages: [
                { rate: null, duration: null },
                { rate: null, duration: null },
                { rate: null, duration: null }
            ],
            inputGrowthRate: 0, // Initialize inputGrowthRate            
            selectedCurrency: 'CAD', // Initialize selectedCurrency
            gradientStart: null, // Initialize gradientStart
            gradientEnd: null, // Initialize gradientEnd
            forecastDuration: savedForecastDuration ? JSON.parse(savedForecastDuration) : 3,
            growthType: 'constant',
            historicalData: {
                years: [],
                capitalExpenditure: [],
                grossMarginPercent: []
            },
            gradientStartYear: new Date().getFullYear(), // Current year dynamically set
            forecastMode: 'linear',
            forecastedRevenues: [],
            forecastedGrowthRates: [],
            forecastedYears: [],
            forecastedData: {
                years: [2024, 2025, 2026],
                revenues: [14.1, 16.5, 17.32],
                growthRates: [7, 4.3, 3],
            },
            totalDurationExceeds: false,
            totalDurationLess: false,
            hasUserInteracted: false,
            showErrorMessages: false,
        };
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // This runs after the route change, and the component is created
            const showPreview = sessionStorage.getItem(`showPreview_${to.name}`);
            if (showPreview === 'true') {
                vm.shouldShowPreview = true;
                vm.showPreview();
            }
        });
    },
    methods: {
        checkPreviewStatus() {
            const showPreview = sessionStorage.getItem(this.storageKey);
            this.shouldShowPreview = showPreview === 'true';
            if (this.shouldShowPreview) {
                this.showPreview();
            }
        },
        validateTotalDuration() {
            const totalDuration = this.stages.reduce((sum, stage) => sum + parseInt(stage.duration || 0), 0);
            this.isDurationSelected = this.stages.every(stage => stage.duration !== null && stage.duration !== '');
            this.totalDurationExceeds = this.isDurationSelected  && totalDuration > this.forecastDuration;
            this.totalDurationLess = this.isDurationSelected  && totalDuration < this.forecastDuration;
            this.hasUserInteracted = true;
        },
        formatValueByType(value, type) {
            if (type === 'PERCENTAGES') {
                return this.formatGrowthRate(value) + '%';
            } else if (type === 'DOLLARS') {
                return this.formatRevenue(value, this.selectedFormat);
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
                this.forecastDuration = parsedSelections.forecastDuration || 1;
                this.selectedCurrency = parsedSelections.currency || 'CAD';

                if (this.selectedGrowthType === 'gradient') {
                    this.gradientStart = parsedSelections.gradientStart || null;
                    this.gradientEnd = parsedSelections.gradientEnd || null;
                    this.forecastMode = parsedSelections.forecastMode || 'linear';
                } else if (this.selectedGrowthType === 'constant') {
                    this.inputGrowthRate = parsedSelections.inputGrowthRate || 0;
                } else if (this.selectedGrowthType === 'staged') {
                    this.numStages = parsedSelections.numStages || 1;
                    this.stages = parsedSelections.stages || [{ rate: null, duration: null }];
                }
            }
        },
        saveUserSelections() {
            let selectedOptions = {
                growthType: this.selectedGrowthType,
                forecastDuration: this.forecastDuration,
            };

            if (this.selectedGrowthType === 'gradient') {
                selectedOptions.gradientStart = this.gradientStart;
                selectedOptions.gradientEnd = this.gradientEnd;
                selectedOptions.forecastMode = this.forecastMode;
            } else if (this.selectedGrowthType === 'constant') {
                selectedOptions.inputGrowthRate = this.inputGrowthRate;
            } else if (this.selectedGrowthType === 'staged') {
                selectedOptions.numStages = this.numStages;
                selectedOptions.stages = this.stages;
            }

            sessionStorage.setItem('userSelections-capitalSpendingForecast', JSON.stringify(selectedOptions));
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
            const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/historical`;
            const requestBody = {
                companyId: this.companyId, // Replace with the actual companyId dynamically if needed
                lineItemIds: [46, 70] // Replace with the actual lineItemIds if needed
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
                    const revenueItem = data.find(item => item.lineItemId === 46);
                    this.historicalData.revenues = years.map(year => {
                        const annualValue = revenueItem.annualValues.find(av => av.year === year);
                        return annualValue ? annualValue.value : 0; // Default to 0 if value for the year is missing
                    });

                    // Map values for Revenue Growth
                    const growthItem = data.find(item => item.lineItemId === 70);
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
            this.loadUserSelections(); // Load user selections when the component is mounted
        },

        async submitInputs() {
            try {
                this.showErrorMessages = true;
                this.validateTotalDuration();
                if (this.totalDurationExceeds || this.totalDurationLess) {
                    return;
                }
                // Prepare the forecast request
                this.isLoading = true;
                this.saveUserSelections();
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
                    companyId: this.companyId,
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
                const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/forecast/single`;
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(forecastRequest)
                })
                    .then(response => {
                        if (response.ok) {
                            sessionStorage.setItem(this.storageKey, 'true');
                            this.shouldShowPreview = true;
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
                    lineItemIds: [46, 70],
                };

                const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/forecasted`;
                const response = await fetch(url, {
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
            this.saveUserSelections(); // Save user selections before navigating
            this.$router.push({ name: 'WorkingCapitalForecast' });
        }
    },
    computed: {
        isSingleYearForecast() {
            return this.forecastDuration == 1;
        },
        storageKey() {
            return `showPreview_${this.$route.name}`;
        },
        endYear() {
            return this.gradientStartYear + this.forecastDuration;
        },
        isInputsValid() {
            // Validate inputs based on the selected growth type
            if (this.selectedGrowthType === 'constant') {
                return this.inputGrowthRate !== null && this.forecastDuration > 0;
            } else if (this.selectedGrowthType === 'gradient') {
                return this.gradientStart !== null && this.gradientEnd !== null && this.forecastDuration > 0;
            } else if (this.selectedGrowthType === 'staged') {
                return this.numStages > 0 && this.stages.every(stage => stage.rate !== null && stage.duration !== null) && this.forecastDuration > 0 && !this.totalDurationExceeds 
                && !this.totalDurationLess;
            } else if (this.selectedGrowthType === 'matchrevenuegrowth') {
                return this.forecastDuration > 0; // Example validation
            }
            return false; // Default to invalid for other types
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
    padding: 12px 24px;
    border: none;
    background-color: #0056b3;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
}

button:hover {
    background-color: #004494;
    transform: translateY(-1px);
}

button:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
    transform: none;
}


.currency-selector {
    display: flex;
    align-items: center;
}

.growth-buttons button {
    background-color: #f0f4ff;
    border: 1px solid #d0d9ff;
    color: #0056b3;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.growth-buttons button.active {
    background-color: #0056b3;
    border-color: #0056b3;
    color: #fff;
}

.growth-buttons button:hover {
    background-color: #d0d9ff;
    color: #0056b3;
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

.form-floating {
    position: relative;
}

.form-floating label {
    position: absolute;
    top: 0.5rem;
    left: 0.75rem;
    font-size: 0.875rem;
    color: #6c757d;
    transition: all 0.2s;
}

.form-floating .form-control {
    padding: 1.5rem 0.75rem 0.5rem;
}

.yRateTag {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    color: #6c757d;
}

.stage-label {
    font-weight: bold;
    margin-right: 1rem;
}

.mt-20 {
    margin-top: 20px;
}

.invalid-feedback {
    display: none;
    color: red;
}

.form-control.is-invalid+.invalid-feedback {
    display: block;
}

.year-row {
    background-color: #ECECEC;
    /* Adjust the background color as needed */
    font-weight: bold;
}

.growth-buttons button {
    margin-right: 10px;
    /* Add spacing between buttons */
}

.error-message {
    color: red;
    font-weight: bold;
    margin-top: 10px;
}
</style>