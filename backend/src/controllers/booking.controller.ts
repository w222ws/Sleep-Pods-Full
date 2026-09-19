import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { podId, customerName, customerEmail, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      res.status(400);
      throw new Error(
        "Час закінчення бронювання має бути пізніше часу початку",
      );
    }

    const pod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!pod || !pod.isActive) {
      res.status(404);
      throw new Error("Капсула не знайдена або недоступна для бронювання");
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        podId,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (existingBooking) {
      res.status(409);
      throw new Error("Капсула вже заброньована на обраний час");
    }

    const durationInHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice = durationInHours * Number(pod.pricePerHour);

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
  },
);

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await prisma.booking.findMany({
    include: {
      pod: true,
    },
  });
  res.json(bookings);
});

export const deleteBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
    });

    if (!booking) {
      res.status(404);
      throw new Error("Бронь не знайдена");
    }

    await prisma.booking.delete({
      where: { id: id as string },
    });

    res.json({ message: "Бронь успішно видалена" });
  },
);
