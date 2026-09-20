import { z } from "zod";

export const createBookingSchema = z
  .object({
    podId: z.string().trim().uuid({
      message: "Неправильний формат ID капсули (має бути валідний UUID)",
    }),

    customerName: z
      .string()
      .trim()
      .min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),

    customerEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Неправильний формат електронної пошти" }),

    startTime: z
      .string()
      .trim()
      .datetime({ message: "Час початку має бути у форматі ISO" })
      .refine((val) => new Date(val) > new Date(), {
        message: "Час початку не може бути в минулому",
      }),

    endTime: z
      .string()
      .trim()
      .datetime({ message: "Час завершення має бути у форматі ISO" }),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "Час завершення має бути пізнішим за час початку",
    path: ["endTime"], // Помилка прикріпиться саме до поля endTime
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
