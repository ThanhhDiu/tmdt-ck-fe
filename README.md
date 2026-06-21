<<<<<<< HEAD
# ThuongMaiDienTu

=======
>>>>>>> 0b1013b57a58a3a90fe1a21c38f50c39b0231130
# GlowUp FE 

Frontend project built with **React + TypeScript + Vite**

---

# GlowUp FE

Frontend project built with React + TypeScript + Vite.

---

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- ESLint

---

## Installation

```bash
npm install
```

## Run development

```bash
npm run dev
```

## Build production

```bash
npm run build
```

---

## Admin pages

### Dashboard

- URL: /admin/dashboard
- Page: src/pages/AdminDashboard.tsx

### User Management

- URL: /admin/users
- Page: src/pages/AdminUserManagement.tsx

### Technician Identity Verification Flow

1) Verification request list
- URL: /admin/verification
- Page: src/pages/AdminVerificationRequests.tsx

2) Verification request detail
- URL: /admin/verification/:requestId
- Page: src/pages/AdminVerificationDetail.tsx

3) Verification status update
- URL: /admin/verification/:requestId/update
- Page: src/pages/AdminVerificationUpdate.tsx

Flow behavior:
- Admin reviews technician documents.
- Admin approves / rejects / requests additional documents.
- New status is saved and synced to the technician verification status store.

Shared components reused:
- src/components/admin/AdminSidebar.tsx
- src/components/admin/AdminHeader.tsx
- src/components/layout/Footer.tsx

---

## Notes

- If you see a blank page, verify routes in src/App.tsx.
- Verification mock state is stored in localStorage via src/services/verificationService.ts.
