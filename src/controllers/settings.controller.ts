import { Request, Response, NextFunction } from "express";
import { updateSettingsSchema } from "../validations/settings.validation";
import {
  getSystemSettings,
  updateSystemSettings,
} from "../services/settings.service";
import {
  uploadBufferToCloudinary,
  extractPublicIdFromUrl,
  deleteFromCloudinary,
} from "../services/upload.service";

// @route   GET /api/settings
// @desc    Retrieve active company letterhead, tax rates, and business policies
// @access  Public
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await getSystemSettings();

    res.status(200).json({
      success: true,
      message: "Business settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/settings
// @desc    Update business settings and/or replace company logo directly (Auto-deletes old logo)
// @access  Private (Requires Bearer Token)
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawBody: Record<string, any> = { ...req.body };

    // 1. If a new logo file is attached, handle replacement & cleanup
    if (req.file) {
      // Fetch existing settings to check if an old logo exists in Cloudinary
      const currentSettings = await getSystemSettings();
      if (currentSettings?.logoUrl) { 
        const oldPublicId = extractPublicIdFromUrl(currentSettings.logoUrl);
        if (oldPublicId) {
          // Clean up previous image from Cloudinary sundara folder
          await deleteFromCloudinary(oldPublicId);
        }
      }

      // Upload new logo buffer to Cloudinary (sundara folder)
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      rawBody.logoUrl = uploadResult.secureUrl;
    }

    // 2. Parse numbers and JSON arrays if sent via multipart/form-data
    if (typeof rawBody.defaultTaxRate === "string") {
      rawBody.defaultTaxRate = Number(rawBody.defaultTaxRate);
    }

    if (typeof rawBody.taxSlabs === "string") {
      try {
        rawBody.taxSlabs = JSON.parse(rawBody.taxSlabs);
      } catch {
        // Leave as string if not valid JSON
      }
    }

    if (typeof rawBody.paymentTerms === "string") {
      try {
        rawBody.paymentTerms = JSON.parse(rawBody.paymentTerms);
      } catch {
        // Leave as string if not valid JSON
      }
    }

    // 3. Validate processed payload with Zod schema
    const validatedData = updateSettingsSchema.parse(rawBody);

    // 4. Update settings in database
    const updatedSettings = await updateSystemSettings(validatedData);

    res.status(200).json({
      success: true,
      message: "Business settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};
