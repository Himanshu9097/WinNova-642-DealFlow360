import { getAuthHeaders } from '@/utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getCompanySettings = async () => {
  const res = await fetch(`${API_URL}/company/settings`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch company settings');
  return res.json();
};

export const updateCompanySettings = async (data) => {
  const res = await fetch(`${API_URL}/company/settings`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update company settings');
  return res.json();
};
