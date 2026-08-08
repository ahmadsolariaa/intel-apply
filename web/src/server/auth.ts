import {SignJWT, jwtVerify} from "jose";
import {cookies} from "next/headers";
import bcrypt from "bcryptjs";

import {prisma} from "./db";

const COOKIE = "ia_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const {payload} = await jwtVerify(token, secret());
    const id = String(payload.sub ?? "");
    if (!id) return null;

    const user = await prisma.user.findUnique({
      where: {id},
      select: {id: true, email: true, name: true},
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const error = new Error("Unauthorized");
    (error as Error & {status: number}).status = 401;
    throw error;
  }
  return user;
}

export function jsonError(message: string, status = 400) {
  return Response.json({error: message}, {status});
}
