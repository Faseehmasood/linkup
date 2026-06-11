import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import mongoose from "mongoose";
import { Resend } from "resend";
import { render } from "@react-email/components";
import InvoiceEmail from "@/../emails/InvoiceEmail";
import getFreelancerId from "@/lib/getFreelancerId";

const resend = new Resend(process.env.RESEND_API_KEY);



export const POST = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid invoice ID");
  }

  const invoice = await Invoice.findOne({ _id: id, freelancerId })
    .populate("projectId", "title")
    .populate("clientId", "name email");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (invoice.status === "paid") {
    throw new ApiError(400, "Cannot resend a paid invoice");
  }

  const freelancer = await User.findById(freelancerId).select("name");
  if (!freelancer) {
    throw new ApiError(404, "Freelancer not found");
  }

  const client = invoice.clientId as unknown as { name: string; email: string };
  const project = invoice.projectId as unknown as { title: string };

  // Email HTML render kar rha ha yha
  const emailHtml = await render(
    InvoiceEmail({
      clientName: client.name,
      freelancerName: freelancer.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate?.toString(),
      projectTitle: project.title,
      wiseEmail: invoice.wiseEmail,
      payoneerEmail: invoice.payoneerEmail,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal`,
    })
  );

  await resend.emails.send({
    from: "LinkUp <onboarding@resend.dev>",
    to: client.email,
    subject: `Invoice ${invoice.invoiceNumber} — ${invoice.amount} ${invoice.currency}`,
    html: emailHtml,
  });

  await Invoice.findByIdAndUpdate(id, { status: "sent" });

  await ActivityLog.create({
    projectId: invoice.projectId,
    action: "invoice_sent",
    description: `Invoice ${invoice.invoiceNumber} sent to ${client.name}`,
    performedBy: new mongoose.Types.ObjectId(freelancerId),
    performedByRole: "freelancer",
  });

  return NextResponse.json(
    new ApiResponse(200, "Invoice sent successfully", null)
  );
});