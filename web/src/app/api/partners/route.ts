import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

const MAX_PARTNERS = 15;

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const {searchParams} = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const region = searchParams.get("region") ?? "all";
    const country = searchParams.get("country") ?? "all";

    const where: Record<string, unknown> = {active: true};
    if (q) where.name = {contains: q};
    if (region !== "all") where.region = region;
    if (country !== "all") where.country = country;

    const [institutions, selected, regions, countries] = await Promise.all([
      prisma.institution.findMany({where, orderBy: {name: "asc"}}),
      prisma.partnerSelection.findMany({
        where: {userId: user.id},
        include: {institution: true},
      }),
      prisma.institution.findMany({distinct: ["region"], select: {region: true}}),
      prisma.institution.findMany({
        where: region === "all" ? undefined : {region},
        distinct: ["country"],
        select: {country: true},
      }),
    ]);

    const selectedIds = new Set(selected.map((s) => s.institutionId));

    return Response.json({
      max: MAX_PARTNERS,
      selectedCount: selected.length,
      selectedIds: [...selectedIds],
      selected: selected.map((s) => s.institution),
      institutions: institutions.map((i) => ({
        ...i,
        selected: selectedIds.has(i.id),
      })),
      regions: regions.map((r) => r.region).sort(),
      countries: countries.map((c) => c.country).sort(),
    });
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load institutions", 500);
  }
}

const saveSchema = z.object({
  institutionIds: z.array(z.string()).max(MAX_PARTNERS),
});

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = saveSchema.parse(await request.json());

    if (body.institutionIds.length > MAX_PARTNERS) {
      return jsonError(`You can select up to ${MAX_PARTNERS} institutes`);
    }

    const valid = await prisma.institution.count({
      where: {id: {in: body.institutionIds}, active: true},
    });
    if (valid !== body.institutionIds.length) {
      return jsonError("One or more institutes are invalid");
    }

    await prisma.$transaction([
      prisma.partnerSelection.deleteMany({where: {userId: user.id}}),
      prisma.partnerSelection.createMany({
        data: body.institutionIds.map((institutionId) => ({
          userId: user.id,
          institutionId,
        })),
      }),
    ]);

    await notify(
      user.id,
      "Partner institutes updated",
      `${body.institutionIds.length}/${MAX_PARTNERS} institutes selected`,
      "/partners",
    );

    return Response.json({ok: true, selectedCount: body.institutionIds.length});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to save partners", 500);
  }
}

const toggleSchema = z.object({
  institutionId: z.string().min(1),
  selected: z.boolean(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = toggleSchema.parse(await request.json());
    const count = await prisma.partnerSelection.count({where: {userId: user.id}});

    if (body.selected) {
      if (count >= MAX_PARTNERS) {
        return jsonError(`Limit reached: ${MAX_PARTNERS} institutes`);
      }
      await prisma.partnerSelection.upsert({
        where: {
          userId_institutionId: {
            userId: user.id,
            institutionId: body.institutionId,
          },
        },
        create: {userId: user.id, institutionId: body.institutionId},
        update: {},
      });
    } else {
      await prisma.partnerSelection.deleteMany({
        where: {userId: user.id, institutionId: body.institutionId},
      });
    }

    const selectedCount = await prisma.partnerSelection.count({where: {userId: user.id}});
    return Response.json({ok: true, selectedCount, max: MAX_PARTNERS});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update selection", 500);
  }
}
