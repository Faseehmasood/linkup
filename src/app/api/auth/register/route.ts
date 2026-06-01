import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { registerValidator } from "@/lib/validators/user.validator";

export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  
  const body = await req.json();

  // Zod Ko validate kiya
  const result = registerValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const { name, email, password } = result.data;

  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  
  const user = await User.create({
    name,
    email,
    password,
  });

  // Password ko response ma bhejta
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return NextResponse.json(
    new ApiResponse(201, "Account created successfully", userResponse),
    { status: 201 }
  );
});