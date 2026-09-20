import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Вспомогательная функция для хеширования токена (чтобы не хранить голый токен в БД)
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// --- REGISTER ---
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error('Користувач з таким email вже існує');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// --- LOGIN ---
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401);
    throw new Error('Невірний email або пароль');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Невірний email або пароль');
  }

  // 1. Генерируем Access Token (короткий — 15 минут)
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: '15m' },
  );

  // 2. Генерируем случайный Refresh Token (30 дней)
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const hashedRefreshToken = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 дней

  // 3. Сохраняем ХЕШ токена в базу
  await prisma.refreshToken.create({
    data: {
      hashedToken: hashedRefreshToken,
      userId: user.id,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
    },
  });

  // 4. Отправляем Refresh Token в HttpOnly куку
  res.cookie('refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // 5. Отдаем Access Token и данные юзера
  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
  });
});

// --- REFRESH TOKEN ---
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies.refreshToken;

  if (!rawRefreshToken) {
    res.status(401);
    throw new Error('Refresh токен відсутній');
  }

  const hashed = hashToken(rawRefreshToken);

  // Ищем токен в базе
  const savedToken = await prisma.refreshToken.findUnique({
    where: { hashedToken: hashed },
    include: { user: true },
  });

  // Если токена нет, он отозван или протух
  if (
    !savedToken ||
    savedToken.revokedAt ||
    savedToken.expiresAt < new Date()
  ) {
    res.status(401);
    throw new Error('Недійсний або прострочений refresh токен');
  }

  // Ротация: старый токен отзываем
  await prisma.refreshToken.update({
    where: { id: savedToken.id },
    data: { revokedAt: new Date() },
  });

  // Выпускаем новую пару токенов
  const newAccessToken = jwt.sign(
    { userId: savedToken.userId },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: '15m' },
  );

  const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
  const newHashedRefreshToken = hashToken(newRawRefreshToken);

  await prisma.refreshToken.create({
    data: {
      hashedToken: newHashedRefreshToken,
      userId: savedToken.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
    },
  });

  res.cookie('refreshToken', newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ accessToken: newAccessToken });
});

// --- LOGOUT ---
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies.refreshToken;

  if (rawRefreshToken) {
    const hashed = hashToken(rawRefreshToken);
    // Удаляем или отзываем сессию в БД
    await prisma.refreshToken.deleteMany({
      where: { hashedToken: hashed },
    });
  }

  // Очищаем куку
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Успішний вихід із системи' });
});
