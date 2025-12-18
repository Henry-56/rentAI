import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be mounted here
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import rentalRoutes from './routes/rentals';

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/rentals', rentalRoutes);

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
});

// Keep process alive (failsafe)
setInterval(() => {
    // Heartbeat to keep event loop active if something else closes handles
}, 1000 * 60 * 60);

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
