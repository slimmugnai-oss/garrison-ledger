/**
 * VALIDATION SCHEMAS
 * 
 * Centralized Zod schemas for input validation
 * Eliminates duplicate validation logic across API routes and forms
 * 
 * Usage in API routes:
 * ```typescript
 * import { profileSchema } from '@/lib/validation/schemas';
 * 
 * const result = profileSchema.safeParse(body);
 * if (!result.success) {
 *   throw Errors.validationError('Invalid input', result.error.flatten());
 * }
 * ```
 * 
 * Usage in forms:
 * ```typescript
 * const { errors } = profileSchema.safeParse(formData);
 * ```
 */

import { z } from 'zod';

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Military rank validation
 */
const militaryRanks = [
  // Enlisted
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  // Warrant Officers
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  // Officers
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'
] as const;

export const rankSchema = z.enum(militaryRanks);

/**
 * Military branch validation
 */
const militaryBranches = [
  'Army',
  'Navy',
  'Air Force',
  'Marine Corps',
  'Coast Guard',
  'Space Force',
  'N/A' // For contractors/civilians
] as const;

export const branchSchema = z.enum(militaryBranches);

/**
 * Service status validation
 */
export const serviceStatusSchema = z.enum([
  'active_duty',
  'reserve',
  'guard',
  'veteran',
  'contractor',
  'civilian'
]);

/**
 * User profile schema
 */
export const profileSchema = z.object({
  rank: rankSchema,
  branch: branchSchema.optional(),
  current_base: z.string().min(1, 'Current base is required'),
  has_dependents: z.boolean(),
  service_status: serviceStatusSchema.optional(),
  time_in_service: z.number().int().min(0).max(50).optional()
});

/**
 * Quick start profile schema (minimal fields)
 */
export const quickStartProfileSchema = z.object({
  rank: rankSchema,
  branch: branchSchema.optional(),
  current_base: z.string().min(1, 'Current base is required'),
  has_dependents: z.boolean(),
  service_status: serviceStatusSchema.optional()
});

/**
 * LES upload schema
 */
export const lesUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    'Only PDF files are supported'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File must be less than 5MB'
  )
});

/**
 * LES audit schema
 */
export const lesAuditSchema = z.object({
  uploadId: z.string().uuid('Invalid upload ID')
});

/**
 * Base Navigator filters schema
 */
export const navigatorFiltersSchema = z.object({
  baseCode: z.string().min(2, 'Invalid base code'),
  bedrooms: z.number().int().min(1).max(10),
  bahMonthlyCents: z.number().int().min(0),
  kidsGrades: z.array(z.enum(['elem', 'middle', 'high'])).optional()
});

/**
 * PCS scenario schema
 */
export const pcsScenarioSchema = z.object({
  current_base: z.string(),
  new_base: z.string(),
  move_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  dependents: z.number().int().min(0),
  household_goods_weight: z.number().int().min(0).max(20000),
  personally_owned_vehicle_count: z.number().int().min(0).max(5),
  temporary_storage_needed: z.boolean()
});

/**
 * TDY trip schema
 */
export const tdyTripSchema = z.object({
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  destination_city: z.string().min(1),
  destination_state: z.string().length(2),
  purpose: z.string().min(1),
  lodging_type: z.enum(['government', 'commercial', 'non_availability'])
});

/**
 * Stripe checkout schema
 */
export const checkoutSchema = z.object({
  priceId: z.string().startsWith('price_', 'Invalid Stripe price ID'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

/**
 * Content rating schema
 */
export const contentRatingSchema = z.object({
  contentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5)
});

/**
 * Referral code schema
 */
export const referralCodeSchema = z.object({
  code: z.string().length(8, 'Referral code must be 8 characters')
});

/**
 * Helper: Validate with Zod and return friendly errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Convert Zod errors to friendly format
  const errors: Record<string, string[]> = {};
  
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return { success: false, errors };
}

/**
 * Type exports for use in components
 */
export type Profile = z.infer<typeof profileSchema>;
export type QuickStartProfile = z.infer<typeof quickStartProfileSchema>;
export type NavigatorFilters = z.infer<typeof navigatorFiltersSchema>;
export type PCSScenario = z.infer<typeof pcsScenarioSchema>;
export type TDYTrip = z.infer<typeof tdyTripSchema>;
export type ContentRating = z.infer<typeof contentRatingSchema>;

