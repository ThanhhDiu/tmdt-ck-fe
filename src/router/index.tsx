import { Navigate, Route, Routes } from 'react-router-dom'
import TechnicianLayout from '../components/layout/TechnicianLayout'
import CustomerLayout from '../components/layout/CustomerLayout'
import {
  ChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
} from '../pages/AuthScreens'
import AdminSystemSettingsPage from '../pages/AdminSystemSettingsPage'
import AdminUserDetail from '../pages/AdminUserDetail'
import AdminFinancePage from '../pages/AdminFinancePage'
import AdminCategoriesPage from '../pages/AdminCategoriesPage'
import AdminUserManagement from '../pages/AdminUserManagement'
import CustomerAccountSettingsPage from '../pages/CustomerAccountSettingsPage'
import AdminDashboard from '../pages/AdminDashboard'
import Provider from '../pages/Provider'
import HomePage from '../pages/HomePage'
import { OrderManagementPage } from '../pages/OrderManagementPage'
import AdminOrdersPage from '../pages/AdminOrdersPage'
import ProviderDashboard from '../pages/ProviderDashboard'
import ProviderProfile from '../pages/ProviderProfile'
import ServicesPage from '../pages/ServicesPage'
import TechnicianProfileSettingsPage from '../pages/TechnicianProfileSettingsPage'
import VoucherRewardsPage from '../pages/VoucherRewardsPage'
import TechnicianVerificationPage from '../pages/TechnicianVerificationPage'
import CustomerSecurityPage from '../pages/CustomerSecurityPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { PendingEmailVerificationPage } from '../pages/PendingEmailVerificationPage'
import { ChatPage } from '../pages/ChatPage'
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/technician">
        <Route
          path="jobs"
          element={
            <TechnicianLayout activeItem="jobs">
              <OrderManagementPage role="technician" />
            </TechnicianLayout>
          }
        />
        <Route
          path="profile"
          element={
            <TechnicianLayout activeItem="profile">
              <TechnicianProfileSettingsPage />
            </TechnicianLayout>
          }
        />
        <Route
          path="verification"
          element={
            <TechnicianLayout activeItem="verification">
              <TechnicianVerificationPage />
            </TechnicianLayout>
          }
        />
        <Route
          path="provider-dashboard"
          element={
            <TechnicianLayout activeItem="dashboard">
              <ProviderDashboard />
            </TechnicianLayout>
          }
        />
      </Route>

      <Route path="/customer">
        <Route path="account-settings" element={
          <CustomerLayout activeNavKey="account" activeSidebarItem="personal" searchPlaceholder="Tìm kiếm dịch vụ...">
            <CustomerAccountSettingsPage />
          </CustomerLayout>
        } />
        <Route path='order-management' element={
          <CustomerLayout activeNavKey="account" activeSidebarItem="wallet" searchPlaceholder="Tìm kiếm dịch vụ...">
            <OrderManagementPage role="customer" />
          </CustomerLayout>
        } />
        <Route path="change-password" element={
          <CustomerLayout activeNavKey="account" activeSidebarItem="security" searchPlaceholder="Tìm kiếm dịch vụ...">

            <CustomerSecurityPage />
          </CustomerLayout>
        } />
        <Route path="chat" element={<ChatPage />} />
      </Route>

      <Route path="/admin">
        <Route path="settings" element={<AdminSystemSettingsPage />} />
      </Route>

      <Route path="/auth">
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="pending-email-verification" element={<PendingEmailVerificationPage />} />
      </Route>

      <Route path="/" element={<HomePage />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/rewards" element={<VoucherRewardsPage />} />
      <Route path="/provider-profile" element={<ProviderProfile />} />

      {/* Technician routes */}
      <Route path="/technician/jobs" element={
        <TechnicianLayout>
          <OrderManagementPage role="technician" />
        </TechnicianLayout>
      } />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />
      <Route path="/admin/users/:id" element={<AdminUserDetail />} />
      <Route path="/admin/finance" element={<AdminFinancePage />} />
      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
    </Routes>
  )
}
