'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

// This is mock data to simulate a list of created PDF files.
// In a real application, you would fetch this data from your backend API.
const mockPdfFiles = [
  {
    id: 'file-123',
    fileName: 'ใบเสนอราคา_โครงการบ้าน.pdf',
    createdAt: '2024-05-20T10:00:00Z',
    lastModified: '2024-05-21T10:30:00Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'file-456',
    fileName: 'สัญญาจ้าง_ออกแบบภายใน.pdf',
    createdAt: '2024-05-18T14:30:00Z',
    lastModified: '2024-05-19T09:15:00Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'file-789',
    fileName: 'รายงานประจำเดือน_พฤษภาคม.pdf',
    createdAt: '2024-05-15T08:00:00Z',
    lastModified: '2024-05-15T08:00:00Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'file-101',
    fileName: 'บันทึกการประชุม_ทีม A.pdf',
    createdAt: '2024-05-22T11:00:00Z',
    lastModified: '2024-05-22T11:00:00Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'file-102',
    fileName: 'คู่มือการใช้งาน_ระบบใหม่.pdf',
    createdAt: '2024-05-10T09:00:00Z',
    lastModified: '2024-05-10T09:00:00Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAtDesc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

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

  const filteredAndSortedPdfs = useMemo(() => {
    let filtered = mockPdfFiles.filter(file =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, sortBy]);


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="navbar bg-base-100 shadow-lg px-6">
        <div className="flex-1">
          <Link href="/userdashboard" className="btn btn-ghost text-xl">
            PDF Dashboard
          </Link>
        </div>
        <div className="flex-none">
          {session && (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block font-medium">สวัสดี, {session.user?.name}</span>
              
              {session.user?.role === 'admin' && (
                <Link href="/admin" className="btn btn-secondary">
                  Admin Panel
                </Link>
              )}
              
              <button onClick={() => signOut()} className="btn btn-primary">
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">เอกสาร PDF ของฉัน</h1>
          <Link href="/createdocs" className="btn btn-primary">
            สร้างเอกสารใหม่
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="ค้นหาชื่อไฟล์..."
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

        <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
          <table className="table w-full">
            <thead>
              <tr className="text-lg">
                <th>ชื่อไฟล์</th>
                <th>สร้างเมื่อ</th>
                <th>แก้ไขล่าสุด</th>
                <th>การกระทำ</th>
              </tr>
            </thead>
            {/* FIX: Removed whitespace around the conditional rendering inside <tbody> */}
            <tbody>{
              filteredAndSortedPdfs.length > 0 ? (
                filteredAndSortedPdfs.map((file) => (
                  <tr key={file.id}>
                    <td className="font-semibold">{file.fileName}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>{new Date(file.lastModified).toLocaleDateString('th-TH')}</td>
                    <td className="flex space-x-2">
                      <button
                        onClick={() => openPreviewModal(file.pdfUrl, file.fileName)}
                        className="btn btn-sm btn-success text-white"
                      >
                        พรีวิว
                      </button>
                      <Link href={`/edit/${file.id}`} className="btn btn-sm btn-info text-white">
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">ไม่พบเอกสาร PDF</td>
                </tr>
              )
            }</tbody>
          </table>
        </div>
      </div>
      
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
    </div>
  );
}