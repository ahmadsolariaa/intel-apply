import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (!q) return Response.json({applications: [], contracts: [], commissions: []});

    const [applications, contracts, commissions] = await Promise.all([
      prisma.application.findMany({
        where: {
          userId: user.id,
          OR: [
            {studentName: {contains: q}},
            {email: {contains: q}},
            {institution: {contains: q}},
            {programme: {contains: q}},
          ],
        },
        take: 8,
        orderBy: {updatedAt: "desc"},
      }),
      prisma.contract.findMany({
        where: {
          userId: user.id,
          OR: [
            {institution: {contains: q}},
            {contractNumber: {contains: q}},
          ],
        },
        take: 8,
        orderBy: {updatedAt: "desc"},
      }),
      prisma.commission.findMany({
        where: {
          userId: user.id,
          OR: [
            {caseNumber: {contains: q}},
            {subject: {contains: q}},
            {institution: {contains: q}},
          ],
        },
        take: 8,
        orderBy: {updatedAt: "desc"},
      }),
    ]);

    return Response.json({applications, contracts, commissions});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Search failed", 500);
  }
}
