'use client';

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    selectedFileType: string;
    setSelectedFileType: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
}

export default function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedFileType,
    setSelectedFileType,
    selectedStatus,
    setSelectedStatus
}: SearchAndFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <input
                type="text"
                placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง..."
                className="input input-bordered w-full sm:w-80 rounded-full border-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    className="select select-bordered w-full sm:w-auto rounded-full border-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="createdAtDesc">เรียงตามวันที่สร้าง (ใหม่สุด)</option>
                    <option value="createdAtAsc">เรียงตามวันที่สร้าง (เก่าสุด)</option>
                    <option value="statusDoneFirst">เรียงตามสถานะ (เสร็จก่อน)</option>
                    <option value="statusPendingFirst">เรียงตามสถานะ (รอก่อน)</option>
                    <option value="statusApproved">เรียงตามสถานะ (อนุมัติก่อน)</option>
                    <option value="statusPending">เรียงตามสถานะ (รอดำเนินการก่อน)</option>
                    <option value="statusRejected">เรียงตามสถานะ (ไม่อนุมัติก่อน)</option>
                </select>
                <select
                    className="select select-bordered w-full sm:w-auto rounded-full border-2"
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                >
                    <option value="ไฟล์ทั้งหมด">ไฟล์ทั้งหมด</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">Word</option>
                </select>
                <select
                    className="select select-bordered w-full sm:w-auto rounded-full border-2"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="สถานะทั้งหมด">สถานะทั้งหมด</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="อนุมัติ">อนุมัติ</option>
                    <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                </select>
            </div>
        </div>
    );
}