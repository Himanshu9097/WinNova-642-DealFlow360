const API_URL = 'http://127.0.0.1:5006/api/subscriptions';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const getSubscriptions = async () => {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch subscriptions');
  return res.json();
};

export const runRecurringBillingNow = async () => {
  const res = await fetch(`${API_URL}/run-now`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to run recurring billing');
  return res.json();
};
