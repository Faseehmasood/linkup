import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Milestone from "@/models/Milestone";
import ActivityLog from "@/models/ActivityLog";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { updateMilestoneValidator, completeMilestoneValidator } from "@/lib/validators/milestone.validator";
import mongoose from "mongoose";
import getFreelancerId from "@/lib/getFreelancerId";



export const GET = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid milestone ID");
  }

  const milestone = await Milestone.findById(id).populate("projectId", "title freelancerId");
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  
  const project = milestone.projectId as unknown as { freelancerId: mongoose.Types.ObjectId };
  if (project.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "Unauthorized");
  }

  return NextResponse.json(
    new ApiResponse(200, "Milestone fetched successfully", milestone)
  );
});


export const PATCH = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid milestone ID");
  }

  const body = await req.json();

  // Isma dekh rha ka complete update krna ha ya normal update krna ha
  const isCompleting = body.status === "completed";

  const validator = isCompleting ? completeMilestoneValidator : updateMilestoneValidator;
  const result = validator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const milestone = await Milestone.findById(id).populate("projectId", "title freelancerId");
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  const project = milestone.projectId as unknown as { 
    _id: mongoose.Types.ObjectId;
    title: string;
    freelancerId: mongoose.Types.ObjectId;
  };

  if (project.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "Unauthorized");
  }

  // Isma Hum CompletedAt Set kr raha
  const updateData: Record<string, unknown> = { ...result.data };
  if (isCompleting) {
    updateData.completedAt = new Date();
  }

  const updatedMilestone = await Milestone.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // Activity log milestone complete hua
  if (isCompleting) {
    await ActivityLog.create({
      projectId: project._id,
      action: "milestone_completed",
      description: `Milestone "${updatedMilestone?.title}" marked as completed`,
      performedBy: new mongoose.Types.ObjectId(freelancerId),
      performedByRole: "freelancer",
    });
  }

  return NextResponse.json(
    new ApiResponse(200, "Milestone updated successfully", updatedMilestone)
  );
});


export const DELETE = asyncHandler(async (req: NextRequest, context: unknown) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid milestone ID");
  }

  const milestone = await Milestone.findById(id).populate("projectId", "freelancerId");
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  const project = milestone.projectId as unknown as { freelancerId: mongoose.Types.ObjectId };
  if (project.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "Unauthorized");
  }

  await Milestone.findByIdAndUpdate(
  id,
  { $set: { isActive: false } },
  { new: true }
);

  return NextResponse.json(
    new ApiResponse(200, "Milestone deleted successfully", null)
  );
});