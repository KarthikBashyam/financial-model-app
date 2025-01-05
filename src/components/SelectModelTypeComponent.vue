<template>
  <div class="model-selection-page">
    <h1 class="company-header">{{ companyHeader }}</h1>
    <p class="model-selection-title">Choose the Type of Model to Build.</p>

    <div class="model-options">
      <button class="model-option" @click="selectModel('simple')">
        <h2>Simple Model</h2>
        <p>Forecast Annual Estimates with no segment-wise breakdown for revenue and gross profit.</p>
      </button>

      <button class="model-option" @click="selectModel('detailed')">
        <h2>Detailed Model</h2>
        <p>Ability to Forecast Quarterly and Annual and to choose between Segment-wise forecasts for Revenue and Gross Profit.</p>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  computed: {
    companyHeader() {
      const stockInfoString = sessionStorage.getItem('selectedStock');
      const stockInfo = JSON.parse(stockInfoString);
      return `We are building a model for ${stockInfo.companyName}.`;
    }
  },
  methods: {
    selectModel(modelType) {
      this.$router.push({ name: 'ForecastHome', params: { modelType: modelType, companyName: this.companyName } });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.model-selection-page {
  font-family: 'Roboto', sans-serif;
  color: #333;
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.company-header {
  font-size: 20px; /* Smaller font size for the company header */
  font-weight: 400;
  color: black;
  margin-bottom: 10px;
  text-align: center;
}

.model-selection-title {
  font-size: 24px;
  font-weight: 600;
  color: black;
  margin-bottom: 40px;
  text-align: center;
}

.model-options {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.model-option {
  width: 80%;
  max-width: 500px;
  background-color: #004488;
  color: white;
  border: none;
  padding: 25px 20px;
  margin: 15px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  text-align: center;
}

.model-option h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.model-option p {
  margin: 0;
  font-size: 16px;
}

.model-option:hover {
  background-color: #003366;
  transform: scale(1.05);
}
</style>
