'use client'

import { useState } from 'react'

export default function FormPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    position: '',
    agreement: false,
    details: '',
    birthdate: '',
  })

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const target = e.target
  const name = target.name
  const value =
    target instanceof HTMLInputElement && target.type === 'checkbox'
      ? target.checked
      : target.value

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }))
}

const handlesubmit = ()=>{


}


  return (
    <div className="min-h-screen bg-base-200 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-base-100 shadow-xl rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">กรอกข้อมูลสัญญา</h2>

        <form onSubmit={handlesubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="label">
              <span className="label-text">ชื่อ-นามสกุล</span>
            </label>
            <input
              type="text"
              name="fullName"
              className="input input-bordered w-full"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">อีเมล</span>
            </label>
            <input
              type="email"
              name="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="label">
              <span className="label-text">เพศ</span>
            </label>
            <div className="flex space-x-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="ชาย"
                  className="radio"
                  checked={formData.gender === 'ชาย'}
                  onChange={handleChange}
                />
                <span className="label-text ml-2">ชาย</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="หญิง"
                  className="radio"
                  checked={formData.gender === 'หญิง'}
                  onChange={handleChange}
                />
                <span className="label-text ml-2">หญิง</span>
              </label>
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="label">
              <span className="label-text">ตำแหน่งที่สมัคร</span>
            </label>
            <select
              name="position"
              className="select select-bordered w-full"
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- กรุณาเลือก --</option>
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="designer">UI/UX Designer</option>
              <option value="pm">Project Manager</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">
              <span className="label-text">วันเกิด</span>
            </label>
            <input
              type="date"
              name="birthdate"
              className="input input-bordered w-full"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>

          {/* Agreement */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                name="agreement"
                className="checkbox"
                checked={formData.agreement}
                onChange={handleChange}
              />
              <span className="label-text ml-2">ยอมรับเงื่อนไขและข้อตกลง</span>
            </label>
          </div>

          {/* Details */}
          <div>
            <label className="label">
              <span className="label-text">ข้อมูลเพิ่มเติม</span>
            </label>
            <textarea
              name="details"
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="เช่น ประสบการณ์ หรือคำอธิบายเพิ่มเติม..."
              value={formData.details}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" className="btn btn-primary w-full">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
