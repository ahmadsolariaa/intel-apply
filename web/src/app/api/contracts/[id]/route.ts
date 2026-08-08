import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

type Params = {params: Promise<{id: string}>};

const updateSchema = z.object({
  institution: z.string().min(1).optional(),
  contractNumber: z.string().min(1).optional(),
  market: z.string().optional(),
  stage: z.string().optional(),
  signingStatus: z.string().optional(),
  status: z.string().optional(),
  businessLicense: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const item = await prisma.contract.findFirst({where: {id, userId: user.id}});
    if (!item) return jsonError("Not found", 404);
    return Response.json({item});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load contract", 500);
  }
}

export async function PATCH(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await prisma.contract.findFirst({where: {id, userId: user.id}});
    if (!existing) return jsonError("Not found", 404);
    const body = updateSchema.parse(await request.json());
    const item = await prisma.contract.update({where: {id}, data: body});
    await notify(user.id, "Contract updated", item.contractNumber, `/contracts/${item.id}`);
    return Response.json({item});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update contract", 500);
  }
}

export async function DELETE(_: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const existing = await prisma.contract.findFirst({where: {id, userId: user.id}});
    if (!existing) return jsonError("Not found", 404);
    await prisma.contract.delete({where: {id}});
    return Response.json({ok: true});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to delete contract", 500);
  }
}
