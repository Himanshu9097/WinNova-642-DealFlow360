import { getAuthHeaders } from '@/utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getQuotations = async () => {
  // Assuming there's a GET /api/quotations route. Since there isn't one for getting ALL quotes in our backend, we only fetch quote by ID normally.
  // For the deals view to work, we'll return an empty array if requested, since deals view gets quotations via dealRoutes.js GET /api/deals/:id
  return []; 
};

export const getQuotation = async (id) => {
  const res = await fetch(`${API_URL}/quotations/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch quotation');
  return res.json();
};

export const createQuotation = async (data) => {
  const res = await fetch(`${API_URL}/quotations`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    let errMsg = 'Failed to create quotation';
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  
  return res.json();
};

export const updateQuotation = async (id, data) => {
  const res = await fetch(`${API_URL}/quotations/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update quotation');
  return res.json();
};

export const submitForApproval = async (id, currentQuote) => {
  // We mock this as it's just meant for UI simulation and the backend logic already auto-generates approvals based on discount changes anyway
  return Promise.resolve(currentQuote);
};
