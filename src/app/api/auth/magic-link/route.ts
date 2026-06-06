import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { SignJWT } from "jose";
import crypto from "crypto";

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  // Token Hashed kr rha hum taka database sa match kr ska
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  
  const client = await Client.findOne({
    magicLinkToken: hashedToken,
    tokenExpiry: { $gt: new Date() }, // abhi expire nahi hua
  });

  if (!client) {
    throw new ApiError(400, "Invalid or expired link");
  }

  // Yha pr token use hona ka bad hum usa expire kr rha ha
  client.magicLinkToken = undefined;
  client.tokenExpiry = undefined;
  await client.save();

  
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const clientToken = await new SignJWT({
    id: client._id.toString(),
    email: client.email,
    name: client.name,
    role: "client",
    freelancerId: client.freelancerId.toString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  // Cookie set kr rha hu is ka baad client login ho jae ga or home pr redirect ho jae ga 
  const response = NextResponse.json(
    new ApiResponse(200, "Login successful", {
      _id: client._id,
      name: client.name,
      email: client.email,
    })
  );

  response.cookies.set("client_token", clientToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
});