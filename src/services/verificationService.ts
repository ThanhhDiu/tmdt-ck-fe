import apiClient from '../api/config'
import type { VerificationRequest, VerificationStatus } from '../types/VerificationRequest'

const mapBackendToFrontendVerification = (v: any): VerificationRequest => {
  return {
    id: v.id,
    technicianId: v.technicianId,
    fullName: v.fullName,
    phone: v.phone || '',
    email: v.email || '',
    district: v.district,
    serviceCategory: v.serviceCategory,
    yearsExperience: v.yearsExperience || 0,
    submittedAt: v.submittedAt,
    status: v.status?.toLowerCase() as VerificationStatus,
    note: v.note,
    reviewedAt: v.reviewedAt,
    reviewedBy: v.reviewedBy,
    documents: {
      idFront: v.documents?.idFront || '',
      idBack: v.documents?.idBack || '',
      portrait: v.documents?.portrait || '',
      certificate: v.documents?.certificate,
    }
  };
};

export const getVerificationRequests = async (status?: string, keyword?: string): Promise<VerificationRequest[]> => {
  const response = await apiClient.get('/api/verifications', {
    params: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(keyword ? { keyword } : {})
    }
  });
  const data = response.data?.data;
  return (data?.items || []).map(mapBackendToFrontendVerification);
};

export const getVerificationRequestById = async (id: string): Promise<VerificationRequest | undefined> => {
  const response = await apiClient.get(`/api/verifications/${encodeURIComponent(id)}`);
  const data = response.data?.data;
  return data ? mapBackendToFrontendVerification(data) : undefined;
};

export const updateVerificationRequestStatus = async (
  id: string,
  payload: { status: VerificationStatus; note?: string; reviewedBy: string }
): Promise<VerificationRequest | undefined> => {
  const response = await apiClient.patch(`/api/verifications/${encodeURIComponent(id)}`, {
    status: payload.status,
    note: payload.note,
    reviewedBy: payload.reviewedBy,
    notifyTechnician: true
  });
  const data = response.data?.data;
  return data ? mapBackendToFrontendVerification(data) : undefined;
};

export const getTechnicianVerificationStatus = async (technicianId: string): Promise<VerificationStatus | null> => {
  try {
    const response = await apiClient.get(`/api/technicians/${encodeURIComponent(technicianId)}`);
    const data = response.data?.data;
    return (data?.verificationStatus?.toLowerCase() as VerificationStatus) || null;
  } catch (error) {
    console.error('Error fetching technician verification status:', error);
    return null;
  }
};

export const submitVerificationRequest = async (data: {
  district: string;
  serviceCategory: string;
  yearsExperience?: number;
  idFront: File;
  idBack: File;
  portrait: File;
  certificate?: File | null;
}): Promise<any> => {
  const formData = new FormData();
  formData.append('district', data.district);
  formData.append('serviceCategory', data.serviceCategory);
  if (data.yearsExperience !== undefined && data.yearsExperience !== null) {
    formData.append('yearsExperience', String(data.yearsExperience));
  }
  formData.append('idFront', data.idFront);
  formData.append('idBack', data.idBack);
  formData.append('portrait', data.portrait);
  if (data.certificate) {
    formData.append('certificate', data.certificate);
  }

  const response = await apiClient.post('/api/verifications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data;
};

export const getLatestVerificationRequest = async (): Promise<VerificationRequest | null> => {
  const response = await apiClient.get('/api/verifications/latest');
  const data = response.data?.data;
  return data ? mapBackendToFrontendVerification(data) : null;
};

export const verificationStatusLabel: Record<VerificationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Từ chối',
  needs_resubmit: 'Yêu cầu bổ sung',
}

export const verificationStatusColor: Record<VerificationStatus, { color: string; bg: string }> = {
  pending: { color: '#a16207', bg: '#fff7e8' },
  approved: { color: '#15803d', bg: '#ecfdf3' },
  rejected: { color: '#b91c1c', bg: '#fee2e2' },
  needs_resubmit: { color: '#334155', bg: '#e2e8f0' },
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export { formatDate }
export { getVerificationRequestById as getVerificationById };
