import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const {searchParams} = new URL(request.url);
    const days = Number(searchParams.get("days") ?? "30");
    const institution = searchParams.get("institution") ?? "all";
    const createdFrom = searchParams.get("createdFrom")?.trim() ?? "";
    const createdTo = searchParams.get("createdTo")?.trim() ?? "";

    const since = new Date();
    since.setDate(since.getDate() - (Number.isFinite(days) ? days : 30));

    const createdAt: {gte?: Date; lte?: Date} = {};
    if (createdFrom) {
      createdAt.gte = new Date(createdFrom);
    } else {
      createdAt.gte = since;
    }
    if (createdTo) {
      const end = new Date(createdTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }

    const appWhere: Record<string, unknown> = {
      userId: user.id,
      createdAt,
    };
    if (institution !== "all") appWhere.institution = institution;

    const [applications, contracts, commissions, institutions] = await Promise.all([
      prisma.application.findMany({
        where: appWhere,
        select: {status: true, institution: true, createdAt: true, progress: true},
      }),
      prisma.contract.count({
        where: {
          userId: user.id,
          createdAt,
          ...(institution !== "all" ? {institution} : {}),
        },
      }),
      prisma.commission.findMany({
        where: {
          userId: user.id,
          createdAt,
          ...(institution !== "all" ? {institution} : {}),
        },
        select: {amount: true, status: true, institution: true},
      }),
      prisma.application.findMany({
        where: {userId: user.id},
        distinct: ["institution"],
        select: {institution: true},
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const app of applications) {
      byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    }

    const byInstitution: Record<string, number> = {};
    for (const app of applications) {
      byInstitution[app.institution] = (byInstitution[app.institution] ?? 0) + 1;
    }

    const commissionByInstitution: Record<string, number> = {};
    for (const c of commissions) {
      commissionByInstitution[c.institution] =
        (commissionByInstitution[c.institution] ?? 0) + c.amount;
    }

    const commissionTotal = commissions.reduce((sum, c) => sum + c.amount, 0);

    return Response.json({
      totals: {
        applications: applications.length,
        contracts,
        commissions: commissions.length,
        commissionAmount: commissionTotal,
        avgProgress:
          applications.length === 0
            ? 0
            : Math.round(
                applications.reduce((sum, a) => sum + a.progress, 0) / applications.length,
              ),
      },
      byStatus: Object.entries(byStatus)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value),
      byInstitution: Object.entries(byInstitution)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value),
      commissionByInstitution: Object.entries(commissionByInstitution)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value),
      institutions: institutions.map((i) => i.institution).sort(),
      filters: {
        days: Number.isFinite(days) ? days : 30,
        institution,
        createdFrom: createdFrom || null,
        createdTo: createdTo || null,
      },
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load analytics", 500);
  }
}
