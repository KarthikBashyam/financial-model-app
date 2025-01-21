<template>
    <div class="container">
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
                        <div v-else-if="selectedApproach === 'terminalEVEBITDAMultiple'" class="form-floating col-md-3 mb-3">
                            <input type="text" v-model="terminalEVEBITDAMultiple" min="0" max="100"
                                class="form-control flatAllow" id="terminalEVEBITDAMultiple"
                                placeholder="Terminal EV/EBITDA Multiple" required />
                            <label for="terminalEVEBITDAMultiple">Terminal EV/EBITDA Multiple*</label>
                            <div class="invalid-feedback" style="display: none;">Invalid Terminal EV/EBITDA Multiple</div>
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
export default {
    data() {
        return {
            costOfCapital: '',
            terminalGrowthRate: '',
            terminalEVEBITDAMultiple: '',
            selectedApproach: ''
        };
    },
    mounted() {
        // Retrieve the stored assumptions from sessionStorage
        const storedAssumptions = JSON.parse(sessionStorage.getItem('valuationAssumptions'));
        if (storedAssumptions) {
            this.costOfCapital = storedAssumptions.costOfCapital || '';
            this.terminalGrowthRate = storedAssumptions.terminalGrowthRate || '';
            this.terminalEVEBITDAMultiple = storedAssumptions.terminalEVEBITDAMultiple || '';
            this.selectedApproach = storedAssumptions.selectedApproach || '';
        }
    },
    methods: {
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
</style>