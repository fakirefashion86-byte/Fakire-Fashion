import { z } from "zod";

// Shared shape for a delivery address — used by the saved-addresses API,
// the checkout form, and (as a superset) the order snapshot fields.
// Kept in one place so checkout validation and the addresses API can't drift.
export const PINCODE_RE = /^\d{6}$/;

export const addressInputSchema = z.object({
  label: z.string().trim().min(1).max(30).default("Home"),
  addressLine: z.string().trim().min(1, "Address is required").max(300),
  houseNumber: z.string().trim().max(100).optional().default(""),
  area: z.string().trim().max(150).optional().default(""),
  landmark: z.string().trim().max(150).optional().default(""),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z
    .string()
    .trim()
    .regex(PINCODE_RE, "Enter a valid 6-digit pincode"),
  country: z.string().trim().min(1).max(60).default("India"),
  // Null when saved from the manual-entry fallback (no Maps key configured,
  // or the picker failed to load) — see the checkout location feature docs.
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
