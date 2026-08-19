// NEXT_PUBLIC_ vars are inlined at build time, so this is safe to read
// directly in client components without a network round-trip.
export const MAPS_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
