import { NextRequest } from "next/server";
import ApiError from "@/lib/ApiError";
import { jwtVerify } from "jose";

const getUserFromToken = async (
  req: NextRequest
): Promise<{ id: string; role: "freelancer" | "client" }> => {
  const freelancerToken = req.cookies.get("token")?.value;
  if (freelancerToken) {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(freelancerToken, secret);
    return { id: payload.id as string, role: "freelancer" };
  }

  const clientToken = req.cookies.get("client_token")?.value;
  if (clientToken) {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(clientToken, secret);
    return { id: payload.id as string, role: "client" };
  }

  throw new ApiError(401, "Unauthorized");
};

export default getUserFromToken;