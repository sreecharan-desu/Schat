import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const signup = async (email: string, password: string) => {
  return axios.post(`${BASE_URL}/signup`, { email, password });
};

export const signin = async (email: string, password: string) => {
  return axios.post(`${BASE_URL}/signin`, { email, password });
};

export const getUser = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const searchUsers = async (email: string) => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/users/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};