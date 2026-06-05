import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";
import ActivityLog from "@/models/ActivityLog";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { updateInvoiceStatusValidator } from "@/lib/validators/invoice.validator";
import mongoose from "mongoose";
import getFreelancerId from "@/lib/getFreelancerId";



export const GET = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid invoice ID");
  }

  const invoice = await Invoice.findOne({ _id: id, freelancerId })
    .populate("projectId", "title")
    .populate("clientId", "name email")
    .populate("milestoneIds", "title amount status");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Invoice fetched successfully", invoice)
  );
});


export const PATCH = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid invoice ID");
  }

  const body = await req.json();
  const result = updateInvoiceStatusValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const updateData: Record<string, unknown> = { status: result.data.status };

  // Yha pr Paid mark kr rha hu 
  if (result.data.status === "paid") {
    updateData.paidAt = new Date();
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, freelancerId },
    { $set: updateData },
    { new: true }
  )
    .populate("projectId", "title")
    .populate("clientId", "name email");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  
  if (result.data.status === "paid") {
    await ActivityLog.create({
      projectId: invoice.projectId,
      action: "invoice_paid",
      description: `Invoice ${invoice.invoiceNumber} marked as paid`,
      performedBy: new mongoose.Types.ObjectId(freelancerId),
      performedByRole: "freelancer",
    });
  }

  return NextResponse.json(
    new ApiResponse(200, "Invoice updated successfully", invoice)
  );
});


export const DELETE = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid invoice ID");
  }

  // Sirf draft invoice delete ho sakti hai
  const invoice = await Invoice.findOne({ _id: id, freelancerId });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.status !== "draft") {
    throw new ApiError(400, "Only draft invoices can be deleted");
  }

  await Invoice.findByIdAndDelete(id);

  return NextResponse.json(
    new ApiResponse(200, "Invoice deleted successfully", null)
  );
});