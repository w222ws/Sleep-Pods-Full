import { z } from "zod";
export const createBookingSchema = z.object({
  podId: z.string().uuid({ message: "No correct ID pods (should be UUID)" }),

  customerName: z
    .string()
    .min(2, { message: "The name must contain at least 2 characters" }),

  customerEmail: z.string().email({ message: "Invalid email format" }),

  startTime: z
    .string()
    .datetime({ message: "The start time must be in ISO format" }),

  endTime: z
    .string()
    .datetime({ message: "The end time must be in ISO format" }),
});
