import { getAuthHeaders } from '../utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getDeals = async () => {
  const res = await fetch(`${API_URL}/deals`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch deals');
  return res.json();
};

export const getDeal = async (id) => {
  const res = await fetch(`${API_URL}/deals/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch deal');
  return res.json();
};

export const createDeal = async (data) => {
  const res = await fetch(`${API_URL}/deals`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create deal');
  return res.json();
};

export const updateDealStage = async (id, newStage) => {
  const res = await fetch(`${API_URL}/deals/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ stage: newStage })
  });
  if (!res.ok) throw new Error('Failed to update deal stage');
  return res.json();
};
