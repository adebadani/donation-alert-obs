import { z } from "zod";

export const donationSchema = z.object({
  donatorName: z.string().trim().min(1).max(50),
  amount: z.number().positive(),
  currency: z.string().trim().min(1).max(10).optional(),
  message: z.string().trim().max(200).optional(),
});
