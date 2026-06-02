import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminUsers,
  updateAdminUserStatus,
  mapUserResponseToFrontend,
} from '../../services/adminUserService';
import { isAuthenticated } from '../../services/auth';
import './UserManagementTable.css';

type UserRole = 'customer' | 'technician';
type UserStatus = 'active' | 'pending' | 'locked' | 'inactive';

interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  district: 'Quận 1' | 'Quận 3' | 'Quận 7' | 'Thủ Đức';
  role: UserRole;
  status: UserStatus;
  serviceType?: string;
  orderCount: number;
  joinedAt: string;
  isVerified: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Đã xác minh', color: '#d97706', bg: '#fff7e8' },
  pending: { label: 'Chờ duyệt', color: '#64748b', bg: '#f1f5f9' },
  locked: { label: 'Bị khóa', color: '#dc2626', bg: '#fee2e2' },
  inactive: { label: 'Ngưng hoạt động', color: '#6b7280', bg: '#f3f4f6' },
};

interface Props {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  searchKeyword: string;
  statusFilter: 'all' | UserStatus;
  onStatusFilterChange: (value: 'all' | UserStatus) => void;
  areaFilter: 'all' | 'Quận 1' | 'Quận 3' | 'Quận 7' | 'Thủ Đức';
  onAreaFilterChange: (value: 'all' | 'Quận 1' | 'Quận 3' | 'Quận 7' | 'Thủ Đức') => void;
}

