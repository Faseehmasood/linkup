import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { createClientValidator } from "@/lib/validators/client.validator";
import getFreelancerId from "@/lib/getFreelancerId";



export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const clients = await Client.find({ 
    freelancerId,
    isActive: true 
  }).sort({ createdAt: -1 });

  return NextResponse.json(
    new ApiResponse(200, "Clients fetched successfully", clients)
  );
});


export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const body = await req.json();

  const result = createClientValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const { name, email, company, phone } = result.data;

  
  const existingClient = await Client.findOne({ email, freelancerId });
  if (existingClient) {
    throw new ApiError(409, "Client with this email already exists");
  }

  const client = await Client.create({
    name,
    email,
    company,
    phone,
    freelancerId,
  });

  return NextResponse.json(
    new ApiResponse(201, "Client created successfully", client),
    { status: 201 }
  );
});