import { z } from "zod";
import { USER_ROLES } from "../constants/roles.js";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Valid email is required").transform((value) => value.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(USER_ROLES)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Valid email is required").transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Password is required")
  })
});
