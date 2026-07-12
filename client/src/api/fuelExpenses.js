import client from './client';

// Fuel Log endpoints
export const getFuelLogsAPI = () => {
  return client.get('/fuel').then(res => res.data);
};

export const createFuelLogAPI = (fuelData) => {
  return client.post('/fuel', fuelData).then(res => res.data);
};

// Expense endpoints
export const getExpensesAPI = () => {
  return client.get('/expenses').then(res => res.data);
};

export const createExpenseAPI = (expenseData) => {
  return client.post('/expenses', expenseData).then(res => res.data);
};

export const getOperationalCostAPI = () => {
  return client.get('/expenses/operational-cost').then(res => res.data);
};
