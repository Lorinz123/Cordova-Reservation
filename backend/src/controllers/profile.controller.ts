import type { RequestHandler } from "express";
import { z } from "zod";
import { getCurrentUser, updateCurrentUserProfile } from "../services/auth.service.js";
import { findBarangayById } from "../repositories/barangay.repository.js";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  addressLine: optionalText(200),
  subdivision: optionalText(120),
  postalCode: z.string().trim().max(4).refine((value) => value === "" || /^\d{4}$/.test(value), "Enter a 4-digit postal code.").transform((value) => value || null),
  phoneNumber: z.string().trim().max(24).refine((value) => value === "" || /^\+?[\d\s()-]{7,24}$/.test(value), "Enter a valid phone number.").transform((value) => value || null),
  barangayId: z.uuid().optional(),
});

export const updateProfileController: RequestHandler = async (req, res, next) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check your name and profile details, then try again.", issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) });
    return;
  }
  try {
    const auth = res.locals.auth as { userId: string };
    const current = await getCurrentUser(auth.userId);
    if (!current) {
      res.status(404).json({ error: "Account not found." });
      return;
    }
    let barangayId: string | undefined;
    if (current.role === "resident" && !current.barangayId) {
      if (!parsed.data.barangayId) {
        res.status(400).json({ error: "Choose your barangay to complete your profile." });
        return;
      }
      if (!(await findBarangayById(parsed.data.barangayId))) {
        res.status(400).json({ error: "Choose a valid barangay." });
        return;
      }
      barangayId = parsed.data.barangayId;
    }
    const user = await updateCurrentUserProfile(auth.userId, { ...parsed.data, ...(barangayId ? { barangayId } : {}) });
    if (!user) {
      res.status(404).json({ error: "Account not found." });
      return;
    }
    res.status(200).json({ data: user, message: "Profile updated." });
  } catch (error) {
    next(error);
  }
};
