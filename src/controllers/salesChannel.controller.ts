import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createSalesChannelSchema,
  updateSalesChannelSchema,
} from "../validations/salesChannel.validation";
import {
  getAllSalesChannels,
  getSalesChannelById,
  createSalesChannel,
  updateSalesChannel,
  deleteSalesChannel,
} from "../services/salesChannel.service";

// @route   GET /api/sales-channels
// @desc    Retrieve all sales channels with dynamic product counts, pagination, and KPI summary
// @access  Public
export const getSalesChannels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, type, search } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllSalesChannels(
      {
        status: status ? String(status) : undefined,
        type: type ? String(type) : undefined,
        search: search ? String(search) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Sales channels fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.channels,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/sales-channels/:id
// @desc    Retrieve a single sales channel by ID
// @access  Public
export const getSalesChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID",
      });
    }

    const channel = await getSalesChannelById(id);

    res.status(200).json({
      success: true,
      message: "Sales channel fetched successfully",
      data: channel,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/sales-channels
// @desc    Create a new sales channel marketplace or store
// @access  Private (Requires Bearer Token - Admin Only)
export const addSalesChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createSalesChannelSchema.parse(req.body);
    const channel = await createSalesChannel(validatedData);

    res.status(201).json({
      success: true,
      message: "Sales channel created successfully",
      data: channel,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/sales-channels/:id
// @desc    Update an existing sales channel
// @access  Private (Requires Bearer Token - Admin Only)
export const editSalesChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID",
      });
    }

    const validatedData = updateSalesChannelSchema.parse(req.body);
    const channel = await updateSalesChannel(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Sales channel updated successfully",
      data: channel,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/sales-channels/:id
// @desc    Delete a sales channel
// @access  Private (Requires Bearer Token - Admin Only)
export const removeSalesChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID",
      });
    }

    const result = await deleteSalesChannel(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    next(error);
  }
};

