import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import User from "@/models/User";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import crypto from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/components";
import MagicLinkEmail from "@/../emails/MagicLinkEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const getFreelancerId = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new ApiError(401, "Unauthorized");
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.id as string;
};

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

  const freelancer = await User.findById(freelancerId).select("name");
  if (!freelancer) {
    throw new ApiError(404, "Freelancer not found");
  }

  
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  client.magicLinkToken = hashedToken;
  client.tokenExpiry = expiry;
  await client.save();

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/verify?token=${rawToken}`;

  const emailHtml = await render(
    MagicLinkEmail({
      clientName: client.name,
      freelancerName: freelancer.name,
      magicLink,
    })
  );

  await resend.emails.send({
    from: "LinkUp <onboarding@resend.dev>",
    to: client.email,
    subject: "Your Project Portal Access — LinkUp",
    html: emailHtml,
  });

  return NextResponse.json(
    new ApiResponse(200, "Invite sent successfully", null)
  );
});