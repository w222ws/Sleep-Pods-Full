import { Router } from "express";
import {
  createBooking,
  getBookings,
  deleteBooking,
} from "../controllers/booking.controller.js";

const router = Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.delete("/:id", deleteBooking);

export default router;
