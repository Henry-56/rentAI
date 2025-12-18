import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userCheck = await query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            res.status(400).json({ message: "El usuario ya existe" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

        const result = await query(
            `INSERT INTO "User" (email, name, password, role, "avatarUrl") 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, "avatarUrl"`,
            [email, name, hashedPassword, role, avatarUrl]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(400).json({ message: "Credenciales inválidas" });
            return;
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            res.status(400).json({ message: "Credenciales inválidas" });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        // Remove password from response
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
        const result = await query('SELECT id, email, name, role, "avatarUrl", "phoneNumber" FROM "User" WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
});

export default router;
