import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "../validations/invoice.validation";
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../services/invoice.service";

// @route   GET /api/invoices
// @desc    Retrieve all invoices with date filters, pagination, and KPI summary
// @access  Public
export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      paymentStatus,
      salesChannel,
      search,
      timeRange,
      startDate,
      endDate,
    } = req.query;

    const pagination = getPaginationParams(req.query);

    const result = await getAllInvoices(
      {
        status: status ? String(status) : undefined,
        paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
        salesChannel: salesChannel ? String(salesChannel) : undefined,
        search: search ? String(search) : undefined,
        timeRange: timeRange ? String(timeRange) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/invoices/:id
// @desc    Retrieve a single invoice by its ID
// @access  Public
export const getInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await getInvoiceById(id);

    res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/invoices
// @desc    Create a new sales invoice with automatic inventory deduction
// @access  Protected (Requires Bearer Token)
export const addInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = createInvoiceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const invoice = await createInvoice(validation.data);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/invoices/:id
// @desc    Update an existing invoice or its payment/fulfillment status
// @access  Protected (Requires Bearer Token)
export const editInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const validation = updateInvoiceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const invoice = await updateInvoice(id, validation.data);

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice by ID
// @access  Protected (Requires Bearer Token)
export const removeInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const result = await deleteInvoice(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

