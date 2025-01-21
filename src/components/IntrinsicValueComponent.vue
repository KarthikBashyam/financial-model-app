<template>
  <div class="intrinsic-value-container">    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="value-card">
      <p>{{ companyName }}'s Intrinsic Value is</p>
      <h2>USD {{ intrinsicValue }} Per Share</h2>
    </div>
    <button v-if="!loading" class="watchlist-button" @click="addToWatchlist">Save to Watch List</button>
    <button v-if="!loading" class="download-button" @click="downloadExcel">Download Calculations</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      intrinsicValue: '',
      loading: true,
      companyId: '', // Add companyId to the data properties
      companyName: "", // Dynamically set from sessionStorage
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
      const storedAssumptions = JSON.parse(sessionStorage.getItem('valuationAssumptions'));

      // Retrieve companyId from sessionStorage or another source
      this.companyId = sessionStorage.getItem('companyId') || '';

      // Create a new object with only the fields present in the DTO
      const assumptions = {
        companyId: parseInt(this.companyId),
        forecastDuration: parseInt(sessionStorage.getItem('forecastDuration')) || 5, // Default to 5 if not set
        selectedFinalApproach: storedAssumptions.selectedApproach,
        costOfCapital: parseFloat(storedAssumptions.costOfCapital),
        terminalGrowthRate: parseFloat(storedAssumptions.terminalGrowthRate),
        terminalEVEBITDAMultiple: parseFloat(storedAssumptions.terminalEVEBITDAMultiple)
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
      this.intrinsicValue = responseData.intrinsicvalue || "N/A";
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
        // Retrieve companyId from sessionStorage or another source
        const companyId = sessionStorage.getItem('companyId') || '';

        // Prepare the request URL with query parameters
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
    }
  }
};
</script>

<style scoped>
.intrinsic-value-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #e7eefc;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  font-size: 2.5rem; /* Increased size */
  color: #2c3e50;
  margin-bottom: 30px;
}

.loading {
  font-size: 1.5rem;
  color: #888;
}

.value-card {
  background-color: #f7f9fe;
  border: 1px solid #d6e4f2;
  border-radius: 15px; /* More rounded corners */
  padding: 30px; /* Increased padding */
  width: 80%; /* Increased width */
  max-width: 800px; /* Increased max width */
  height: 300px; /* Fixed height */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15); /* Slightly heavier shadow */
  margin-bottom: 30px; /* More margin */
}

.value-card p {
  font-size: 1.5rem; /* Larger font size */
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.value-card h2 {
  font-size: 2.5rem; /* Larger font size for value */
  color: #34495e;
  margin: 0;
}

.watchlist-button, .download-button {
  background-color: #2d89ef;
  color: white;
  border: none;
  border-radius: 10px; /* Increased border radius */
  padding: 15px 25px; /* Larger button */
  font-size: 1.2rem; /* Larger font size */
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px; /* Add margin between buttons */
}

.watchlist-button:hover, .download-button:hover {
  background-color: #2163c7;
}
</style>
