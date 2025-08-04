"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link"; // FIX: Import Link component for navigation

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear any previous errors

        // Use the signIn function provided by NextAuth.js
        // It handles the API call to /api/auth/callback/credentials for us.
        const result = await signIn("credentials", {
            redirect: false, // Prevents automatic redirect so we can handle it manually
            email,
            password,
        });

        // Check the result for an error
        if (result?.error) {
            // Set the error message if the login failed
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            console.error("Login failed:", result.error);
        } else {
            // If there's no error, the login was successful.
            console.log("Login success, redirecting to /profile...");
            // FIX: Redirect to the /profile page after a successful login
            router.push("/profile");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100 p-6">
                <h2 className="text-2xl font-semibold text-center mb-4">
                    เข้าสู่ระบบ
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
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
                        <p className="text-error text-sm text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-2"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>

                {/* FIX: Add a new Link component for the sign-up page */}
                <div className="text-center mt-4">
                    <p className="text-sm">
                        ยังไม่มีบัญชี?{" "}
                        <Link href="/signup" passHref>
                            <span className="link link-hover text-primary font-semibold">
                                สมัครสมาชิก
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}