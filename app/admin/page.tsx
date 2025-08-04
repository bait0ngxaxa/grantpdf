'use client'

import { useEffect, useState } from 'react'

type Contract = {
  id: string
  name: string
  email: string
  createdAt: string
  pdfUrl: string
}

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // mock data
  useEffect(() => {
    setContracts([
      {
        id: '1',
        name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        createdAt: '2025-08-01',
        pdfUrl: '/sample-contract.pdf',
      },
      {
        id: '2',
        name: 'สุนีย์ พิทักษ์',
        email: 'sunee@example.com',
        createdAt: '2025-08-01',
        pdfUrl: '/sample-contract.pdf',
      },
    ])
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-md">
          <div className="stat-title">จำนวนสัญญาทั้งหมด</div>
          <div className="stat-value">{contracts.length}</div>
        </div>
      </div>

      {/* Contract table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อผู้ใช้</th>
              <th>อีเมล</th>
              <th>วันที่</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={c.id}>
                <th>{i + 1}</th>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.createdAt}</td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setPreviewUrl(c.pdfUrl)}
                  >
                    พรีวิว
                  </button>
                  <a href={c.pdfUrl} download className="btn btn-sm btn-primary">
                    ดาวน์โหลด
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF preview modal */}
      {previewUrl && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-2">พรีวิวสัญญา</h3>
            <iframe src={previewUrl} className="w-full h-[70vh] border" />
            <div className="modal-action">
              <form method="dialog">
                <button className="btn" onClick={() => setPreviewUrl(null)}>
                  ปิด
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
