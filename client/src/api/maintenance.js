import client from './client';

export const getMaintenanceAPI = () => {
  return client.get('/maintenance').then(res => res.data);
};

export const createMaintenanceAPI = (maintenanceData) => {
  return client.post('/maintenance', maintenanceData).then(res => res.data);
};

export const updateMaintenanceStatusAPI = (id, status) => {
  return client.patch(`/maintenance/${id}/status`, { status }).then(res => res.data);
};
