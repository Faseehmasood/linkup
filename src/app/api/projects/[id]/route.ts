import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { updateProjectValidator } from "@/lib/validators/project.validator";
import mongoose from "mongoose";
import getFreelancerId from "@/lib/getFreelancerId";



export const GET = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({ _id: id, freelancerId })
    .populate("clientId", "name email company");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Project fetched successfully", project)
  );
});


export const PATCH = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const body = await req.json();
  const result = updateProjectValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  if (result.data.deadline) {
    result.data.deadline = new Date(result.data.deadline) as unknown as string;
  }

  const project = await Project.findOneAndUpdate(
    { _id: id, freelancerId },
    { $set: result.data },
    { new: true, runValidators: true }
  ).populate("clientId", "name email company");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Project updated successfully", project)
  );
});


export const DELETE = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOneAndDelete({ _id: id, freelancerId });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return NextResponse.json(
    new ApiResponse(200, "Project deleted successfully", null)
  );
});