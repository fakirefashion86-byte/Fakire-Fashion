import { z } from "zod";

// Tailors sometimes note a size/fit word instead of a plain number (e.g. "loose", "S", "34.5F"),
// so measurement values accept free text as well as numbers.
const measurementValue = z.union([z.number(), z.string()]).optional();

export const measurementsSchema = z.object({
  // Shirt / Kurta measurements
  length: measurementValue,
  shoulder: measurementValue,
  sleeves: measurementValue,
  upperChest: measurementValue,
  chest: measurementValue,
  belly: measurementValue,
  collar: measurementValue,
  cuff: measurementValue,
  front: measurementValue,
  sleevesBottom: measurementValue,
  frontNeck: measurementValue,
  backNeck: measurementValue,
  armhole: measurementValue,

  // Pant / Trouser measurements
  pantLength: measurementValue,
  waist: measurementValue,
  hip: measurementValue,
  thigh: measurementValue,
  knee: measurementValue,
  bottom: measurementValue,
  frontRise: measurementValue,
  backRise: measurementValue,
  inseam: measurementValue,

  // Pant style options
  crossPocket: z.boolean().optional(),
  platePant: z.boolean().optional(),
  frontBack: z.boolean().optional(),
});

export const SHIRT_MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeves", label: "Sleeves" },
  { key: "upperChest", label: "Upper Chest" },
  { key: "chest", label: "Chest" },
  { key: "belly", label: "Belly" },
  { key: "collar", label: "Collar" },
  { key: "cuff", label: "Cuff" },
  { key: "front", label: "Front" },
  { key: "sleevesBottom", label: "Sleeves Bottom" },
  { key: "frontNeck", label: "Front Neck" },
  { key: "backNeck", label: "Back Neck" },
  { key: "armhole", label: "Armhole" },
];

export const PANT_MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "pantLength", label: "Length" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "bottom", label: "Bottom" },
  { key: "frontRise", label: "Front Rise" },
  { key: "backRise", label: "Back Rise" },
  { key: "inseam", label: "Inseam" },
];

export const PANT_BOOLEAN_FIELDS: { key: string; label: string }[] = [
  { key: "crossPocket", label: "Cross Pocket" },
  { key: "platePant", label: "Plate Pant" },
  { key: "frontBack", label: "Front Back" },
];

// Kept for backward compatibility with any existing imports.
export const NUMBER_MEASUREMENT_FIELDS = [...SHIRT_MEASUREMENT_FIELDS, ...PANT_MEASUREMENT_FIELDS];
export const BOOLEAN_MEASUREMENT_FIELDS = PANT_BOOLEAN_FIELDS;
