<template>
    <div class="revenue-forecast">

        <div class="table-container">
            <div class="header">
                <h4>{{ companyHeader }}'s Historical Trend of Working Capital</h4>
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
                        <tr class="year-row">
                            <th>Year</th>
                            <th v-for="year in historicalData.years" :key="'year-' + year">{{ year }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamically loop through historicalData.items -->
                        <tr v-for="item in historicalData.items" :key="item.lineItemId">
                            <td>{{ item.name }}</td>
                            <td v-for="(value, index) in item.values" :key="'value-' + index">
                                {{ formatValueByType(value, item.unitType) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <div class="table-container">
            <div class="forecast-assumptions">
                <div class="header">
                    <h4>Input Your Growth Rate Assumptions</h4>
                </div>

                <div class="growth-type-container" v-for="(section, index) in expenseSections"
                    :key="section.internalAlias">
                    <div><b>{{ section.name }}</b></div>

                    <div class="growth-type">
                        <label>Type of Forecast Method</label>
                        <div class="growth-buttons mt-20">
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
                        <!-- <div v-if="section.selectedGrowthType === 'constant'" class="growth-input child-container">
                            <label>Input Growth Rate</label>
                            <input type="number" v-model="section.inputGrowthRate" min="0" max="100"
                                class="growth-rate-input"
                                @input="updateInputGrowthRate(index, section.inputGrowthRate)" /> %
                        </div> -->
                        <div v-if="section.selectedGrowthType === 'constant'" class="form-row mt-20" id="constantRow"
                            style="display: flex;">
                            <div class="form-floating col-md-3">
                                <input type="text" v-model="section.inputGrowthRate" min="0" max="100"
                                    class="form-control flatAllow"
                                    @input="updateInputGrowthRate(index, section.inputGrowthRate)" />
                                <label for="grownthRate">Input Growth Rate</label>
                                <span class="yRateTag">%</span>
                                <div class="invalid-feedback growthRateErr" style="display: none;"></div>
                            </div>
                        </div>

                        <!-- Gradient Growth -->
                        <!-- <div v-if="section.selectedGrowthType === 'gradient'" class="gradient-growth-input">
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
                        </div> -->
                        <div v-if="section.selectedGrowthType === 'gradient'">
                            <!-- Row for Gradient Input -->
                            <div class="row mt-20 g-4">
                                <div class="col-md-3">
                                    <div class="form-floating">
                                        <input type="text" id="startYearRate" name="startYearRate"
                                            v-model="section.gradientStart" class="form-control floatAllow" />
                                        <label for="startYearRate">Beginning Year Rate</label>
                                        <span class="yRateTag">%</span>
                                        <span class="form-span">Year: {{ nextYear }}</span>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-floating">
                                        <input type="text" id="terminalYearRate" name="terminalYearRate"
                                            v-model="section.gradientEnd" class="form-control floatAllow" />
                                        <label for="terminalYearRate">Terminal Year Rate</label>
                                        <span class="yRateTag">%</span>
                                        <span class="form-span">
                                            Year: {{ nextYear + forecastDuration - 1 }}
                                        </span>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Mode of Forecast -->
                            <div class="form-row text-start mt-20">
                                <strong>Mode of Forecast</strong>
                            </div>
                            <div class="forecast-mode">
                                <div class="forecast-buttons">
                                    <button :class="{ active: section.forecastMode === 'linear' }"
                                        @click="setForecastMode(index, 'linear')" class="btn btn-secondary btn-radios">
                                        Linear
                                    </button>
                                    <button :class="{ active: section.forecastMode === 'exponential' }"
                                        @click="setForecastMode(index, 'exponential')"
                                        class="btn btn-secondary btn-radios">
                                        Exponential
                                    </button>
                                </div>
                            </div>
                        </div>



                        <!-- Staged Growth -->
                        <!-- <div v-if="section.selectedGrowthType === 'staged'" class="staged-growth-input">
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
                        </div> -->
                        <div v-if="section.selectedGrowthType === 'staged'" class="staged-growth-input">
                            <div class="row" id="stagedRow" style="display: flex;">
                                <div class="form-row">
                                    <div class="form-floating col-md-4">
                                        <select id="numStages" name="numStages" class="form-select"
                                            v-model="section.numStages" @change="updateStages(index)">
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
                            <div v-if="section.numStages" class="mt-20">
                                <div class="col-md-12" id="stagesTable" style="display: block;">
                                    <div v-for="(stage, stageIndex) in section.stages" :key="stageIndex"
                                        class="form-row align-items-center" :id="`stageRow${stageIndex}`">
                                        <!-- Stage Label -->
                                        <div class="row col-md-10 form-left">
                                            <div class="form-group col-md-1">
                                                <label class="stage-label">Stage {{ stageIndex + 1 }}:</label>
                                            </div>
                                            <!-- Growth Rate Input -->
                                            <div class="form-floating col-md-2">
                                                <input type="text" :id="`stageGrowthRate${stageIndex}`"
                                                    name="stageGrowthRate[]" class="form-control floatAllow"
                                                    v-model="stage.rate" />
                                                <label :for="`stageGrowthRate${stageIndex}`">Growth Rate</label>
                                                <span class="yRateTag">%</span>
                                                <div class="invalid-feedback"
                                                    :class="`stageGrowthRate${stageIndex}Err`">
                                                </div>
                                            </div>

                                            <!-- Duration Dropdown -->
                                            <div class="form-floating col-md-2">
                                                <select :id="`stageDuration${stageIndex}`" name="stageDuration[]"
                                                    class="form-select duration" v-model="stage.duration">
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
                                                <label :for="`stageDuration${stageIndex}`">Duration</label>
                                                <div class="invalid-feedback" :class="`stageDuration${stageIndex}Err`">
                                                </div>
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
        <!-- Preview section-->
        <div class="table-container" v-if="forecastItems && forecastItems.length > 0">
            <div class="forecast-preview">
                <h4>Preview of Working Capital Growth Forecast</h4>
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
export default {
    props: ['companyName'],
    created() {
        this.companyId = sessionStorage.getItem('companyId');
        this.fetchHistoricalData().then(() => {
            this.initializeExpenseSections();
        });
        this.showPreview()
        this.loadUserSelections();
    },

    data() {
        const savedForecastDuration = sessionStorage.getItem('userSelections-foreCastDuration');
        return {
            nextYear: null,
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
            companyId: sessionStorage.getItem('companyId'),
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
            if (stockInfoString) {
                const stockInfo = JSON.parse(stockInfoString);
                return `${stockInfo.companyName}`;
            }
            return '';
        }
    }
    ,
    methods: {
        updateStages(sectionIndex) {
            const section = this.expenseSections[sectionIndex];
            if (section.numStages && section.numStages > 0) {
              // Populate the stages array based on the selected number of stages
              section.stages = Array.from({ length: section.numStages }, () => ({ rate: 0, duration: 0 }));
            } else {
              // Clear stages if no valid selection is made
              section.stages = [];
            }
          },
        loadUserSelections() {
            const savedSelections = sessionStorage.getItem('userSelections-workingCapitalForecast');
            if (savedSelections) {
                const parsedSelections = JSON.parse(savedSelections);
                this.expenseSections.forEach((section) => {
                    const savedSection = parsedSelections.find((s) => s.name === section.name);
                    if (savedSection) {
                        section.selectedGrowthType = savedSection.growthType;
                        section.forecastDuration = savedSection.forecastDuration;

                        if (savedSection.growthType === 'gradient') {
                            section.gradientStart = savedSection.gradientStart || 0;
                            section.gradientEnd = savedSection.gradientEnd || 0;
                        } else if (savedSection.growthType === 'constant') {
                            section.inputGrowthRate = savedSection.inputGrowthRate || 0;
                        } else if (savedSection.growthType === 'staged') {
                            section.numStages = savedSection.numStages || 1;
                            section.stages = savedSection.stages || [{ rate: 0, duration: 0 }];
                        }
                    }
                });
            }
        },
        saveUserSelections() {
            const selectedOptions = this.expenseSections.map((section) => {
                const option = {
                    name: section.name, // Name of the expense
                    growthType: section.selectedGrowthType, // Selected growth type
                    forecastDuration: this.forecastDuration, // Forecast duration
                };

                if (section.selectedGrowthType === 'gradient') {
                    option.gradientStart = section.gradientStart;
                    option.gradientEnd = section.gradientEnd;
                } else if (section.selectedGrowthType === 'constant') {
                    option.inputGrowthRate = section.inputGrowthRate;
                } else if (section.selectedGrowthType === 'staged') {
                    option.numStages = section.numStages;
                    option.stages = section.stages.map((stage) => ({
                        rate: stage.rate,
                        duration: stage.duration,
                    }));
                }

                return option;
            });

            sessionStorage.setItem('userSelections-workingCapitalForecast', JSON.stringify(selectedOptions));
        },
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
            this.saveUserSelections(); // Save user selections before navigating
            this.$router.push({ name: 'ValuationPage' });
        },
        goBack() {
            this.$router.go(-1);
        },
        async initializePage() {
            try {
                this.isLoading = true;
                await this.fetchHistoricalData();
                this.initializeExpenseSections();
                this.loadUserSelections()
                console.log('Page Initialized Successfully');
            } catch (error) {
                console.error('Error initializing the page:', error);
            } finally {
                this.isLoading = false;
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
        updateInputGrowthRate(index, value) {
            // Update the input growth rate for the given section
            if (this.expenseSections[index]) {
                this.expenseSections[index].inputGrowthRate = value;
            } else {
                console.warn(`No section found at index ${index}`);
            }
        },
        async fetchHistoricalData() {
            const url = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/historical`;
            const requestBody = {
                companyId: this.companyId, // Replace with dynamic value if needed
                lineItemIds: [26,27,34,71,72,73], // Main and growth item IDs
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

                // Sort data to show SG&A, R&D, and then Other Operating Expenses, each followed by its growth rate
                const sortedData = [];
                const order = [
                    { id: 27, growthId: 72 }, // SG&A Expenses and its growth rate
                    { id: 26, growthId: 71 }, // R&D Expenses and its growth rate
                    { id: 34, growthId: 73 }, // Other Operating Expenses and its growth rate
                ];

                order.forEach(({ id, growthId }) => {
                    const mainItem = data.find(item => item.lineItemId === id);
                    const growthItem = data.find(item => item.lineItemId === growthId);
                    if (mainItem) sortedData.push(mainItem);
                    if (growthItem) sortedData.push(growthItem);
                });
                this.nextYear = years[years.length - 1] + 1;

                // Map the sorted data to historicalData.items
                this.historicalData.items = sortedData.map((item) => ({
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
        },
        initializeExpenseSections() {
            // Ensure historicalData is populated before mapping
            if (!this.historicalData.items || this.historicalData.items.length === 0) {
                console.warn('Historical data is not loaded yet.');
                return;
            }

            // Filter out growth items (i.e., items where internalAlias ends with "Growth")
            const regularItems = this.historicalData.items.filter(
                (item) => !item.internalAlias.endsWith('percent')
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
                this.saveUserSelections();
                // Create forecast requests for each expense section
                const forecastRequests = this.expenseSections.map((section) => {
                    // Find the corresponding regular item in historical data
                    const regularItem = this.historicalData.items.find(
                        (item) => item.internalAlias === section.internalAlias
                    );

                    // Find the growth item in historical data for the same section
                    const growthItem = this.historicalData.items.find(
                        (item) => item.internalAlias === `${section.internalAlias}_growth_percent`
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
                        companyId: this.companyId
                    };
                });

                console.log('Forecast Requests:', forecastRequests);

                // Submit the forecast requests to the backend
                const forecastUrl = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/forecast/multiple`;
                const response = await fetch(forecastUrl, {
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
        },
        async showPreview() {
            try {
                if (this.forecastData && this.forecastData.length > 0) {
                    console.log('Using existing forecasted data for preview.');
                    return;
                }

                this.isLoading = true;

                const fetchForecastRequest = {
                    companyId: this.companyId,
                    lineItemIds: [26,27,34,71,72,73],
                    forecastStartYear: this.historicalData.years[this.historicalData.years.length - 1] + 1,
                };
                const previewUrl = `${process.env.VUE_APP_PI_APP_SERVICE_BASE_URL}/api/lineItems/forecasted`;
                const response = await fetch(previewUrl, {
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
    mounted() {
        this.initializePage();
        this.loadUserSelections();
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

.year-row {
    background-color: #ECECEC;
    /* Adjust the background color as needed */
    font-weight: bold;
}

.mt-20 {
    margin-top: 20px;
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
</style>