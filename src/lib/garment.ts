/** A stitch order's garment name, whether it came from a listed category or free text. */
export function garmentLabel(order: {
  stitchCategory?: { name: string } | null;
  customGarmentName?: string | null;
}): string {
  return order.stitchCategory?.name ?? order.customGarmentName ?? "Custom garment";
}

/** Zero-padded, human-facing order number, e.g. "SO-000123". */
export function formatSerialNumber(serialNumber: number): string {
  return `SO-${String(serialNumber).padStart(6, "0")}`;
}
