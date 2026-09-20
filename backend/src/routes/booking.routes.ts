import { Router } from "express";
import {
  getBookings,
  createBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";

// Импортируем наш щит (Middleware) и схему Zod
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema } from "../schemas/booking.schema.js";

const router = Router();

// Обычное получение всех броней
router.get("/", getBookings);

// 🛡️ Создание брони защищено Zod-валидацией
router.post("/", validate(createBookingSchema), createBooking);

// Удаление брони по ID
router.delete("/:id", deleteBooking);

export default router;
