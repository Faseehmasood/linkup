import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/models/File";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import getUserFromToken from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const user = await getUserFromToken(req);

  const body = await req.json();
  const { url, publicId, name, size, type, projectId } = body;

  if (!url || !publicId || !name || !size || !type || !projectId) {
    throw new ApiError(400, "All fields are required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const maxSize = 10 * 1024 * 1024;
  if (size > maxSize) {
    throw new ApiError(400, "File size cannot exceed 10MB");
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
  ];
  if (!allowedTypes.includes(type)) {
    throw new ApiError(400, "File type not allowed");
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

  
  const file = await File.create({
    url,
    publicId,
    name,
    size,
    type,
    projectId,
    uploadedBy: new mongoose.Types.ObjectId(user.id),
    uploadedByRole: user.role,
  });

  
  await ActivityLog.create({
    projectId: new mongoose.Types.ObjectId(projectId),
    action: "file_uploaded",
    description: `${user.role === "freelancer" ? "Freelancer" : "Client"} uploaded file "${name}"`,
    performedBy: new mongoose.Types.ObjectId(user.id),
    performedByRole: user.role,
  });

  return NextResponse.json(
    new ApiResponse(201, "File saved successfully", file),
    { status: 201 }
  );
});