export const UserManagementTable: React.FC<Props> = ({
  activeRole,
  onRoleChange,
  searchKeyword,
  statusFilter,
  onStatusFilterChange,
  areaFilter,
  onAreaFilterChange,
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ============================================================================
  // FETCH DATA FROM API
  // ============================================================================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication first
        if (!isAuthenticated()) {
          setError('Vui lòng đăng nhập để tiếp tục');
          setUsers([]);
          setLoading(false);
          return;
        }

        const response = await getAdminUsers({
          role: activeRole,
          status: statusFilter === 'all' ? undefined : statusFilter,
          district: areaFilter === 'all' ? undefined : areaFilter,
          keyword: searchKeyword || undefined,
          page: 1,
          limit: 100, // Fetch all to handle client-side pagination
        });

        // Map backend response to frontend User interface
        const mappedUsers = response.items.map((userResponse) => {
          const mapped = mapUserResponseToFrontend(userResponse);
          return {
            ...mapped,
            serviceType: mapped.role === 'technician' ? 'Dịch vụ' : undefined,
          } as User;
        });

        setUsers(mappedUsers);
        setCurrentPage(1);
        setSelectedIds([]);
      } catch (err: any) {
        const errorMessage = err.message || 'Lỗi khi tải danh sách người dùng';
        setError(errorMessage);
        console.error('Error fetching users:', err);
        // Fallback to empty list on error
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeRole, statusFilter, areaFilter, searchKeyword]);

  const roleCounts = useMemo(
    () => ({
      customer: users.filter((user) => user.role === 'customer').length,
      technician: users.filter((user) => user.role === 'technician').length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return users.filter((user) => {
      const roleMatched = user.role === activeRole;
      const statusMatched = statusFilter === 'all' ? true : user.status === statusFilter;
      const areaMatched = areaFilter === 'all' ? true : user.district === areaFilter;
      const keywordMatched =
        keyword.length === 0
          ? true
          : user.name.toLowerCase().includes(keyword) ||
            user.phone.toLowerCase().includes(keyword) ||
            user.id.toLowerCase().includes(keyword);

      return roleMatched && statusMatched && areaMatched && keywordMatched;
    });
  }, [users, activeRole, statusFilter, areaFilter, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeRole, searchKeyword, statusFilter, areaFilter]);

  const activePageUsersIds = paginatedUsers.map((user) => user.id);
  const isAllPageSelected = activePageUsersIds.length > 0 && activePageUsersIds.every((id) => selectedIds.includes(id));

  const handleViewDetail = (user: User) => {
    navigate(`/admin/users/${user.id}`, {
      state: {
        user: {
          ...user,
          serviceType: user.serviceType || 'Khách hàng',
          completedJobs: `${user.orderCount}`,
          status: user.status,
          isVerified: user.isVerified,
        },
        tab: user.status === 'pending' ? 'pending' : 'approved',
      },
    });
  };

  const toggleSelectPage = () => {
    if (isAllPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !activePageUsersIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...activePageUsersIds])));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleLockStatus = async (id: string) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      const currentStatus = user.status;
      const newStatus = currentStatus === 'locked' ? 'active' : 'locked';

      // Call API to update status
      const userId = parseInt(id, 10);
      await updateAdminUserStatus(userId, {
        status: newStatus as any,
        reason: `Thay đổi trạng thái từ admin`,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          return { ...u, status: newStatus as any };
        })
      );
    } catch (err: any) {
      console.error('Error updating user status:', err);
      alert(`Lỗi: ${err.message || 'Cập nhật trạng thái thất bại'}`);
    }
  };

  const approveUser = async (id: string) => {
    try {
      // Call API to update status to verified
      const userId = parseInt(id, 10);
      await updateAdminUserStatus(userId, {
        status: 'active',
        reason: 'Phê duyệt từ admin',
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          return { ...u, status: 'active', isVerified: true };
        })
      );
    } catch (err: any) {
      console.error('Error approving user:', err);
      alert(`Lỗi: ${err.message || 'Phê duyệt thất bại'}`);
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Tên', 'Số điện thoại', 'Quận', 'Vai trò', 'Trạng thái', 'Ngày tham gia'];
    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.phone,
      user.district,
      user.role,
      user.status,
      user.joinedAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((col) => `"${col}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="umt-container">
      {error && (
        <div
          className="umt-error-banner"
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          className="umt-loading-banner"
          style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          Đang tải dữ liệu...
        </div>
      )}

      <div className="umt-topbar">
        <div className="umt-tabs">
          <button className={`umt-tab ${activeRole === 'customer' ? 'active' : ''}`} onClick={() => onRoleChange('customer')}>
            <span>Khách hàng</span>
            <span className="umt-tab-count">{roleCounts.customer}</span>
          </button>
          <button className={`umt-tab ${activeRole === 'technician' ? 'active' : ''}`} onClick={() => onRoleChange('technician')}>
            <span>Thợ sửa chữa</span>
            <span className="umt-tab-count umt-count-pending">{roleCounts.technician}</span>
          </button>
        </div>

        <div className="umt-controls">
          <select
            className="umt-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | UserStatus)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đã xác minh</option>
            <option value="pending">Chờ duyệt</option>
            <option value="locked">Bị khóa</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>

          <select
            className="umt-select"
            value={areaFilter}
            onChange={(e) => onAreaFilterChange(e.target.value as 'all' | 'Quận 1' | 'Quận 3' | 'Quận 7' | 'Thủ Đức')}
          >
            <option value="all">Tất cả khu vực</option>
            <option value="Quận 1">Quận 1</option>
            <option value="Quận 3">Quận 3</option>
            <option value="Quận 7">Quận 7</option>
            <option value="Thủ Đức">Thủ Đức</option>
          </select>

          <button className="umt-btn-export" onClick={exportCsv} type="button">
            Xuất CSV
          </button>
        </div>
      </div>

      <div className="umt-table-wrapper">
        <table className="umt-table">
          <thead>
            <tr>
              <th className="umt-col-check">
                <input type="checkbox" checked={isAllPageSelected} onChange={toggleSelectPage} aria-label="Chọn tất cả" />
              </th>
              <th>Thành viên</th>
              <th>Số điện thoại</th>
              <th>Quận hoạt động</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => {
              // Lấy config an toàn
              const statusKey = user.status;
              const st = statusConfig[statusKey];
              const statusColor = st?.color ?? '#000';
              const statusBg = st?.bg ?? '#f1f3f5';
              const statusLabel = st?.label ?? 'Không xác định';

              return (
                <tr key={user.id} className="umt-row">
                  <td className="umt-col-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelectOne(user.id)}
                      aria-label={`Chọn ${user.name ?? 'người dùng'}`}
                    />
                  </td>
                  <td>
                    <div className="umt-user-cell">
                      <img 
                        src={user.avatar ?? '/default-avatar.png'} 
                        alt={user.name ?? 'avatar'} 
                        className="umt-user-avatar" 
                      />
                      <div className="umt-user-info">
                        <span className="umt-user-name">{user.name ?? 'Không tên'}</span>
                        <span className="umt-user-id">ID: {user.id ?? '???'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="umt-phone">{user.phone ?? 'Chưa có'}</td>
                  <td>
                    <span className="umt-service-tag">{user.district ?? 'Chưa rõ'}</span>
                  </td>
                  <td>
                    <span className="umt-status-badge" style={{ color: statusColor, backgroundColor: statusBg }}>
                      <span className="umt-status-dot" style={{ backgroundColor: statusColor }}></span>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="umt-actions">
                      <button className="umt-btn-detail" onClick={() => handleViewDetail(user)}>
                        Chi tiết
                      </button>

                      {user.status === 'pending' ?
                        <button className="umt-btn-secondary" onClick={() => approveUser(user.id)} type="button">
                          Duyệt
                        </button>
                      :
                        <button className="umt-btn-secondary" onClick={() => toggleLockStatus(user.id)} type="button">
                          {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="umt-empty">
                  Không có dữ liệu phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="umt-footer">
        <span className="umt-footer-text">
          Hiển thị {paginatedUsers.length} trong {filteredUsers.length} {activeRole === 'technician' ? 'thợ sửa chữa' : 'khách hàng'}
        </span>

        <div className="umt-pagination">
          <button className="umt-page-btn" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={safePage === 1}>
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                className={`umt-page-btn ${page === safePage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className="umt-page-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
