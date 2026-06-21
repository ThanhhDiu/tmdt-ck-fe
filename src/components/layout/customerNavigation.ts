export interface CustomerHeaderNavItem {
  key: string;
  label: string;
  page: string;
}

export const customerPageMap: Record<string, string> = {
  home: '/',
  'find-provider': '/find-provider',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'change-password': '/customer/change-password',
  'order-management': '/customer/order-management',
  login: '/auth/login',
};

export const customerHeaderNavItems: CustomerHeaderNavItem[] = [
  { key: 'home', label: 'Trang chủ', page: 'home' },
  { key: 'find-provider', label: 'Dịch vụ', page: 'find-provider' },
  { key: 'account', label: 'Tài khoản', page: 'customer-settings' },
];

export function resolveCustomerPath(page: string) {
  return customerPageMap[page] || '/';
}
