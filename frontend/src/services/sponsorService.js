import api from './api';

export const getAvailableSponsees = async (filters) => {
  const response = await api.get('/sponsors/available-sponsees', {
    params: filters,
  });
  return response.data;
};

export const getSponsorDashboard = async () => {
  const response = await api.get('/sponsors/profile');
  return response.data;
};

export const startSponsoring = async (sponsorshipData) => {
  const response = await api.post('/sponsors/start-sponsoring', sponsorshipData);
  return response.data;
};

export const updateSponsorshipStatus = async (sponsorshipId, status) => {
  const response = await api.put(`/sponsors/sponsorship/${sponsorshipId}/status`, { status });
  return response.data;
};

export const getSponseeDetails = async (sponseeId) => {
  const response = await api.get(`/sponsors/sponsee/${sponseeId}`);
  return response.data;
};

export const addNote = async (sponsorshipId, note) => {
  const response = await api.post(`/sponsors/sponsorship/${sponsorshipId}/note`, { note });
  return response.data;
};

export const getSponsorStats = async () => {
  const response = await api.get('/sponsors/stats');
  return response.data;
}; 