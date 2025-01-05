<template>
  <div class="landing-page">
    <div class="white-card">
      <h1>Let's Build a Financial Model.</h1>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Choose a company to build a model for"
          @input="filterCompanies"
        />
        <div v-if="showDropdown && filteredStocks.length" class="dropdown">
          <div
            v-for="stock in filteredStocks"
            :key="stock.symbol"
            class="dropdown-item"
            @click="selectStock(stock)"
          >
            <div class="company-name">{{ stock.companyName }}</div>
            <div class="company-info">{{ stock.exchangeName }}: {{ stock.symbol }}</div>
          </div>
        </div>
      </div>

      <div class="button-container">
        <button
          class="continue-button"
          :disabled="!selectedStock"
          @click="onContinue"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      selectedStock: null,
      stocks: [],
      showDropdown: false,
    };
  },
  computed: {
    filteredStocks() {
      return this.stocks.filter(stock =>
        stock.companyName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    fetchStocks() {
      fetch('https://piappservice-cwg7evftcpbxfwev.canadacentral-01.azurewebsites.net/api/companies')
        .then(response => response.json())
        .then(data => {
          this.stocks = data;
        })
        .catch(error => {
          console.error('Error fetching stocks:', error);
        });
    },
    onContinue() {
      if (this.selectedStock) {
        sessionStorage.setItem('selectedStock', JSON.stringify(this.selectedStock));
        this.$router.push({ name: 'SelectModelType' });
      }
    },
    selectStock(stock) {
      this.searchQuery = stock.companyName;
      this.selectedStock = stock;
      this.showDropdown = false;
    },
    filterCompanies() {
      this.showDropdown = this.searchQuery.length > 0;
    },
  },
  created() {
    this.fetchStocks();
  },
};
</script>

<style scoped>
.landing-page {
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

.search-container {
  position: relative;
  width: 100%;
}

input[type='text'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #d6e4f2;
  border-radius: 5px;
  font-size: 1rem;
}

.dropdown {
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #d6e4f2;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fb;
}

.company-name {
  font-weight: bold;
  font-size: 1rem;
  color: #34495e;
}

.company-info {
  font-size: 0.9rem;
  color: #6c757d;
}

.button-container {
  margin-top: 30px;
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
