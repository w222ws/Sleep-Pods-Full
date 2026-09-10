import { Router } from "express";
import {
  createBooking,
  getBookings,
} from "../controllers/booking.controller.js";

const router = Router();

router.post("/", createBooking);
router.get("/", getBookings);

export default router;
