import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(8).max(128),
})

export const campaignCreateSchema = z.object({
  campaignType: z.enum(['city_workshop', 'seasonal_promotion', 'discounted_workshop', 'partner_couple']).default('city_workshop'),
  seasonalLabel: z.string().max(120).optional().default(''),
  name: z.string().min(3).max(180),
  location: z.string().min(2).max(180),
  city: z.string().max(120).optional().default(''),
  workshopDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().positive().max(1000000),
  seatCapacity: z.number().int().min(1).max(10000),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
})

export const campaignStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'closed', 'cancelled']),
})

export const bookingCreateSchema = z.object({
  campaignSlug: z.string().min(1),
  participantName: z.string().min(2).max(140),
  email: z.string().email().max(190),
  mobile: z.string().min(8).max(32),
  companyName: z.string().max(180).optional().nullable(),
  teamSize: z.number().int().min(1).max(1000),
  selectedDesignName: z.string().max(140).optional().nullable(),
  paymentPercent: z.number().int().refine((v) => v === 50 || v === 100),
})

export const userLoginSchema = z.object({
  identifier: z.string().min(3).max(190),
  password: z.string().min(4).max(128).optional(),
  otp: z.string().length(6).optional(),
})

export const productCreateSchema = z.object({
  title: z.string().min(2).max(180),
  price: z.coerce.number().positive().max(1000000),
  description: z.string().max(5000).optional().default(''),
})
