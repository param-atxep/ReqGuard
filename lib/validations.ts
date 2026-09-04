import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(3).max(50),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, 'lowercase, numbers, underscores or dashes only'),
  email: z.string().email(),
  password: z.string().min(8).regex(/(?=.*[a-z])/, 'must contain a lowercase letter').regex(/(?=.*[A-Z])/, 'must contain an uppercase letter').regex(/(?=.*\d)/, 'must contain a number').regex(/(?=.*[^A-Za-z0-9])/, 'must contain a special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v === true, { message: 'You must accept terms' }),
}).refine(data => data.password === data.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export const forgotSchema = z.object({ email: z.string().email() });

export const resetSchema = z.object({ password: z.string().min(8).regex(/(?=.*[a-z])/, 'must contain a lowercase letter').regex(/(?=.*[A-Z])/, 'must contain an uppercase letter').regex(/(?=.*\d)/, 'must contain a number').regex(/(?=.*[^A-Za-z0-9])/, 'must contain a special character'), confirmPassword: z.string() }).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
