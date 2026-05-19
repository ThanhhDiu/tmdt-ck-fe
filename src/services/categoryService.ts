import axiosClient from '../api/axiosClient';

export const getCategories = async () => {
  return await axiosClient.get('/categories');
}
