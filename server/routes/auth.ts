import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { upload } from '../middleware/upload';
import { sendKycAlert, sendAccountApproved } from '../services/email';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Register with KYC
router.post('/register', upload.fields([
    { name: 'dniFront', maxCount: 1 },
    { name: 'dniBack', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
]), async (req: any, res: any) => {
    try {
        const { name, email, password, role } = req.body;
        const files = req.files;

        if (!files || !files.dniFront || !files.dniBack || !files.utilityBill) {
            return res.status(400).json({ message: "Faltan documentos requeridos (DNI y Recibo)" });
        }

        // Check if user exists
        const userCheck = await query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

        // Store file paths
        const documents = {
            dniFront: files.dniFront[0].path,
            dniBack: files.dniBack[0].path,
            utilityBill: files.utilityBill[0].path
        };

        const id = crypto.randomUUID();

        const result = await query(
            `INSERT INTO "User" (id, email, name, password, role, "avatarUrl", status, documents, "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, NOW()) RETURNING id, email, name, role, "avatarUrl"`,
            [id, email, name, hashedPassword, role, avatarUrl, JSON.stringify(documents)]
        );

        const user = result.rows[0];

        // Generate Approval Token (JWT with specific purpose)
        const approvalToken = jwt.sign({ userId: user.id, type: 'KYC_APPROVAL' }, JWT_SECRET, { expiresIn: '7d' });
        const approvalLink = `${API_URL}/api/auth/approve?token=${approvalToken}`;

        // Send Email to Admin
        await sendKycAlert({ name, email }, files, approvalLink);

        res.status(201).json({
            message: "Registro exitoso. Tu cuenta está en revisión.",
            user: { ...user, status: 'PENDING' }
        });

    } catch (error: any) {
        console.error("Register error DETAILS:", error);
        // RETURN ERROR MESSAGE FOR DEBUGGING (Temporary/Dev mode)
        res.status(500).json({
            message: error.message || "Error interno del servidor",
            stack: error.stack
        });
    }
});

// Admin Approval Endpoint (Clicked via Email)
router.get('/approve', async (req: any, res: any) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send("Token faltante");

        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'KYC_APPROVAL') return res.status(400).send("Token inválido");

        // Update User Status
        const update = await query(
            `UPDATE "User" SET status = 'VERIFIED' WHERE id = $1 RETURNING email, name`,
            [decoded.userId]
        );

        if (update.rows.length === 0) return res.status(404).send("Usuario no encontrado");

        const user = update.rows[0];

        // Notify User
        await sendAccountApproved(user.email, user.name);

        res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: green;">¡Cuenta Verificada!</h1>
                    <p>El usuario <b>${user.name}</b> (${user.email}) ha sido aprobado.</p>
                    <p>Ya puede iniciar sesión en la plataforma.</p>
                </body>
            </html>
        `);

    } catch (error) {
        console.error("Approval error:", error);
        res.status(400).send("Enlace inválido o expirado");
    }
});

// Login (Updated with Status Check)
router.post('/login', async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        // KYC CHECK
        if (user.status !== 'VERIFIED') {
            return res.status(403).json({
                message: "Cuenta pendiente de validación. Revisa tu correo o espera la aprobación del administrador.",
                status: user.status
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password;

        res.json({ token, user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// Switch Role
router.post('/switch-role', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: "No autenticado" });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Get current role
        const userRes = await query('SELECT role, email, name, "avatarUrl" FROM "User" WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        const currentUser = userRes.rows[0];
        const newRole = currentUser.role === 'OWNER' ? 'RENTER' : 'OWNER';

        // Update DB
        await query('UPDATE "User" SET role = $1 WHERE id = $2', [newRole, userId]);

        // Generate new token
        const newToken = jwt.sign({ id: userId, role: newRole }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token: newToken,
            user: { ...currentUser, id: userId, role: newRole }
        });

    } catch (error) {
        console.error("Switch role error:", error);
        res.status(500).json({ message: "Error cambiando de rol" });
    }
});

// Get Current User
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: "No autenticado" });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const result = await query('SELECT id, email, name, role, "avatarUrl", "phoneNumber", status FROM "User" WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        const user = result.rows[0];

        // STRICT VERIFICATION CHECK
        if (user.status && user.status !== 'VERIFIED') {
            return res.status(403).json({
                message: "Cuenta pendiente de validación.",
                status: user.status
            });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
});

export default router;
