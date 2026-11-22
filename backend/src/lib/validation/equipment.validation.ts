import { z } from "zod";

const equipmentFields = {
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  imageData: z.string().max(1_400_050).regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/, "Upload a PNG, JPG, or WebP image under 1 MB."),
  totalQuantity: z.number().int().min(1).max(10000),
};

export const createEquipmentSchema = z.object(equipmentFields);
export const updateEquipmentSchema = z.object({
  name: equipmentFields.name.optional(),
  description: equipmentFields.description,
  imageData: equipmentFields.imageData.optional(),
  totalQuantity: equipmentFields.totalQuantity.optional(),
}).refine((values) => Object.keys(values).length > 0, "Provide at least one equipment field to update.");
