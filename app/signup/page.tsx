'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ✅ Toast Notification */}
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg">
            <span>สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</span>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md shadow-xl bg-base-100 p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">สมัครสมาชิก</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">ชื่อ</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">อีเมล</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">รหัสผ่าน</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-error text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/signin" passHref>
                <span className="link link-hover text-primary font-semibold">
                  เข้าสู่ระบบ
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
