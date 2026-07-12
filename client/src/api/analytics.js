import client from './client';

export const getAnalyticsSummaryAPI = () => {
  return client.get('/analytics/summary').then(res => res.data);
};

export const getMonthlyRevenueAPI = () => {
  return client.get('/analytics/monthly-revenue').then(res => res.data);
};

export const getTopCostliestVehiclesAPI = () => {
  return client.get('/analytics/costliest-vehicles').then(res => res.data);
};
