import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER || process.env.EMAIL_USER,
                pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === "production",
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5,
        });
    }
    return transporter;
}

interface SendPasswordResetEmailProps {
    email: string;
    resetLink: string;
}

export const sendPasswordResetEmail = async ({
    email,
    resetLink,
}: SendPasswordResetEmailProps) => {
    const transporter = getTransporter();

    const mailOptions = {
        from: `"Grant Online Support" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject: "คำขอรีเซ็ตรหัสผ่าน - Grant Online",
        text: `คุณได้ร้องขอการรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ\n\nกรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 1 ชั่วโมง):\n${resetLink}\n\nหากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลฉบับนี้`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">รีเซ็ตรหัสผ่านของคุณ</h2>
                <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong>${email}</strong> บนระบบ Grant Online</p>
                <p style="margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        ตั้งรหัสผ่านใหม่
                    </a>
                </p>
                <p style="font-size: 14px; color: #666;">
                    * ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง<br>
                    * หากคุณไม่ได้เป็นผู้ขอดำเนินการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้
                </p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    ระบบจัดการเอกสาร Grant Online
                </p>
            </body>
            </html>
        `,
    };

    await transporter.sendMail(mailOptions);
};
