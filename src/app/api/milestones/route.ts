import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Milestone from "@/models/Milestone";
import Project from "@/models/Project";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { createMilestoneValidator } from "@/lib/validators/milestone.validator";
import mongoose from "mongoose";
import getFreelancerId from "@/lib/getFreelancerId";




export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  // Project freelancer ka hai ya nahi
  const project = await Project.findOne({ _id: projectId, freelancerId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const milestones = await Milestone.find({ 
    projectId,
    isActive: true
   })
    .sort({ createdAt: 1 });

  return NextResponse.json(
    new ApiResponse(200, "Milestones fetched successfully", milestones)
  );
});


export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const body = await req.json();

  const result = createMilestoneValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const { title, description, amount, dueDate, projectId } = result.data;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }


  const project = await Project.findOne({ _id: projectId, freelancerId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const milestone = await Milestone.create({
    title,
    description,
    amount,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    projectId,
  });

  return NextResponse.json(
    new ApiResponse(201, "Milestone created successfully", milestone),
    { status: 201 }
  );
});