import { NextRequest, NextResponse } from "next/server";
import ApiError from "./ApiError";

type Handler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

const asyncHandler = (fn: Handler): Handler => {
  return async (req: NextRequest, context?: unknown) => {
    try {
      return await fn(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            errors: error.errors,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
};

export default asyncHandler;