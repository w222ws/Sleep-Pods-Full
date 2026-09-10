import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { podId, customerName, customerEmail, startTime, endTime } = req.body;

    // 1. Создаем запись в Postgres
    const newBooking = await prisma.booking.create({
      data: {
        podId,
        customerName,
        customerEmail,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalPrice: 150.0, // Временно хардкод, на следующем шаге сделаем авторасчет!
      },
    });

    // 2. Отправляем сохраненную бронь клиенту
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не вдалося створити бронування" });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        pod: true,
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка при отриманні бронювань" });
  }
};
