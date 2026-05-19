import axiosClient from '../api/axiosClient';

export interface UpdateUserProfilePayload {
  fullName?: string;
  phone?: string;
  district?: string;
  // Các field khác tùy thuộc vào model User
}

export const updateUserProfile = async (id: string | number, payload: UpdateUserProfilePayload) => {
  return await axiosClient.patch(`/users/${id}`, payload);
}
