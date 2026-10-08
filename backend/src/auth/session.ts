import * as jose from "jose";
import { env } from "../env";
import { Session } from "../constants";

const secret = new TextEncoder().encode(env.appSecret);

export interface SessionClaim {
  unionId: string;
  clientId: string;
  iat?: number;
  exp?: number;
}

export async function signSessionToken(claim: Omit<SessionClaim, "iat" | "exp">): Promise<string> {
  return new jose.SignJWT({ ...claim })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Session.maxAgeMs / 1000}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionClaim | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as SessionClaim;
  } catch {
    return null;
  }
}
