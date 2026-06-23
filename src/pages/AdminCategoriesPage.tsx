import React, { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { FaPencil, FaPlus, FaTrash, FaImage } from 'react-icons/fa6';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
  type Category as CategoryItem,
} from '../services/categoryService';
import './AdminCategoriesPage.css';

type Category = {
  id: string;
  title: string;
  short: string;
  priority?: 'high' | 'normal' | 'low';
  status?: 'active' | 'inactive';
  iconUrl?: string | null;
};

const mapApiCategory = (category: CategoryItem): Category => ({
  id: category.id,
  title: category.title,
  short: category.description,
  priority: (category.priority?.toLowerCase() as Category['priority']) || 'normal',
  status: (category.status?.toLowerCase() as Category['status']) || 'active',
  iconUrl: category.iconUrl ?? null,
});

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openNew = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (cat: Category) => {
    setDeleteTarget(cat);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
  };

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await getCategories();
        if (!active) return;
        setCategories(items.map(mapApiCategory));
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError?.message || 'Không thể tải danh mục dịch vụ');
        setCategories([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  // modal controlled fields
  const [mTitle, setMTitle] = useState('');
  const [mShort, setMShort] = useState('');
  const [mPriority, setMPriority] = useState<Category['priority']>('normal');
  const [mStatus, setMStatus] = useState<Category['status']>('active');
  
  const [mIconUrl, setMIconUrl] = useState<string | null>(null);
  const [mIconFile, setMIconFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // when opening modal populate fields
  React.useEffect(() => {
    if (isModalOpen && editing) {
      setMTitle(editing.title);
      setMShort(editing.short);
      setMPriority(editing.priority ?? 'normal');
      setMStatus(editing.status ?? 'active');
      
      setMIconUrl(editing.iconUrl ?? null);
      setMIconFile(null);
    } else if (isModalOpen && !editing) {
      setMTitle(''); setMShort(''); setMPriority('normal'); setMStatus('active');
      setMIconUrl(null);
      setMIconFile(null);
    }
  }, [isModalOpen, editing]);

  const handleIconFile = (file?: File) => {
    if (!file) return;
    setMIconFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setMIconUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const submitCategory = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: mTitle.trim(),
        description: mShort.trim(),
        priority: mPriority || 'normal',
        status: mStatus || 'active',
        icon: mIconFile,
      };

      const saved = editing
        ? await updateCategory(editing.id, payload)
        : await createCategory(payload);

      const mapped = mapApiCategory(saved);

      setCategories((cur) => {
        const index = cur.findIndex((item) => item.id === mapped.id);
        if (index >= 0) {
          const next = [...cur];
          next[index] = mapped;
          return next;
        }
        return [mapped, ...cur];
      });

      setIsModalOpen(false);
    } catch (saveError: any) {
      setError(saveError?.message || 'Lưu danh mục thất bại');
    } finally {
      setSaving(false);
    }
  };

  const submitDeleteCategory = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await deleteCategory(deleteTarget.id);
      setCategories((cur) => cur.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Xóa danh mục thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      setSaving(true);
      setError(null);
      const nextStatus = category.status === 'active' ? 'inactive' : 'active';
      const updated = await updateCategoryStatus(category.id, nextStatus);
      const mapped = mapApiCategory(updated);
      setCategories((cur) => cur.map((item) => (item.id === mapped.id ? mapped : item)));
    } catch (statusError: any) {
      setError(statusError?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="acp-layout">
      <AdminSidebar activeItem="categories" />
      <main className="acp-main">
        <AdminHeader />

        <div className="acp-header-row">
          <div>
            <h1>Danh mục dịch vụ</h1>
            <p>Quản lý các loại hình dịch vụ và cấu hình ưu tiên, trạng thái hiển thị.</p>
          </div>
          <div>
            <button className="acp-btn-primary" onClick={openNew}><FaPlus /> Thêm dịch vụ</button>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#e0f2fe', color: '#075985' }}>
            Đang tải danh mục dịch vụ...
          </div>
        )}

        <section className="acp-grid">
          {categories.map(cat => (
            <article className="acp-card" key={cat.id}>
                <div className="acp-card-body">
                <div className="acp-card-media" aria-hidden>
                  <div className={`acp-media-badge`}>
                    {cat.iconUrl ? (
                      <img src={cat.iconUrl} alt={cat.title} style={{width:36,height:36,objectFit:'cover',borderRadius:8}} />
                    ) : (
                      <FaImage />
                    )}
                  </div>
                </div>
                <div className="acp-card-content">
                  <strong>{cat.title}</strong>
                  <p>{cat.short}</p>
                </div>
              </div>
              <div className="acp-card-footer">
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span className={`acp-status-pill ${cat.status === 'active' ? 'active' : 'inactive'}`}>
                    {cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </span>
                  <small>Ưu tiên: {cat.priority === 'high' ? 'Cao' : cat.priority === 'normal' ? 'Bình thường' : 'Thấp'}</small>
                </div>
                <div className="acp-card-actions">
                  <button type="button" onClick={() => openEdit(cat)} aria-label="Sửa"><FaPencil /></button>
                  <button type="button" onClick={() => toggleStatus(cat)} aria-label="Đổi trạng thái" disabled={saving}>
                    {cat.status === 'active' ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button type="button" onClick={() => openDeleteConfirm(cat)} aria-label="Xóa" disabled={deletingId === cat.id}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!loading && !error && categories.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
              Chưa có danh mục dịch vụ nào.
            </div>
          )}
        </section>

              {isModalOpen && (
          <div className="acp-modal-overlay" role="presentation" onClick={() => setIsModalOpen(false)}>
            <aside className="acp-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
              <header className="acp-modal-head">
                <h2>{editing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
                <button className="acp-close" onClick={() => setIsModalOpen(false)}>×</button>
              </header>

              <div className="acp-modal-body">
                <label>
                  <span>Icon đại diện</span>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:72,height:72,background:'#f3f4f6',borderRadius:12,display:'grid',placeItems:'center'}}>
                      {mIconUrl ? <img src={mIconUrl} alt="icon" style={{width:56,height:56,objectFit:'cover',borderRadius:8}} /> : <FaImage />}
                    </div>
                    <div>
                      <button type="button" className="acp-btn-ghost" onClick={() => fileInputRef.current?.click()}>Thay đổi icon</button>
                      <div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>Dung lượng tối đa 2MB. Định dạng: SVG, PNG, JPG.</div>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={(e) => { const f = e.target.files?.[0]; if(f) handleIconFile(f); }} />
                </label>
                <label>
                  <span>Tên dịch vụ</span>
                  <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} />
                </label>

                <label>
                  <span>Mô tả ngắn</span>
                  <textarea value={mShort} onChange={(e) => setMShort(e.target.value)} rows={6} />
                </label>

                <label style={{marginTop:12}}>
                  <span>Trạng thái</span>
                  <select value={mStatus} onChange={(e) => setMStatus(e.target.value as Category['status'])}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </label>

                <label style={{marginTop:12}}>
                  <span>Mức độ ưu tiên</span>
                  <select value={mPriority} onChange={(e) => setMPriority(e.target.value as Category['priority'])}>
                    <option value="high">Cao</option>
                    <option value="normal">Bình thường</option>
                    <option value="low">Thấp</option>
                  </select>
                </label>

                

                </div>

              <div className="acp-modal-footer">
                <div>
                  <button className="acp-btn-ghost" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                </div>
                <div>
                  <button className="acp-btn-primary" onClick={() => submitCategory()} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {deleteTarget && (
          <div className="acp-confirm-overlay" role="presentation" onClick={closeDeleteConfirm}>
            <aside className="acp-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-category-title" onClick={(event) => event.stopPropagation()}>
              <h2 id="delete-category-title">Xác nhận xóa dịch vụ</h2>
              <p>
                Bạn có chắc chắn muốn xóa dịch vụ <strong>{deleteTarget.title}</strong> không?
                Hành động này sẽ ẩn danh mục khỏi hệ thống.
              </p>

              <div className="acp-confirm-actions">
                <button type="button" className="acp-btn-ghost" onClick={closeDeleteConfirm}>
                  Hủy bỏ
                </button>
                <button type="button" className="acp-btn-danger" onClick={submitDeleteCategory} disabled={deletingId === deleteTarget.id}>
                  {deletingId === deleteTarget.id ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCategoriesPage;
