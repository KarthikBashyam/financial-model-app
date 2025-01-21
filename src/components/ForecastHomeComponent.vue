<template>
  <div class="layout">
    <!-- Sidebar with navigation links -->
    <aside class="sidebar">
      <div class="sidebar-company">{{ companyName }}</div>
      <div class="sidebar-menu">
        <!-- Ensure correct paths for your working URLs -->
        <router-link
          to="/forecast-home/revenue-forecast"
          class="link"
          exact
          active-class="active-link"
        >
          Revenue Forecasting
        </router-link>

        <router-link
          to="/forecast-home/growth-margin-forecast"
          class="link"
          exact
          active-class="active-link"
        >
          Gross Margin
        </router-link>

        <router-link
          to="/forecast-home/operating-expenses-forecast"
          class="link"
          exact
          active-class="active-link"
        >
          Operating Expenses
        </router-link>

        <router-link
          to="/forecast-home/capital-spending-forecast"
          class="link"
          exact
          active-class="active-link"
        >
          Capital Spending
        </router-link>

        <router-link
          to="/forecast-home/working-capital-forecast"
          class="link"
          exact
          active-class="active-link"
        >
          Working Capital
        </router-link>

        <router-link
          to="/forecast-home/valuation-page"
          class="link"
          exact
          active-class="active-link"
        >
          Valuation
        </router-link>
      </div>
    </aside>

    <!-- Main content area -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "ForecastHomeComponent",
  props: ["companyName"],
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px; /* Fixed width */
  background-color: #f7f9fc; /* Light sidebar background */
  padding: 20px;
  margin-right: 0; /* Remove margin to create merging effect */
  position: fixed; /* Fixed sidebar */
  height: 100%; /* Full height */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Add subtle shadow */
}

.sidebar-company {
  font-weight: bold;
  font-size: 1.25rem; /* Larger font for the company name */
  margin-bottom: 30px;
  color: #004488; /* Brand color */
}

.sidebar-menu .link {
  display: block;
  padding: 15px 10px;
  text-decoration: none;
  color: #000;
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  margin-bottom: 5px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.sidebar-menu .link:hover {
  background-color: #e0e7ff; /* Hover background */
  color: #004488; /* Hover font color */
}

/* Highlight the active link */
.sidebar-menu .active-link {
  background-color: #f5f8ff; /* Match background to the main content */
  color: #004488;
  font-weight: bold;
  border-left: 5px solid #004488; /* Left border for active indicator */
  border-radius: 0 0 0 0; /* Remove border-radius for merging effect */
}

/* Main content and active link should have the same background */
.content {
  margin-left: 270px; /* Leave space for the fixed sidebar */
  width: calc(100% - 270px); /* Main content width excluding sidebar */
  padding: 20px;
  background-color: #f5f8ff; /* Same background as active link */
  overflow-y: auto;
}
</style>
