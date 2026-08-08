import {z} from "zod";

import {
  createSession,
  getSessionUser,
  hashPassword,
  jsonError,
  requireUser,
  verifyPassword,
} from "@/server/auth";
import {prisma} from "@/server/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({user: null}, {status: 401});

  const full = await prisma.user.findUnique({
    where: {id: user.id},
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
          contracts: true,
          commissions: true,
          partnerSelections: true,
        },
      },
    },
  });

  return Response.json({user: full});
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireUser();
    const body = updateSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({where: {id: session.id}});
    if (!existing) return jsonError("Not found", 404);

    const data: {name?: string; passwordHash?: string} = {};

    if (body.name?.trim()) {
      data.name = body.name.trim();
    }

    if (body.newPassword) {
      if (!body.currentPassword) {
        return jsonError("Current password is required");
      }
      const ok = await verifyPassword(body.currentPassword, existing.passwordHash);
      if (!ok) return jsonError("Current password is incorrect", 403);
      data.passwordHash = await hashPassword(body.newPassword);
    }

    if (!Object.keys(data).length) {
      return jsonError("Nothing to update");
    }

    const user = await prisma.user.update({
      where: {id: session.id},
      data,
      select: {id: true, email: true, name: true},
    });

    await createSession(user);

    return Response.json({user});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update profile", 500);
  }
}
