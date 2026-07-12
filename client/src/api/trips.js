import client from './client';

export const getTripsAPI = (params = {}) => {
  return client.get('/trips', { params }).then(res => res.data);
};

export const getAvailableVehiclesAPI = () => {
  return client.get('/trips/available-vehicles').then(res => res.data);
};

export const getAvailableDriversAPI = () => {
  return client.get('/trips/available-drivers').then(res => res.data);
};

export const createTripAPI = (tripData) => {
  return client.post('/trips', tripData).then(res => res.data);
};

export const dispatchTripAPI = (id) => {
  return client.patch(`/trips/${id}/dispatch`).then(res => res.data);
};

export const completeTripAPI = (id, data = {}) => {
  return client.patch(`/trips/${id}/complete`, data).then(res => res.data);
};

export const cancelTripAPI = (id) => {
  return client.patch(`/trips/${id}/cancel`).then(res => res.data);
};
