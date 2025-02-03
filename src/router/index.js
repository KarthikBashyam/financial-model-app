import { createRouter, createWebHistory } from 'vue-router';
import LandingPageComponent from '@/components/FinancialModelBuilderHome';
import ForecastHomeComponent from '@/components/ForecastHomeComponent.vue';
import RevenueForecastComponent from '@/components/RevenueForecastComponent.vue';
import GrowthMarginForecastComponent from '@/components/GrowthMarginForecastComponent.vue';
import OperatingExpensesForecastComponent from '@/components/OperatingExpensesForecastComponent.vue';
import CapitalSpendingForecastComponent from '@/components/CapitalSpendingForecastComponent.vue';
import WorkingCapitalForecastComponent from '@/components/WorkingCapitalForecastComponent.vue';
import IntrinsicValueComponent from '@/components/IntrinsicValueComponent.vue';
import SelectValuationModelComponent from '@/components/SelectValuationModelComponent.vue';
import ValuationComponent from '@/components/ValuationComponent.vue';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPageComponent
  },
  {
    path: '/model-selection',
    name: 'SelectModelType',
    component: SelectValuationModelComponent,
    props: true
  },
  {
    path: '/forecast-home',
    name: 'ForecastHome',
    component: ForecastHomeComponent,
    props: true,
    children: [
      {
        path: '',
        redirect: { name: 'RevenueForecast' }
      },
      {
        path: 'revenue-forecast',
        name: 'RevenueForecast',
        component: RevenueForecastComponent,
        props: true
      },
      {
        path: 'growth-margin-forecast',
        name: 'GrowthMarginForecast',
        component: GrowthMarginForecastComponent,
        props: true
      },
      {
        path: 'operating-expenses-forecast',
        name: 'OperatingExpensesForecast',
        component: OperatingExpensesForecastComponent,
        props: true
      },
      {
        path: 'capital-spending-forecast',
        name: 'CapitalSpendingForecast',
        component: CapitalSpendingForecastComponent,
        props: true
      },
      {
        path: 'working-capital-forecast',
        name: 'WorkingCapitalForecast',
        component: WorkingCapitalForecastComponent,
        props: true
      },
      {
        path: 'valuation',
        name : 'ValuationPage',
        component: ValuationComponent,
        props: true
      },
      {
        path: 'intrinsic-summary',
        name : 'IntrinsicValueForecast',
        component: IntrinsicValueComponent,
        props: true
      }

      // Add other nested routes as needed
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
