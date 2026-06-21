import axiosClient from '../api/config';

export const getTechnicians = async (params?: Record<string, any>) => {
  return await axiosClient.get('/technicians', { params });
}

export const getTechnicianById = async (id: string | number) => {
  return await axiosClient.get(`/technicians/${id}`);
}

export const updateTechnicianProfile = async (id: string | number, payload: any) => {
  return await axiosClient.patch(`/technicians/${id}/profile`, payload);
}

export const updateTechnicianAvailability = async (id: string | number, isAvailable: boolean) => {
  return await axiosClient.patch(`/technicians/${id}/availability`, { isAvailable });
}

export const getTechnicianReviews = async (id: string | number) => {
  return await axiosClient.get(`/technicians/${id}/reviews`);
}
