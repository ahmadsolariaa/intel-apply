import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

type Params = {params: Promise<{id: string}>};

const updateSchema = z.object({
  caseNumber: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  institution: z.string().min(1).optional(),
  status: z.string().optional(),
  intake: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const item = await prisma.commission.findFirst({where: {id, userId: user.id}});
    if (!item) return jsonError("Not found", 404);
    return Response.json({item});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load commission", 500);
  }
}

export async function PATCH(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await prisma.commission.findFirst({where: {id, userId: user.id}});
    if (!existing) return jsonError("Not found", 404);
    const body = updateSchema.parse(await request.json());
    const item = await prisma.commission.update({where: {id}, data: body});
    await notify(user.id, "Commission updated", `${item.caseNumber} → ${item.status}`, `/commissions/${item.id}`);
    return Response.json({item});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update commission", 500);
  }
}

export async function DELETE(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await prisma.commission.findFirst({where: {id, userId: user.id}});
    if (!existing) return jsonError("Not found", 404);
    await prisma.commission.delete({where: {id}});
    return Response.json({ok: true});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to delete commission", 500);
  }
}
