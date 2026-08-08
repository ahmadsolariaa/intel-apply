import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

const createSchema = z.object({
  institution: z.string().min(1),
  contractNumber: z.string().min(1),
  market: z.string().optional().default(""),
  stage: z.string().optional().default("New Enquiry"),
  signingStatus: z.string().optional().default("Contract Not Issued"),
  status: z.string().optional().default("Inactive"),
  businessLicense: z.boolean().optional().default(false),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const {searchParams} = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const tab = searchParams.get("tab") ?? "all";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));

    const where: Record<string, unknown> = {userId: user.id};
    if (q) {
      where.OR = [
        {institution: {contains: q}},
        {contractNumber: {contains: q}},
        {market: {contains: q}},
      ];
    }
    // GUS tabs: All / New Enquiry / Under Review / Signing / Signed / Closed
    if (tab === "new") where.stage = "New Enquiry";
    if (tab === "review") where.stage = "Under Review";
    if (tab === "signing") where.stage = "Contract Signing";
    if (tab === "signed") where.stage = "Signed Contracts";
    if (tab === "closed") where.stage = "Closed Enquiry";

    const [total, items, all] = await Promise.all([
      prisma.contract.count({where}),
      prisma.contract.findMany({
        where,
        orderBy: {createdAt: "desc"},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contract.findMany({
        where: {userId: user.id},
        select: {status: true, stage: true, businessLicense: true},
      }),
    ]);

    const kpis = {
      total: all.length,
      active: all.filter((c) => c.status === "Active").length,
      inactive: all.filter((c) => c.status !== "Active").length,
      withLicense: all.filter((c) => c.businessLicense).length,
      signing: all.filter((c) => c.stage === "Contract Signing").length,
      signed: all.filter((c) => c.stage === "Signed Contracts").length,
    };

    return Response.json({items, total, page, pageSize, kpis});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load contracts", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await request.json());
    const item = await prisma.contract.create({data: {...body, userId: user.id}});
    await notify(user.id, "Contract created", item.contractNumber, `/contracts/${item.id}`);
    return Response.json({item}, {status: 201});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to create contract", 500);
  }
}
