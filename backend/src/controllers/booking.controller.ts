import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { podId, customerName, customerEmail, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Проверка валидности дат
    if (end <= start) {
      return res.status(400).json({
        message:
          "Время окончания бронирования должно быть позже времени начала",
      });
    }

    // 2. Ищем капсулу в базе, чтобы проверить её статус и забрать цену за час
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!pod || !pod.isActive) {
      return res.status(404).json({
        message: "Капсула не найдена или недоступна для бронирования",
      });
    }

    // 3. Проверяем на овербукинг (есть ли пересечения по времени для этой капсулы)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        podId,
        AND: [
          { startTime: { lt: end } }, // существующая бронь началась до нашего выезда
          { endTime: { gt: start } }, // существующая бронь закончится после нашего въезда
        ],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Капсула уже забронирована на выбранное время",
      });
    }

    // 4. Считаем длительность в часах и общую стоимость
    const durationInHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice = durationInHours * Number(pod.pricePerHour);

    // 5. Сохраняем бронь с посчитанной ценой
    const newBooking = await prisma.booking.create({
      data: {
        podId,
        customerName,
        customerEmail,
        startTime: start,
        endTime: end,
        totalPrice,
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось создать бронирование" });
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
    res.status(500).json({ message: "Ошибка при получении бронирований" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
    });

    if (!booking) {
      return res.status(404).json({ message: "Бронь не знайдена" });
    }

    await prisma.booking.delete({
      where: { id: id as string },
    });
    res.json({ message: "Бронь успішно видалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка при видаленні броні" });
  }
};
