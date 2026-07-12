import client from './client';

export const loginAPI = (email, password) => {
  return client.post('/auth/login', { email, password }).then(res => res.data);
};

export const signupAPI = (name, email, password, role) => {
  return client.post('/auth/signup', { name, email, password, role }).then(res => res.data);
};
