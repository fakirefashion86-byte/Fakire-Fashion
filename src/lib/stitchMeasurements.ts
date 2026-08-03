import { z } from "zod";

export const measurementsSchema = z.object({
  length: z.number().optional(),
  shoulder: z.number().optional(),
  sleeves: z.number().optional(),
  upperChest: z.number().optional(),
  belly: z.number().optional(),
  hip: z.number().optional(),
  collar: z.number().optional(),
  cuff: z.number().optional(),
  front: z.number().optional(),
  waist: z.number().optional(),
  thigh: z.number().optional(),
  knee: z.number().optional(),
  bottom: z.number().optional(),
  crossPocket: z.boolean().optional(),
  platePant: z.boolean().optional(),
  frontBack: z.boolean().optional(),
  sleevesBottom: z.number().optional(),
  frontNeck: z.number().optional(),
  backNeck: z.number().optional(),
});

export const NUMBER_MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeves", label: "Sleeves" },
  { key: "upperChest", label: "Upper Chest" },
  { key: "belly", label: "Belly" },
  { key: "hip", label: "Hip" },
  { key: "collar", label: "Collar" },
  { key: "cuff", label: "Cuff" },
  { key: "front", label: "Front" },
  { key: "waist", label: "Waist" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "bottom", label: "Bottom" },
  { key: "sleevesBottom", label: "Sleeves Bottom" },
  { key: "frontNeck", label: "Front Neck" },
  { key: "backNeck", label: "Back Neck" },
];

export const BOOLEAN_MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "crossPocket", label: "Cross Pocket" },
  { key: "platePant", label: "Plate Pant" },
  { key: "frontBack", label: "Front Back" },
];
