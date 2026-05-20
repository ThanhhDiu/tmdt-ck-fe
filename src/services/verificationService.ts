import type { VerificationRequest, VerificationStatus } from '../types/VerificationRequest'

const REQUESTS_KEY = 'glowup_verification_requests_v1'
const TECH_STATUS_KEY = 'glowup_technician_verification_status_v1'

const seedRequests: VerificationRequest[] = [
  {
    id: 'VR-2401',
    technicianId: 'TECH-9921',
    fullName: 'Nguyễn Văn A',
    phone: '090 123 1234',
    email: 'vana.tech@glowup.vn',
    district: 'Quận 7, HCMC',
    serviceCategory: 'Điện lạnh',
    yearsExperience: 5,
    submittedAt: '2026-04-20T09:15:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=33',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2402',
    technicianId: 'TECH-8842',
    fullName: 'Nguyễn Minh Tú',
    phone: '098 765 4321',
    email: 'minhtu.tech@glowup.vn',
    district: 'Quận 1, HCMC',
    serviceCategory: 'Máy giặt',
    yearsExperience: 3,
    submittedAt: '2026-04-22T14:20:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=25',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2403',
    technicianId: 'TECH-7710',
    fullName: 'Trần Huy',
    phone: '091 445 5667',
    email: 'tranhuy.tech@glowup.vn',
    district: 'Thủ Đức, HCMC',
    serviceCategory: 'Tủ lạnh',
    yearsExperience: 2,
    submittedAt: '2026-04-18T08:05:00.000Z',
    status: 'rejected',
    note: 'Ảnh CCCD mặt sau chưa rõ nét, vui lòng cập nhật lại.',
    reviewedAt: '2026-04-19T10:00:00.000Z',
    reviewedBy: 'Admin AD-9902',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=8',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2404',
    technicianId: 'TECH-6611',
    fullName: 'Lê Quang Bình',
    phone: '093 881 4488',
    email: 'quangbinh.tech@glowup.vn',
    district: 'Quận 3, HCMC',
    serviceCategory: 'Điện nước',
    yearsExperience: 6,
    submittedAt: '2026-04-24T10:10:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=59',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2405',
    technicianId: 'TECH-2210',
    fullName: 'Phạm Thị Lan',
    phone: '094 220 7711',
    email: 'thilan.tech@glowup.vn',
    district: 'Quận 1, HCMC',
    serviceCategory: 'Vệ sinh máy lạnh',
    yearsExperience: 4,
    submittedAt: '2026-04-21T07:35:00.000Z',
    status: 'approved',
    note: 'Hồ sơ đầy đủ, thông tin trùng khớp.',
    reviewedAt: '2026-04-22T09:00:00.000Z',
    reviewedBy: 'Admin AD-9902',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=45',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2406',
    technicianId: 'TECH-1120',
    fullName: 'Đặng Quốc Nam',
    phone: '090 768 8811',
    email: 'quocnam.tech@glowup.vn',
    district: 'Thủ Đức, HCMC',
    serviceCategory: 'Tủ lạnh',
    yearsExperience: 2,
    submittedAt: '2026-04-23T15:10:00.000Z',
    status: 'needs_resubmit',
    note: 'Thiếu ảnh chân dung rõ mặt, cần tải lại.',
    reviewedAt: '2026-04-24T11:30:00.000Z',
    reviewedBy: 'Admin AD-9902',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=67',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2407',
    technicianId: 'TECH-3305',
    fullName: 'Vũ Minh Đức',
    phone: '097 443 2299',
    email: 'minhduc.tech@glowup.vn',
    district: 'Quận 7, HCMC',
    serviceCategory: 'Máy giặt',
    yearsExperience: 5,
    submittedAt: '2026-04-25T09:00:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=11',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2408',
    technicianId: 'TECH-5518',
    fullName: 'Bùi Gia Bảo',
    phone: '085 321 0099',
    email: 'giabao.tech@glowup.vn',
    district: 'Quận 1, HCMC',
    serviceCategory: 'Điện lạnh',
    yearsExperience: 7,
    submittedAt: '2026-04-17T13:25:00.000Z',
    status: 'approved',
    note: 'Đã đối soát với dữ liệu định danh quốc gia.',
    reviewedAt: '2026-04-18T10:15:00.000Z',
    reviewedBy: 'Admin AD-9902',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=62',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2409',
    technicianId: 'TECH-7733',
    fullName: 'Trương Khánh An',
    phone: '089 440 1133',
    email: 'khanhan.tech@glowup.vn',
    district: 'Quận 3, HCMC',
    serviceCategory: 'Lò vi sóng',
    yearsExperience: 1,
    submittedAt: '2026-04-26T16:40:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=21',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
  {
    id: 'VR-2410',
    technicianId: 'TECH-9102',
    fullName: 'Ngô Phúc Hậu',
    phone: '091 880 5566',
    email: 'phuchau.tech@glowup.vn',
    district: 'Thủ Đức, HCMC',
    serviceCategory: 'Máy nước nóng',
    yearsExperience: 3,
    submittedAt: '2026-04-27T08:20:00.000Z',
    status: 'pending',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      idBack: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      portrait: 'https://i.pravatar.cc/600?img=39',
      certificate: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    },
  },
]

const parse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const bootstrapVerificationStore = () => {
  const existing = parse<VerificationRequest[]>(localStorage.getItem(REQUESTS_KEY), [])
  const merged = [...existing]

  seedRequests.forEach((seed) => {
    if (!merged.some((item) => item.id === seed.id)) {
      merged.push(seed)
    }
  })

  // localStorage.setItem(REQUESTS_KEY, JSON.stringify(merged.length > 0 ? merged : seedRequests))

  const existingTechMap = parse<Record<string, VerificationStatus>>(localStorage.getItem(TECH_STATUS_KEY), {})
  merged.forEach((req) => {
    if (!existingTechMap[req.technicianId]) {
      existingTechMap[req.technicianId] = req.status
    }
  })
  // localStorage.setItem(TECH_STATUS_KEY, JSON.stringify(existingTechMap))
}

export const getVerificationRequests = (): VerificationRequest[] => {
  bootstrapVerificationStore()
  return parse<VerificationRequest[]>(localStorage.getItem(REQUESTS_KEY), seedRequests)
}

export const getVerificationRequestById = (id: string): VerificationRequest | undefined => {
  return getVerificationRequests().find((item) => item.id === id)
}

export const updateVerificationRequestStatus = (
  id: string,
  payload: { status: VerificationStatus; note?: string; reviewedBy: string }
): VerificationRequest | undefined => {
  const requests = getVerificationRequests()
  const next = requests.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      status: payload.status,
      note: payload.note,
      reviewedBy: payload.reviewedBy,
      reviewedAt: new Date().toISOString(),
    }
  })

  // localStorage.setItem(REQUESTS_KEY, JSON.stringify(next))

  const updated = next.find((item) => item.id === id)
  if (updated) {
    const techMap = parse<Record<string, VerificationStatus>>(localStorage.getItem(TECH_STATUS_KEY), {})
    techMap[updated.technicianId] = updated.status
    // localStorage.setItem(TECH_STATUS_KEY, JSON.stringify(techMap))
  }

  return updated
}

export const getTechnicianVerificationStatus = (technicianId: string): VerificationStatus | null => {
  bootstrapVerificationStore()
  const techMap = parse<Record<string, VerificationStatus>>(localStorage.getItem(TECH_STATUS_KEY), {})
  return techMap[technicianId] || null
}

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

export { formatDate }
