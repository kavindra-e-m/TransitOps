import client from './client';

export const getSettingsAPI = () => {
  return client.get('/settings').then(res => res.data);
};

export const updateSettingsAPI = (settingsData) => {
  return client.put('/settings', settingsData).then(res => res.data);
};

export const getRbacMatrixAPI = () => {
  return client.get('/rbac/rbac-matrix').then(res => res.data);
};
