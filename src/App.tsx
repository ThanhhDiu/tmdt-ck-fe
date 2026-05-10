import {Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import FindProvider from './pages/FindProvider.tsx'
import ProviderProfile from './pages/ProviderProfile'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminSystemSettingsPage from './pages/AdminSystemSettingsPage'
import AdminUserDetail from './pages/AdminUserDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminVerificationRequests from './pages/AdminVerificationRequests'
import AdminVerificationDetail from './pages/AdminVerificationDetail'
import AdminVerificationUpdate from './pages/AdminVerificationUpdate'
import AdminFinancePage from './pages/AdminFinancePage'
// import OrderManagementPage from './pages/OrderManagementPage.tsx'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import OrderManagementPage from './pages/OrderManagementPage.tsx'
import TechnicianLayout from './components/layout/TechnicianLayout.tsx'
import TechnicianWalletPage from './pages/TechnicianWalletPage'
import TechnicianWalletTopUpPage from './pages/TechnicianWalletTopUpPage'
import TechnicianWalletWithdrawPage from './pages/TechnicianWalletWithdrawPage'
import TechnicianProfileSettingsPage from './pages/TechnicianProfileSettingsPage'
import CustomerAccountSettingsPage from './pages/CustomerAccountSettingsPage'
import TechnicianVerificationPage from './pages/TechnicianVerificationPage'
import TechnicianVerificationStatusPage from './pages/TechnicianVerificationStatusPage'
import { ChatPage } from './pages/ChatPage'
import CustomerLayout from './components/layout/CustomerLayout'
import ServicesPage from "./pages/ServicesPage.tsx";
import Provider from "./pages/Provider.tsx";
import {ChangePasswordPage, ForgotPasswordPage, LoginPage, RegisterPage} from "./pages/AuthScreens.tsx";
import VoucherRewardsPage from './pages/VoucherRewardsPage'

function App() {
    return (
        <Routes>
            {/*  Luồng của thợ*/}
            <Route path="/technician">
                <Route path="jobs" element={
                    <TechnicianLayout activeItem="jobs">
                        <OrderManagementPage role="technician" />
                    </TechnicianLayout>
                } />
                <Route path="wallet" element={
                    <TechnicianLayout activeItem="wallet">
                        <TechnicianWalletPage />
                    </TechnicianLayout>
                } />
                <Route path="wallet/topup" element={
                    <TechnicianLayout activeItem="wallet">
                        <TechnicianWalletTopUpPage />
                    </TechnicianLayout>
                } />
                <Route path="wallet/withdraw" element={
                    <TechnicianLayout activeItem="wallet">
                        <TechnicianWalletWithdrawPage />
                    </TechnicianLayout>
                } />

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
                    element={<TechnicianVerificationPage />}
                />
                <Route
                    path="verification-status"
                    element={<TechnicianVerificationStatusPage />}
                />
                <Route
                    path="provider-dashboard"
                    element={
                        <TechnicianLayout activeItem="dashboard">
                            <ProviderDashboard />
                        </TechnicianLayout>
                    }
                />
                {/*<Route*/}
                {/*    path="chat"*/}
                {/*    element={*/}
                {/*        <TechnicianLayout activeItem="chat">*/}
                {/*            <ChatPage role={"customer"}/>*/}
                {/*        </TechnicianLayout>*/}
                {/*    }*/}
                {/*/>*/}

            </Route>

            <Route
                path="/technician/chat"
                element={
                    <TechnicianLayout activeItem="chat">
                        <ChatPage role="technician" />
                    </TechnicianLayout>
                }
            />

            {/*  Luồng của khách hàng*/}
            <Route path="/customer">
                {/*<Route path="orders" element={*/}
                {/*    <CustomerLayout>*/}

                {/*        <OrderManagementPage role="customer" />*/}
                {/*    </CustomerLayout>*/}
                {/*} />*/}

                <Route path="settings" element={<CustomerAccountSettingsPage />} /> 
                <Route path="chat" element={<ChatPage />} />
                {/* <Route path="settings" element={
                    <CustomerLayout activeNavKey="account" searchPlaceholder="Tìm kiếm dịch vụ...">
                        <CustomerAccountSettingsPage />
                    </CustomerLayout>
                } /> */}
                <Route path='order-management' element={
                    <CustomerLayout activeNavKey="account" activeSidebarItem="wallet" searchPlaceholder="Tìm kiếm dịch vụ...">
                        <OrderManagementPage role="customer" />
                    </CustomerLayout>
                } />
                <Route path="change-password" element={
                    <CustomerLayout activeNavKey="account" activeSidebarItem="security" searchPlaceholder="Tìm kiếm dịch vụ...">
                        <ChangePasswordPage />
                    </CustomerLayout>
                } />
                <Route path="account-settings" element={
                    <CustomerLayout activeNavKey="account" activeSidebarItem="personal" searchPlaceholder="Tìm kiếm dịch vụ...">
                        <CustomerAccountSettingsPage />
                    </CustomerLayout>
                } />

            </Route>


            {/*  Luồng của admin*/}
            <Route path="/admin">

            </Route>

            <Route path="/auth/login" element={<LoginPage />} />

            {/*đem mấy này phân theo luồng*/}
            <Route path="/" element={<HomePage/>}/>
            <Route path="/find-provider" element={
                <CustomerLayout activeNavKey="find-provider">
                    <FindProvider/>
                </CustomerLayout>
            }/>
            <Route path="/provider-profile" element={
                <CustomerLayout activeNavKey="find-provider">
                    <ProviderProfile/>
                </CustomerLayout>
            }/>
            <Route path="/provider-dashboard" element={<ProviderDashboard/>}/>
            <Route path="/admin/users" element={<AdminUserManagement/>}/>
            <Route path="/admin/users/:id" element={<AdminUserDetail/>}/>
            <Route path="/admin/finance" element={<AdminFinancePage/>}/>
            <Route path="/admin/categories" element={<AdminCategoriesPage/>}/>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/rewards" element={<VoucherRewardsPage />} />
            <Route path="/provider" element={<Provider />} />
            <Route path="/find-provider" element={
                <CustomerLayout activeNavKey="find-provider">
                    <FindProvider />
                </CustomerLayout>
            } />
            <Route path="/provider-profile" element={
                <CustomerLayout activeNavKey="find-provider">
                    <ProviderProfile />
                </CustomerLayout>
            } />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/finance" element={<AdminFinancePage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/verification" element={<AdminVerificationRequests />} />
            <Route path="/admin/verification/:requestId/update" element={<AdminVerificationUpdate />} />
            <Route path="/admin/verification/:requestId" element={<AdminVerificationDetail />} />
            <Route path="/admin/settings" element={<AdminSystemSettingsPage />} />


            <Route path="/auth">
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>

        </Routes>
    )
}

export default App
