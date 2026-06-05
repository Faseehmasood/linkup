import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { createInvoiceValidator } from "@/lib/validators/invoice.validator";
import mongoose from "mongoose";
import getFreelancerId from "@/lib/getFreelancerId";
import Counter from "@/models/Counter";


const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { name: `invoice-${year}` },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `INV-${year}-${String(counter.value).padStart(3, "0")}`;
};


export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");

  const filter: Record<string, unknown> = { freelancerId };
  if (status) filter.status = status;
  if (projectId) filter.projectId = projectId;

  const invoices = await Invoice.find(filter)
    .populate("projectId", "title")
    .populate("clientId", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json(
    new ApiResponse(200, "Invoices fetched successfully", invoices)
  );
});


export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const body = await req.json();

  const result = createInvoiceValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const { projectId, milestoneIds, amount, currency, dueDate, wiseEmail, payoneerEmail } = result.data;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  
  const project = await Project.findOne({ _id: projectId, freelancerId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Invoice number generate kar rha ha yha hum
  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    projectId,
    milestoneIds: milestoneIds.map((id) => new mongoose.Types.ObjectId(id)),
    amount,
    currency,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    wiseEmail,
    payoneerEmail,
    freelancerId,
    clientId: project.clientId,
    status: "draft",
  });

  
  await ActivityLog.create({
    projectId: project._id,
    action: "invoice_created",
    description: `Invoice ${invoiceNumber} created for amount ${amount} ${currency}`,
    performedBy: new mongoose.Types.ObjectId(freelancerId),
    performedByRole: "freelancer",
  });

  const populatedInvoice = await invoice.populate([
    { path: "projectId", select: "title" },
    { path: "clientId", select: "name email" },
  ]);

  return NextResponse.json(
    new ApiResponse(201, "Invoice created successfully", populatedInvoice),
    { status: 201 }
  );
});