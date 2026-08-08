import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

type Params = {params: Promise<{id: string}>};

const updateSchema = z.object({
  studentName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  institution: z.string().min(1).optional(),
  programme: z.string().min(1).optional(),
  intake: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  visaNotes: z.string().optional(),
  visaStatus: z.string().optional(),
});

async function owned(id: string, userId: string) {
  return prisma.application.findFirst({
    where: {id, userId},
    include: {tasks: {orderBy: {createdAt: "asc"}}, documents: {orderBy: {createdAt: "desc"}}},
  });
}

export async function GET(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const item = await owned(id, user.id);
    if (!item) return jsonError("Not found", 404);
    return Response.json({item});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load application", 500);
  }
}

export async function PATCH(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await owned(id, user.id);
    if (!existing) return jsonError("Not found", 404);

    const body = updateSchema.parse(await request.json());
    const item = await prisma.application.update({
      where: {id},
      data: body,
      include: {tasks: true, documents: true},
    });

    if (body.status && body.status !== existing.status) {
      await notify(user.id, "Application status updated", `${item.studentName}: ${item.status}`, `/applications/${item.id}`);
    }

    return Response.json({item});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update application", 500);
  }
}

export async function DELETE(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await owned(id, user.id);
    if (!existing) return jsonError("Not found", 404);
    await prisma.application.delete({where: {id}});
    return Response.json({ok: true});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to delete application", 500);
  }
}
