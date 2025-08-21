'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the UserData interface to match your Prisma model (after BigInt to string conversion)
interface UserData {
  id: string; // Changed from BigInt to string for client-side representation
  name: string;
  email: string;
  role: 'member' | 'admin';
  created_at: string; // Dates will be stringified for display
}

export default function AdminUserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]); // FIX: Initialize with empty array
  const [loadingUsers, setLoadingUsers] = useState(true); // FIX: New loading state for user data
  const [fetchError, setFetchError] = useState<string | null>(null); // FIX: New state for fetch error

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

  // --- Fetch Users from API ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/users'); 
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await res.json();
      
      const processedUsers = data.users.map((user: any) => ({
        ...user,
        id: user.id.toString(),
        createdAt: new Date(user.createdAt).toLocaleDateString('th-TH'),
      }));
      setUsers(processedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setFetchError(error.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users when the component mounts and session is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [status, session]); // Depend on status and session to refetch if auth state changes

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
    try {
      // FIX: Call your actual API endpoint to update user
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Refetch users to get the latest data after update
      await fetchUsers();
      closeEditModal();
      alert('อัปเดตข้อมูลผู้ใช้สำเร็จ!');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
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
    try {
      // FIX: Call your actual API endpoint to delete user
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Refetch users to get the latest data after deletion
      await fetchUsers();
      closeDeleteModal();
      alert('ลบผู้ใช้สำเร็จ!');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || loadingUsers) {
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
            <span className="hidden sm:block font-bold text-base-content">
              {session.user?.name} ({session.user?.role})
            </span>
            <Button className='font-bold'>
            <Link href="/admin">
                กลับสู่แดชบอร์ดแอดมิน
            </Link>
            </Button>
           
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">การจัดการผู้ใช้งาน</h1>

        {fetchError && (
          <div role="alert" className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{fetchError}</span>
          </div>
        )}

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
                      <span className={`badge ${user.role === 'admin' ? 'badge badge-secondary' : 'badge  badge-info text-white'} p-3`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString("th-TH")}</td> {/* Display formatted date */}
                    <td className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-sm btn-info text-white rounded-xl"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="btn btn-sm btn-error text-white rounded-xl"
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
                <Input
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
                <Input
                  type="email"
                  name="email"
                  className="input input-bordered w-full border-2"
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
                  className="select select-bordered w-full border-2"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="modal-action">
                <Button type="submit"  disabled={isSaving}>
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
                <Button type="button" variant={'outline'} onClick={closeEditModal}>ยกเลิก</Button>
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