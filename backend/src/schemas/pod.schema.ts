import { z } from "zod";

export const createPodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Назва капсули повинна містити щонайменше 3 символи" }),

  type: z.enum(["STANDARD", "VIP"], {
    message: "Тип капсули повинен бути або 'STANDARD', або 'VIP'",
  }),

  pricePerHour: z
    .number()
    .int({ message: "Ціна має бути цілим числом" })
    .positive({ message: "Ціна за годину повинна бути додатнім числом" }),
});
