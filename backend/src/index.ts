import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import podRoutes from "./routes/pod.routes.js";
import bookingRoutes from "./routes/booking,routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/pods", podRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/health", async (req: Request, res: Response) => {
  try {
    // Пробный запрос к базе (считаем количество капсул)
    const podsCount = await prisma.pod.count();
    res.json({ status: "ok", database: "connected", podsCount });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
