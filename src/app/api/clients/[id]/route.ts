import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { updateClientValidator } from "@/lib/validators/client.validator";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

const getFreelancerId = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new ApiError(401, "Unauthorized");
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.id as string;
};

// GET — single client
export const GET = asyncHandler(async (req: NextRequest, context: unknown) => {
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

  return NextResponse.json(
    new ApiResponse(200, "Client fetched successfully", client)
  );
});

// PATCH — client update karo
export const PATCH = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid client ID");
  }

  const body = await req.json();
  const result = updateClientValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const client = await Client.findOneAndUpdate(
    { _id: id, freelancerId },
    { $set: result.data },
    { new: true, runValidators: true }
  );

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Client updated successfully", client)
  );
});

// DELETE — soft delete
export const DELETE = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid client ID");
  }

  const client = await Client.findOneAndUpdate(
    { _id: id, freelancerId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Client deleted successfully", null)
  );
});