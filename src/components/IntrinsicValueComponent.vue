<template>
  <div class="intrinsic-value-container">
    <h1>Intrinsic Value</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="value-card">
      <p>{{ companyName }}'s Intrinsic Value is</p>
      <h2>USD {{ intrinsicValue }} Per Share</h2>
    </div>
    <button v-if="!loading" class="watchlist-button" @click="addToWatchlist">Save to Watch List</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      companyName: "", // Dynamically set from sessionStorage
      intrinsicValue: null, // Fetched from API
      loading: true, // Loading state
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

    // Fetch intrinsic value from API
    this.fetchIntrinsicValue();
  },
  methods: {
    async fetchIntrinsicValue() {
      try {
        const response = await fetch("http://localhost:8080/api/intrinsic/estimate");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.intrinsicValue = data.intrinsicvalue || "N/A";
      } catch (error) {
        console.error("Error fetching intrinsic value:", error);
        this.intrinsicValue = "Error";
      } finally {
        this.loading = false;
      }
    },
    addToWatchlist() {
      alert(`${this.companyName} has been added to your watchlist.`);
    },
  },
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

.watchlist-button {
  background-color: #2d89ef;
  color: white;
  border: none;
  border-radius: 10px; /* Increased border radius */
  padding: 15px 25px; /* Larger button */
  font-size: 1.2rem; /* Larger font size */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.watchlist-button:hover {
  background-color: #2163c7;
}
</style>
