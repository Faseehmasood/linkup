import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import mongoose from "mongoose";
import crypto from "crypto";
import { Resend } from "resend";
import getFreelancerId from "@/lib/getFreelancerId";

const resend = new Resend(process.env.RESEND_API_KEY);



export const POST = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid client ID");
  }

  
  const client = await Client.findOne({ _id: id, freelancerId });
  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  
  const rawToken = crypto.randomBytes(32).toString("hex");
  
  // Token hash karke save karo plain nahi
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  client.magicLinkToken = hashedToken;
  client.tokenExpiry = expiry;
  await client.save();

  
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/verify?token=${rawToken}`;

  
  await resend.emails.send({
    from: "LinkUp <onboarding@resend.dev>",
    to: client.email,
    subject: "Your Project Portal Access — LinkUp",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${client.name},</h2>
        <p>You have been invited to view your project portal.</p>
        <p>Click the button below to access your portal:</p>
        <a 
          href="${magicLink}" 
          style="
            background-color: #000;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 16px 0;
          "
        >
          Access Portal
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you did not expect this email, please ignore it.
        </p>
      </div>
    `,
  });

  return NextResponse.json(
    new ApiResponse(200, "Invite sent successfully", null)
  );
});