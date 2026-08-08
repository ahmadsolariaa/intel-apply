import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

const createSchema = z.object({
  caseNumber: z.string().min(1),
  subject: z.string().min(1),
  institution: z.string().min(1),
  status: z.string().optional().default("New"),
  intake: z.string().optional().default(""),
  amount: z.number().optional().default(0),
  currency: z.string().optional().default("EUR"),
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
        {caseNumber: {contains: q}},
        {subject: {contains: q}},
        {institution: {contains: q}},
      ];
    }
    if (tab !== "all" && tab !== "explore") {
      const map: Record<string, string> = {
        new: "New",
        statement: "Statement",
        invoice: "Invoice",
        payment: "Payment",
        closed: "Closed",
        rejected: "Rejected",
      };
      if (map[tab]) where.status = map[tab];
    }

    const [total, items, all] = await Promise.all([
      prisma.commission.count({where}),
      prisma.commission.findMany({
        where,
        orderBy: {createdAt: "desc"},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.commission.findMany({where: {userId: user.id}, select: {status: true}}),
    ]);

    const count = (status: string) => all.filter((c) => c.status === status).length;
    const kpis = {
      pendingStatement: count("Statement"),
      invoiceValidation: count("Invoice"),
      invoiceRejected: count("Rejected"),
      sentForPayment: count("Payment"),
      paymentCompleted: count("Closed"),
      caseClosed: count("Closed"),
    };

    return Response.json({items, total, page, pageSize, kpis});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load commissions", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await request.json());
    const item = await prisma.commission.create({data: {...body, userId: user.id}});
    await notify(user.id, "Commission case created", item.caseNumber, `/commissions/${item.id}`);
    return Response.json({item}, {status: 201});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to create commission", 500);
  }
}
