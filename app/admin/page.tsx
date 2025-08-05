'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

// --- Mock Data ---
// In a real application, this data would be fetched from your backend API.
interface PdfFile { // Define interface for better type safety
  id: string;
  fileName: string;
  createdAt: string;
  lastModified: string;
  userId: string;
  userName: string;
  pdfUrl: string;
}

const initialMockPdfFiles: PdfFile[] = [ // Changed to initial data to allow state modification
  {
    id: 'pdf-1',
    fileName: 'ใบเสนอราคา_โปรเจกต์ A.pdf',
    createdAt: '2024-07-25T10:00:00Z',
    lastModified: '2024-07-25T10:30:00Z',
    userId: 'user-101',
    userName: 'สมชาย ใจดี',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Example public PDF
  },
  {
    id: 'pdf-2',
    fileName: 'สัญญา_บริการ B.pdf',
    createdAt: '2024-07-22T14:30:00Z',
    lastModified: '2024-07-23T09:15:00Z',
    userId: 'user-102',
    userName: 'สมหญิง รักชาติ',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pdf-3',
    fileName: 'รายงานประจำเดือน_กรกฎาคม.pdf',
    createdAt: '2024-07-18T08:00:00Z',
    lastModified: '2024-07-18T08:00:00Z',
    userId: 'user-101',
    userName: 'สมชาย ใจดี',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pdf-4',
    fileName: 'แผนงาน_Q3_2024.pdf',
    createdAt: '2024-07-10T11:45:00Z',
    lastModified: '2024-07-10T11:45:00Z',
    userId: 'user-103',
    userName: 'มานะ พากเพียร',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pdf-5',
    fileName: 'เอกสารประชุม_20240705.pdf',
    createdAt: '2024-07-05T16:00:00Z',
    lastModified: '2024-07-05T16:00:00Z',
    userId: 'user-102',
    userName: 'สมหญิง รักชาติ',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pdf-6',
    fileName: 'คู่มือการใช้งาน_V2.pdf',
    createdAt: '2024-06-30T09:00:00Z',
    lastModified: '2024-07-01T10:00:00Z',
    userId: 'user-101',
    userName: 'สมชาย ใจดี',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>(initialMockPdfFiles); // FIX: Use state for pdfFiles
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAtDesc');

  // State for managing the PDF preview modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // FIX: State for managing the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFileForDeletion, setSelectedFileForDeletion] = useState<PdfFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Authorization Check ---
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/access-denied');
    }
  }, [session, status, router]);

  // --- PDF Preview Modal Functions ---
  const openPreviewModal = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsModalOpen(true);
  };
  
  const closePreviewModal = () => {
    setIsModalOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
  };

  // --- Delete PDF Functions ---
  const openDeleteModal = (file: PdfFile) => {
    setSelectedFileForDeletion(file);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFileForDeletion(null);
  };

  const handleDeleteFile = async () => {
    if (!selectedFileForDeletion) return;

    setIsDeleting(true);
    // Simulate API call to delete the PDF file
    try {
      console.log('Deleting PDF file:', selectedFileForDeletion.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Remove the file from the local state
      setPdfFiles(prevFiles => prevFiles.filter(file => file.id !== selectedFileForDeletion.id));
      closeDeleteModal();
      // Consider a more user-friendly notification (e.g., a toast message)
      alert('ลบเอกสาร PDF สำเร็จ!'); 
    } catch (error) {
      console.error('Failed to delete PDF file:', error);
      alert('เกิดข้อผิดพลาดในการลบเอกสาร PDF');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Data Filtering and Sorting ---
  const filteredAndSortedPdfs = useMemo(() => {
    let filtered = pdfFiles.filter(file => // FIX: Use pdfFiles state
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortBy === 'createdAtAsc') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

    return filtered;
  }, [searchTerm, sortBy, pdfFiles]); // FIX: Add pdfFiles to dependencies

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
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
            <Link href="/userdashboard" className="btn btn-primary">
                กลับสู่แดชบอร์ดผู้ใช้
            </Link>
            <button onClick={() => signOut()} className="btn btn-primary">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">ภาพรวมระบบ</h1>

        {/* --- System Overview Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="stat-title">จำนวนเอกสาร PDF</div>
              <div className="stat-value text-primary">{pdfFiles.length}</div> {/* FIX: Use pdfFiles.length */}
              <div className="stat-desc">เอกสารทั้งหมดในระบบ</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <div className="stat-title">ผู้ใช้งานทั้งหมด</div>
              <div className="stat-value text-secondary">3</div> {/* Mock user count */}
              <div className="stat-desc">ผู้ใช้งานทั้งหมดในระบบ</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              </div>
              <div className="stat-title">เอกสารล่าสุด</div>
              <div className="stat-value text-accent">{pdfFiles[0]?.fileName || 'ไม่มี'}</div> {/* FIX: Use pdfFiles[0] */}
              <div className="stat-desc">สร้างเมื่อ {pdfFiles[0]?.createdAt ? new Date(pdfFiles[0].createdAt).toLocaleDateString('th-TH') : ''}</div> {/* FIX: Use pdfFiles[0] */}
            </div>
          </div>
        </div>

        {/* --- PDF Management Section --- */}
        <h2 className="text-2xl font-bold mb-4">การจัดการเอกสาร PDF</h2>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="ค้นหาชื่อไฟล์ หรือ ผู้สร้าง..."
            className="input input-bordered w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select select-bordered w-full sm:w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAtDesc">เรียงตามวันที่สร้าง (ใหม่สุด)</option>
            <option value="createdAtAsc">เรียงตามวันที่สร้าง (เก่าสุด)</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl mb-8">
          <table className="table w-full">
            <thead>
              <tr className="text-lg">
                <th>ชื่อไฟล์</th>
                <th>ผู้สร้าง</th>
                <th>สร้างเมื่อ</th>
                <th>แก้ไขล่าสุด</th>
                <th>การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPdfs.length > 0 ? (
                filteredAndSortedPdfs.map((file) => (
                  <tr key={file.id}>
                    <td className="font-semibold">{file.fileName}</td>
                    <td>{file.userName}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>{new Date(file.lastModified).toLocaleDateString('th-TH')}</td>
                    <td className="flex space-x-2">
                      <button
                        onClick={() => openPreviewModal(file.pdfUrl, file.fileName)}
                        className="btn btn-sm btn-success text-white"
                      >
                        พรีวิว
                      </button>
                      <a 
                        href={file.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-info text-white"
                        download
                      >
                        ดาวน์โหลด
                      </a>
                      {/* FIX: Add Delete button */}
                      <button
                        onClick={() => openDeleteModal(file)}
                        className="btn btn-sm btn-error text-white"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">ไม่พบเอกสาร PDF</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- User Management Section --- */}
        <h2 className="text-2xl font-bold mb-4">การจัดการผู้ใช้งาน</h2>
        <div className="bg-base-100 p-6 rounded-xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-lg">จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ</p>
          <Link href="/admin/users" className="btn btn-secondary">
            ไปที่หน้าจัดการผู้ใช้งาน
          </Link>
        </div>
      </div>

      {/* --- PDF Preview Modal --- */}
      {isModalOpen && (
        <dialog id="pdf_preview_modal" className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{previewTitle}</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={closePreviewModal}>✕</button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <iframe
                src={previewUrl}
                title={previewTitle}
                width="100%"
                height="100%"
                className="border-2 border-gray-300 rounded-lg"
              >
                เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF
              </iframe>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closePreviewModal}>ปิด</button>
          </form>
        </dialog>
      )}

      {/* FIX: Delete PDF Confirmation Modal */}
      {isDeleteModalOpen && selectedFileForDeletion && (
        <dialog id="delete_pdf_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">ยืนยันการลบเอกสาร</h3>
            <p className="py-4">คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร **{selectedFileForDeletion.fileName}**?</p>
            <p className="text-sm text-warning">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDeleteFile} disabled={isDeleting}>
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