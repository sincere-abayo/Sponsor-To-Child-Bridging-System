import api from './api';

export const getAvailableSponsees = async (filters) => {
  const response = await api.get('/sponsors/available-sponsees', {
    params: filters,
  });
  return response.data;
};

export const getSponsorDashboard = async () => {
  const response = await api.get('/sponsors/dashboard');
  return response.data;
};

export const startSponsoring = async (sponsorshipData) => {
  const response = await api.post('/sponsors/start-sponsoring', sponsorshipData);
  return response.data;
};

export const updateSponsorshipStatus = async (statusData) => {
  const response = await api.put('/sponsors/update-status', statusData);
  return response.data;
};

export const getSponseeDetails = async (sponseeId) => {
  const response = await api.get(`/sponsors/sponsee/${sponseeId}`);
  return response.data;
};

export const addNote = async (sponseeId, note) => {
  const response = await api.post(`/sponsors/sponsee/${sponseeId}/note`, { note });
  return response.data;
}; 