import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

type Params = {params: Promise<{id: string; taskId: string}>};

export async function PATCH(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id, taskId} = await params;
    const app = await prisma.application.findFirst({where: {id, userId: user.id}});
    if (!app) return jsonError("Not found", 404);

    const body = z.object({done: z.boolean(), title: z.string().optional()}).parse(await request.json());
    const task = await prisma.applicationTask.update({
      where: {id: taskId},
      data: body,
    });
    return Response.json({item: task});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update task", 500);
  }
}

export async function DELETE(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id, taskId} = await params;
    const app = await prisma.application.findFirst({where: {id, userId: user.id}});
    if (!app) return jsonError("Not found", 404);
    await prisma.applicationTask.delete({where: {id: taskId}});
    return Response.json({ok: true});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to delete task", 500);
  }
}
