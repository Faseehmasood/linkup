import { NextRequest } from "next/server";
import ApiError from "./ApiError";
import { jwtVerify } from "jose";


const getFreelancerId = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new ApiError(401, "Unauthorized");
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.id as string;
};

export default getFreelancerId;