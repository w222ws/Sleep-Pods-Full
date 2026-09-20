import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Неправильний формат електронної пошти" }),

  password: z
    .string()
    // password НЕ трімимо (.trim()), щоб зберегти можливість використовувати пробіли у паролі
    .min(6, { message: "Пароль повинен містити щонайменше 6 символів" }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Неправильний формат електронної пошти" }),

  password: z
    .string()
    .min(1, { message: "Пароль є обов'язковим для заповнення" }),
});
