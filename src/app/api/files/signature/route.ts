import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";
import getUserFromToken from "@/lib/getUserFromToken";


export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const user = await getUserFromToken(req);

  const body = await req.json();
  const { projectId } = body;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Valid project ID is required");
  }


  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (user.role === "freelancer" && 
      project.freelancerId.toString() !== user.id) {
    throw new ApiError(403, "Unauthorized");
  }

  if (user.role === "client" && 
      project.clientId.toString() !== user.id) {
    throw new ApiError(403, "Unauthorized");
  }


  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `linkup/${projectId}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json(
    new ApiResponse(200, "Signature generated", {
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  );
});