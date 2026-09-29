import { z } from "zod";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number");

const phoneSchema = z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+()\s-]+$/, "Enter a valid phone number");

export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Enter your password"),
    rememberMe: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const customerRegisterSchema = z
    .object({
        firstName: z.string().min(2, "Enter your first name"),
        lastName: z.string().min(2, "Enter your last name"),
        email: z.string().email("Enter a valid email address"),
        phone: phoneSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
        agreedToTerms: z.literal(true, {
            errorMap: () => ({ message: "You must accept the terms to continue" }),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type CustomerRegisterFormValues = z.infer<typeof customerRegisterSchema>;

export const artisanRegisterSchema = z
    .object({
        firstName: z.string().min(2, "Enter your first name"),
        lastName: z.string().min(2, "Enter your last name"),
        email: z.string().email("Enter a valid email address"),
        phone: phoneSchema,
        trade: z.string().min(1, "Select your trade"),
        yearsExperience: z
            .number({ invalid_type_error: "Enter years of experience" })
            .min(0, "Must be 0 or more")
            .max(60, "Enter a realistic number of years"),
        password: passwordSchema,
        confirmPassword: z.string(),
        agreedToTerms: z.literal(true, {
            errorMap: () => ({ message: "You must accept the terms to continue" }),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type ArtisanRegisterFormValues = z.infer<typeof artisanRegisterSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;