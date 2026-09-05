import { getAuthHeaders } from '@/utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getCustomers = async () => {
  const res = await fetch(`${API_URL}/customers`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
};
