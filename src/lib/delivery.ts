const STITCH_ORDER_LEAD_DAYS = 7;

/** Estimated delivery date for a stitch order: 7 days from the day it was placed. */
export function estimatedDeliveryDate(orderedAt: Date): Date {
  const date = new Date(orderedAt);
  date.setDate(date.getDate() + STITCH_ORDER_LEAD_DAYS);
  return date;
}
