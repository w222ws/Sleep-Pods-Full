import { type Request, type Response, type NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Помилка:", err.message || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Внутрішня поломка серверу",
    stack: process.env.NODE_ENV?.trim() === "production" ? null : err.stack,
  });
};
