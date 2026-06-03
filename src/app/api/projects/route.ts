import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import asyncHandler from "@/lib/asyncHandler";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import { createProjectValidator } from "@/lib/validators/project.validator";
import getFreelancerId from "@/lib/getFreelancerId";

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const projects = await Project.find({ freelancerId })
    .populate("clientId", "name email company")
    .sort({ createdAt: -1 });

  return NextResponse.json(
    new ApiResponse(200, "Projects fetched successfully", projects)
  );
});


export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const freelancerId = await getFreelancerId(req);

  const body = await req.json();

  const result = createProjectValidator.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Validation failed",
      result.error.issues.map((e) => e.message)
    );
  }

  const { title, description, status, deadline, totalAmount, currency, clientId } = result.data;

  const project = await Project.create({
    title,
    description,
    status,
    deadline: deadline ? new Date(deadline) : undefined,
    totalAmount,
    currency,
    clientId,
    freelancerId,
  });

  const populatedProject = await project.populate("clientId", "name email company");

  return NextResponse.json(
    new ApiResponse(201, "Project created successfully", populatedProject),
    { status: 201 }
  );
});