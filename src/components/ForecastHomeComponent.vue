<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-company">{{ companyName }}</div>
      <nav class="sidebar-menu">
        <div class="progress-line"></div>
        <div
          v-for="(link, index) in navigationLinks"
          :key="link.to"
          class="link"
          :class="{
            'completed': isCompleted(index),
            'active': isActive(link.to),
            'disabled': isDisabled(index)
          }"
        >
          <div class="link-content">
            <div class="step-indicator">
              <div class="step-circle">
                <svg v-if="isCompleted(index)" class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="step-label">{{ index + 1 }}</div>
            </div>
            <span class="link-text">{{ link.text }}</span>
          </div>
        </div>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "ForecastHomeComponent",
  props: {
    companyName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      navigationLinks: [
        { to: "/forecast-home/revenue-forecast", text: "Revenue Forecasting" },
        { to: "/forecast-home/growth-margin-forecast", text: "Gross Margin" },
        { to: "/forecast-home/operating-expenses-forecast", text: "Operating Expenses" },
        { to: "/forecast-home/capital-spending-forecast", text: "Capital Spending" },
        { to: "/forecast-home/working-capital-forecast", text: "Working Capital" },
        { to: "/forecast-home/valuation-page", text: "Valuation" }
      ],
      completedSteps: 0,
      currentStep: 0
    };
  },
  methods: {
    isCompleted(index) {
      return index < this.completedSteps;
    },
    isActive(route) {
      return this.$route.path.includes(route);
    },
    isDisabled(index) {
      return index > this.currentStep;
    },
    updateCurrentStep() {
      const currentRouteIndex = this.navigationLinks.findIndex(link => this.$route.path.includes(link.to));
      if (currentRouteIndex !== -1) {
        this.currentStep = Math.max(this.currentStep, currentRouteIndex);
      }
    }
  },
  watch: {
    $route() {
      this.updateCurrentStep();
    }
  },
  mounted() {
    if (this.$route.path === '/forecast-home') {
      this.$router.push('/forecast-home/revenue-forecast');
    } else {
      this.updateCurrentStep();
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.sidebar {
  width: 280px;
  background-color: #f7f9fc;
  padding: 20px;
  position: fixed;
  height: 100%;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-company {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 30px;
  color: #004488;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}

.progress-line {
  position: absolute;
  left: 20px;
  top: 25px;
  bottom: 25px;
  width: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.link {
  display: flex;
  align-items: center;
  padding: 12px 10px 12px 0;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.link-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.step-indicator {
  position: relative;
  width: 36px;
  height: 36px;
  margin-right: 15px;
}

.step-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #e0e0e0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 0.8rem;
  color: #fff;
}

.link.completed .step-circle {
  background-color: #004488;
}

.link.completed::before {
  content: '';
  position: absolute;
  left: 20px;
  top: -17px;
  height: 25px;
  width: 2px;
  background-color: #004488;
  z-index: 1;
}

.link.active .step-circle {
  background-color: #7fa8d7;
  box-shadow: 0 0 0 4px rgba(0, 68, 136, 0.2);
}

.link.active .link-text {
  color: #004488;
  font-weight: 600;
}

.link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link.disabled .step-circle {
  background-color: #c0c0c0;
}

.link-text {
  font-weight: 500;
  transition: all 0.3s ease;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.content {
  margin-left: 280px;
  width: calc(100% - 280px);
  padding: 20px;
  background-color: #f5f8ff;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding-bottom: 10px;
  }

  .content {
    margin-left: 0;
    width: 100%;
  }

  .progress-line {
    display: none;
  }

  .link {
    padding-left: 10px;
    margin-bottom: 10px;
  }

  .link.completed::before {
    display: none;
  }

  .step-indicator {
    width: 30px;
    height: 30px;
  }

  .step-label {
    font-size: 0.7rem;
  }
}
</style>

