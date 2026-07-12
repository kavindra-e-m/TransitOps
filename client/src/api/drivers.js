import client from './client';

export const getDriversAPI = () => {
  return client.get('/drivers').then(res => res.data);
};

export const createDriverAPI = (driverData) => {
  return client.post('/drivers', driverData).then(res => res.data);
};

export const updateDriverAPI = (id, driverData) => {
  return client.put(`/drivers/${id}`, driverData).then(res => res.data);
};

export const updateDriverStatusAPI = (id, status) => {
  return client.patch(`/drivers/${id}/status`, { status }).then(res => res.data);
};
