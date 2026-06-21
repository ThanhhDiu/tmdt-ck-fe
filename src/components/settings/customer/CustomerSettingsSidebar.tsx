import { SettingsSidebarCard } from '../../layout/SettingsSidebarCard';
import { customerSettingsSidebarItems } from './customerSettingsConfig';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const DEFAULT_AVATAR = 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg';

interface CustomerSettingsSidebarProps {
  activeItem: string;
  onSelect?: (id: string) => void;
}

export function CustomerSettingsSidebar({
  activeItem,
  onSelect,
}: CustomerSettingsSidebarProps) {
  const { profile } = useUserProfile();

  return (
    <SettingsSidebarCard
      avatar={profile.avatar || DEFAULT_AVATAR}
      name={profile.fullName}
      meta={profile.code}
      items={customerSettingsSidebarItems}
      activeItem={activeItem}
      onSelect={onSelect}
    />
  );
}
