import api from './api';

export const createSponsorship = async (sponsorshipData) => {
  const response = await api.post('/sponsorships', sponsorshipData);
  return response.data;
};

export const getUserSponsorships = async (status) => {
  const response = await api.get('/sponsorships/my-sponsorships', {
    params: { status },
  });
  return response.data;
};

export const getAvailableSponsorships = async (filters) => {
  const response = await api.get('/sponsorships/available', {
    params: filters,
  });
  return response.data;
};

export const getSponsorship = async (id) => {
  const response = await api.get(`/sponsorships/${id}`);
  return response.data;
};

export const updateSponsorship = async (id, updateData) => {
  const response = await api.put(`/sponsorships/${id}`, updateData);
  return response.data;
};

export const deleteSponsorship = async (id) => {
  const response = await api.delete(`/sponsorships/${id}`);
  return response.data;
};

export const uploadDocument = async (id, file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await api.post(`/sponsorships/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const addUpdate = async (id, content) => {
  const response = await api.post(`/sponsorships/${id}/updates`, { content });
  return response.data;
}; 