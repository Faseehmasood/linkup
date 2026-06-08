import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/models/File";
import Project from "@/models/Project";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import getUserFromToken from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const user = await getUserFromToken(req);

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }


  let project;
  if (user.role === "freelancer") {
    project = await Project.findOne({ _id: projectId, freelancerId: user.id });
  } else {
    project = await Project.findOne({ _id: projectId, clientId: user.id });
  }

  if (!project) {
    throw new ApiError(403, "Project not found or unauthorized");
  }

  const files = await File.find({ projectId })
    .sort({ createdAt: -1 });

  return NextResponse.json(
    new ApiResponse(200, "Files fetched successfully", files)
  );
});