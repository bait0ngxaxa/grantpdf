import nodemailer from "nodemailer";

interface SendPasswordResetEmailProps {
    email: string;
    resetLink: string;
}

export const sendPasswordResetEmail = async ({
    email,
    resetLink,
}: SendPasswordResetEmailProps) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "คำขอรีเซ็ตรหัสผ่าน",
        html: `
            <h1>รีเซ็ตรหัสผ่านของคุณ</h1>
            <h2>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณแล้ว</h2>
            <h2><a href="${resetLink}">ตั้งรหัสผ่านใหม่</a></h2>
            <h2>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</h2>
        `,
    };

    await transporter.sendMail(mailOptions);
};
