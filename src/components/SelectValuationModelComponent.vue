<template>
    <div class="valuation-model-page">
        <div class="white-card">
            <h1>Choose the Valuation Model</h1>
            <p>
                For estimating the intrinsic value of
                <a href="#" @click.prevent="viewCompanyDetails">{{ companyName }}</a>.
            </p>
            <div class="dropdown-container">
                <label for="valuation-model">Valuation Model</label>
                <select id="valuation-model" v-model="selectedModel" @change="handleModelSelection">
                    <option value="" disabled>Select Below</option>
                    <option value="EV/EBITDA Multiple">EV/EBITDA Multiple</option>
                    <option value="DCF Method">DCF Method</option>
                </select>
            </div>

            <!-- DCF Method Additional Inputs -->
            <div v-if="selectedModel === 'DCF Method'" class="dcf-options">
                <div class="input-group">
                    <label for="forecast-duration">Forecast Duration (DCF)</label>
                    <div class="dual-input-container">
                        <!-- Text Box for Input -->
                        <input type="text" id="forecast-duration" v-model="forecastDurationInput"
                            placeholder="Enter forecast duration (years)" @blur="validateForecastDuration" />
                        <!-- Slider for Input -->
                        <input type="range" min="1" max="10" step="1" v-model="forecastDuration"
                            @input="syncTextInputWithSlider" />
                    </div>
                    <span>{{ forecastDuration ? `${forecastDuration} Years` : "" }}</span>
                </div>
                <div class="input-group">
                    <label for="cost-of-capital">Cost of Capital</label>
                    <div class="input-with-symbol">
                        <input type="number" id="cost-of-capital" v-model.number="costOfCapital" step="0.1" min="0"
                            placeholder="Enter cost of capital" />
                        <span class="symbol">%</span>
                    </div>
                </div>
            </div>

            <button :disabled="!selectedModel" class="continue-button" @click="proceedToNextStep">
                Continue
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            companyName: "", // Dynamically set from sessionStorage
            selectedModel: "", // Stores the selected valuation model
            forecastDuration: 5, // Default forecast duration for DCF Method (for slider)
            forecastDurationInput: "5", // Text box value for forecast duration
            costOfCapital: 3.1, // Default cost of capital
        };
    },
    mounted() {
        // Fetch companyName from sessionStorage
        const stockInfoString = sessionStorage.getItem("selectedStock");
        if (stockInfoString) {
            const stockInfo = JSON.parse(stockInfoString);
            this.companyName = stockInfo.companyName || "Unknown Company";
        } else {
            this.companyName = "Unknown Company";
        }
    },
    methods: {
        handleModelSelection() {
            console.log(`Selected model: ${this.selectedModel}`);
        },
        proceedToNextStep() {
            if (this.selectedModel === "DCF Method") {
                console.log(`Forecast Duration: ${this.forecastDuration} years`);
                console.log(`Cost of Capital: ${this.costOfCapital}%`);
            }
            //alert(`Proceeding with: ${this.selectedModel}`);
            this.submitPreferences();
            sessionStorage.setItem('userSelections-foreCastDuration', JSON.stringify(this.forecastDuration));
            this.$router.push({ name: 'ForecastHome' });
            // Add logic to navigate to the next step
        },
        viewCompanyDetails() {
            alert("Navigate to company details page");
        },
        validateForecastDuration() {
            // Ensure the text input value is valid after user finishes typing
            let value = parseInt(this.forecastDurationInput, 10);

            if (this.forecastDurationInput.trim() === "") {
                // Allow empty input, do not update the slider yet
                this.forecastDuration = "";
                return;
            }

            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) value = 10;

            this.forecastDuration = value; // Sync slider with text box
            this.forecastDurationInput = value.toString(); // Update text box
        },
        syncTextInputWithSlider() {
            // Sync text box with slider value
            this.forecastDurationInput = this.forecastDuration ? this.forecastDuration.toString() : "";
        },
        async submitPreferences() {
            try {
                this.preferences = {
                    modelType: this.selectedModel,
                    costOfCapital: this.costOfCapital,
                    forecastDuration: this.forecastDuration,
                };

                const response = await fetch("http://localhost:8080/api/user/preferences?userId=1", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.preferences),
                });

                if (response.ok) {
                    //const result = await response.json();
                    //console.log("Preferences saved successfully:", result);
                    //alert("Preferences saved successfully!");
                } else {
                    console.error("Error saving preferences:", response.statusText);
                    alert("Failed to save preferences.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while saving preferences.");
            }
        }
    },
};
</script>

<style scoped>
.valuation-model-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #e7eefc;
    font-family: Arial, sans-serif;
}

.white-card {
    background-color: white;
    border-radius: 15px;
    padding: 40px;
    width: 700px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
    text-align: center;
}

h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 20px;
}

p {
    font-size: 1rem;
    color: #6c757d;
    margin-bottom: 20px;
}

p a {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
}

p a:hover {
    text-decoration: underline;
}

.dropdown-container {
    width: 100%;
    margin-bottom: 20px;
}

label {
    display: block;
    font-size: 1rem;
    color: #34495e;
    margin-bottom: 5px;
    text-align: left;
}

select {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #d6e4f2;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease;
}

select:focus {
    outline: none;
    border-color: #2d89ef;
}

.dcf-options {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f9fb;
    border: 1px solid #d6e4f2;
    border-radius: 10px;
}

.dual-input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

input[type="range"] {
    width: 100%;
}

input[type="text"],
input[type="number"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #d6e4f2;
    border-radius: 5px;
    font-size: 1rem;
}

.input-with-symbol {
    display: flex;
    align-items: center;
    position: relative;
}

.input-with-symbol input[type="number"] {
    padding-right: 2rem;
}

.input-with-symbol .symbol {
    position: absolute;
    right: 10px;
    color: #6c757d;
    font-size: 1rem;
}

span {
    margin-top: 5px;
    font-size: 1rem;
    color: #34495e;
}

.continue-button {
    background-color: #2d89ef;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
}

.continue-button:disabled {
    background-color: #d6e4f2;
    cursor: not-allowed;
}

.continue-button:hover:not(:disabled) {
    background-color: #2163c7;
}
</style>