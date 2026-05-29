import { z } from "zod";
import { emailSchema } from "./shared";

export const signupSchema = z.object({
    name: z
        .string("กรุณาระบุชื่อ")
        .trim()
        .min(1, { message: "กรุณาระบุชื่อ" }),
    email: emailSchema,
    password: z
        .string("กรุณาระบุรหัสผ่าน")
        .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

export const signinSchema = z.object({
    email: emailSchema,
    password: z
        .string("กรุณาระบุรหัสผ่าน")
        .min(1, { message: "กรุณาระบุรหัสผ่าน" }),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z
        .string("ไม่พบโทเค็น")
        .min(1, { message: "ไม่พบโทเค็น" }),
    newPassword: z
        .string("กรุณาระบุรหัสผ่านใหม่")
        .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
