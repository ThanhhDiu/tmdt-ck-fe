import { Trash2 } from 'lucide-react';
import { SettingsDangerZone } from '../cards/SettingsDangerZone';

interface CustomerAccountDangerZoneProps {
  onDelete: () => void;
}

export function CustomerAccountDangerZone({ onDelete }: CustomerAccountDangerZoneProps) {
  return (
    <SettingsDangerZone
      title="Xóa tài khoản"
      text="Sau khi xác nhận, tài khoản sẽ được vô hiệu hóa và phiên đăng nhập hiện tại sẽ bị xóa. Đây là bước xác nhận cuối cùng trước khi gửi yêu cầu xóa mềm."
      action={
        <button type="button" className="settings-danger-button" onClick={onDelete}>
          <Trash2 size={18} />
          Xóa tài khoản
        </button>
      }
    />
  );
}
