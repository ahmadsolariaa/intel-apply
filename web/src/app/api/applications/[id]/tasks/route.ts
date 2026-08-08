import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

type Params = {params: Promise<{id: string}>};

const schema = z.object({
  title: z.string().min(1),
});

export async function POST(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const app = await prisma.application.findFirst({where: {id, userId: user.id}});
    if (!app) return jsonError("Not found", 404);
    const body = schema.parse(await request.json());
    const task = await prisma.applicationTask.create({
      data: {applicationId: id, title: body.title},
    });
    return Response.json({item: task}, {status: 201});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to create task", 500);
  }
}
