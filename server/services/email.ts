import nodemailer from 'nodemailer';
import path from 'path';

// Load from env or use defaults (Replace with Real Credentials for Prod)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rentai.com';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export const sendKycAlert = async (userDetails: any, files: any, approvalLink: string) => {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn("⚠️ Email credentials missing. KYC Alert mocked.");
        console.log(`[MOCK EMAIL] To: ${ADMIN_EMAIL}, Link: ${approvalLink}`);
        return;
    }

    const attachments = Object.values(files).flat().map((file: any) => ({
        filename: file.originalname,
        path: file.path
    }));

    const mailOptions = {
        from: `"RentAI Security" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🔍 Nueva Verificación Requerida: ${userDetails.name}`,
        html: `
            <h2>Validación de Identidad Requerida</h2>
            <p>El usuario <b>${userDetails.name}</b> (${userDetails.email}) se ha registrado y requiere validación.</p>
            <p>Se adjuntan los documentos: DNI (Frente/Dorso) y Recibo de Luz.</p>
            <br/>
            <a href="${approvalLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                VALIDAR CUENTA CON UN CLIC
            </a>
            <p><small>Si el botón no funciona: ${approvalLink}</small></p>
        `,
        attachments: attachments
    };

    await transporter.sendMail(mailOptions);
};

export const sendAccountApproved = async (userEmail: string, userName: string) => {
    if (!SMTP_USER || !SMTP_PASS) return;

    await transporter.sendMail({
        from: `"RentAI" <${SMTP_USER}>`,
        to: userEmail,
        subject: `🎉 Cuenta Aprobada`,
        html: `
            <h2>¡Hola ${userName}!</h2>
            <p>Tu identidad ha sido verificada.</p>
            <p>Ya puedes iniciar sesión y alquilar en RentAI.</p>
        `
    });
};
