'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, FormEvent } from 'react';

// --- Mock User Data ---
// In a real application, this data would be fetched from your backend API.
interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  createdAt: string;
}

const mockUsers: UserData[] = [
  { id: 'user-101', name: 'สมชาย ใจดี', email: 'somchai@example.com', role: 'admin', createdAt: '2023-01-15T10:00:00Z' },
  { id: 'user-102', name: 'สมหญิง รักชาติ', email: 'somying@example.com', role: 'member', createdAt: '2023-02-20T11:30:00Z' },
  { id: 'user-103', name: 'มานะ พากเพียร', email: 'mana@example.com', role: 'member', createdAt: '2023-03-01T08:45:00Z' },
  { id: 'user-104', name: 'ปรีชา อดทน', email: 'preecha@example.com', role: 'member', createdAt: '2023-04-10T15:00:00Z' },
  { id: 'user-105', name: 'วิไล ใฝ่รู้', email: 'wilai@example.com', role: 'member', createdAt: '2023-05-05T09:00:00Z' },
];

export default function AdminUserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>(mockUsers); // State to hold user data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Authorization Check ---
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/access-denied');
    }
  }, [session, status, router]);

  // --- Edit Modal Functions ---
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditFormData({ name: '', email: '', role: '' });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    // Simulate API call to update user
    try {
      console.log('Updating user:', selectedUser.id, editFormData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Update the user in the local state (in a real app, you'd refetch from API)
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? { ...user, ...editFormData, role: editFormData.role as 'member' | 'admin' } : user
        )
      );
      closeEditModal();
      alert('อัปเดตข้อมูลผู้ใช้สำเร็จ!'); // Using alert for simplicity, consider a custom toast/modal
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Modal Functions ---
  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    // Simulate API call to delete user
    try {
      console.log('Deleting user:', selectedUser.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Remove the user from the local state (in a real app, you'd refetch from API)
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      closeDeleteModal();
      alert('ลบผู้ใช้สำเร็จ!'); // Using alert for simplicity
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* --- Admin Navbar --- */}
      <div className="navbar bg-base-100 shadow-lg px-6">
        <div className="flex-1">
          <Link href="/admin" className="btn btn-ghost text-xl">
            Admin Panel
          </Link>
        </div>
        <div className="flex-none">
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block font-medium text-base-content">
              สวัสดี, {session.user?.name} (Admin)
            </span>
            <Link href="/admin" className="btn btn-primary">
                กลับสู่แดชบอร์ดแอดมิน
            </Link>
            <button onClick={() => signOut()} className="btn btn-primary">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">การจัดการผู้ใช้งาน</h1>

        <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl mb-8">
          <table className="table w-full">
            <thead>
              <tr className="text-lg">
                <th>ID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>วันที่สร้าง</th>
                <th>การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="font-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-sm btn-info text-white"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="btn btn-sm btn-error text-white"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">ไม่พบผู้ใช้งาน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Edit User Modal --- */}
      {isEditModalOpen && selectedUser && (
        <dialog id="edit_user_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">แก้ไขผู้ใช้งาน: {selectedUser.name}</h3>
            <form onSubmit={handleUpdateUser} className="py-4 space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">ชื่อ</span></label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">อีเมล</span></label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  required
                  disabled // Email is usually not editable
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">บทบาท (Role)</span></label>
                <select
                  name="role"
                  className="select select-bordered w-full"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
                <button type="button" className="btn" onClick={closeEditModal}>ยกเลิก</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeEditModal}>ปิด</button>
          </form>
        </dialog>
      )}

      {/* --- Delete User Confirmation Modal --- */}
      {isDeleteModalOpen && selectedUser && (
        <dialog id="delete_user_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">ยืนยันการลบผู้ใช้งาน</h3>
            <p className="py-4">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน **{selectedUser.name}** ({selectedUser.email})?</p>
            <p className="text-sm text-warning">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDeleteUser} disabled={isDeleting}>
                {isDeleting ? 'กำลังลบ...' : 'ลบ'}
              </button>
              <button className="btn" onClick={closeDeleteModal}>ยกเลิก</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeDeleteModal}>ปิด</button>
          </form>
        </dialog>
      )}
    </div>
  );
}