import client from './client';

export const getVehiclesAPI = (params = {}) => {
  return client.get('/vehicles', { params }).then(res => res.data);
};

export const checkRegUniqueAPI = (regNo) => {
  return client.get(`/vehicles/check/${regNo}`).then(res => res.data);
};

export const createVehicleAPI = (vehicleData) => {
  return client.post('/vehicles', vehicleData).then(res => res.data);
};

export const updateVehicleAPI = (id, vehicleData) => {
  return client.put(`/vehicles/${id}`, vehicleData).then(res => res.data);
};

export const getVehicleHistoryAPI = (id) => {
  return client.get(`/vehicles/${id}/history`).then(res => res.data);
};
