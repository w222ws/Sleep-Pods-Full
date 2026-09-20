import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { prisma } from './lib/prisma.js';
import podRoutes from './routes/pod.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import authRoutes from './routes/auth.routes.js';

import { errorHandler } from './middlewares/error.middleware.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/pods', podRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    const podsCount = await prisma.pod.count();
    res.json({ status: 'ok', database: 'connected', podsCount });
  }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
