import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(8).max(128),
})

export const campaignCreateSchema = z.object({
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

