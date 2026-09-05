import { getAuthHeaders } from '@/utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getApprovals = async () => {
  const res = await fetch(`${API_URL}/approvals`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch approvals');
  return res.json();
};

export const processApproval = async (id, action, comment) => {
  const res = await fetch(`${API_URL}/approvals/${id}/action`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, comment })
  });
  if (!res.ok) throw new Error('Failed to process approval');
  return res.json();
};
