import {z} from "zod";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";
import {notify} from "@/server/notify";

const createSchema = z.object({
  studentName: z.string().min(1),
  email: z.string().email(),
  institution: z.string().min(1),
  programme: z.string().min(1),
  intake: z.string().optional().default(""),
  status: z.string().optional().default("Draft Application"),
  progress: z.number().int().min(0).max(100).optional().default(10),
  notes: z.string().optional().default(""),
  visaNotes: z.string().optional().default(""),
  visaStatus: z.string().optional().default("Not started"),
});

function tabWhere(tab: string) {
  switch (tab) {
    case "draft":
      return {status: {contains: "Draft"}};
    case "document":
      return {status: {contains: "Document"}};
    case "pending":
      return {OR: [{status: {contains: "Pending"}}, {tasks: {some: {done: false}}}]};
    case "admission":
      return {
        OR: [
          {status: {contains: "accepted"}},
          {status: {contains: "Admission"}},
          {status: {contains: "submitted"}},
        ],
      };
    case "unassigned":
      return {institution: ""};
    case "incomplete":
      return {status: {contains: "not complete"}};
    default:
      return {};
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const {searchParams} = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const tab = searchParams.get("tab") ?? "all";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));

    const where: Record<string, unknown> = {
      userId: user.id,
      ...tabWhere(tab),
    };

    if (q) {
      where.AND = [
        {
          OR: [
            {studentName: {contains: q}},
            {email: {contains: q}},
            {institution: {contains: q}},
            {programme: {contains: q}},
          ],
        },
      ];
    }

    const [total, items, allForKpis] = await Promise.all([
      prisma.application.count({where}),
      prisma.application.findMany({
        where,
        orderBy: {updatedAt: "desc"},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.application.findMany({
        where: {userId: user.id},
        select: {status: true, progress: true, tasks: {select: {done: true}}},
      }),
    ]);

    const openTasks = allForKpis.reduce(
      (sum, app) => sum + app.tasks.filter((t) => !t.done).length,
      0,
    );

    const kpis = {
      toSubmit: allForKpis.filter(
        (a) => a.progress >= 100 || a.status.toLowerCase().includes("not complete"),
      ).length,
      toComplete: allForKpis.filter(
        (a) => a.progress < 100 || a.status.toLowerCase().includes("draft"),
      ).length,
      openTasks,
      completedTasks: allForKpis.reduce(
        (sum, app) => sum + app.tasks.filter((t) => t.done).length,
        0,
      ),
      completed: allForKpis.filter((a) => a.status.toLowerCase().includes("accepted")).length,
    };

    return Response.json({items, total, page, pageSize, kpis});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load applications", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await request.json());
    const app = await prisma.application.create({
      data: {
        ...body,
        userId: user.id,
        tasks: {
          create: [
            {title: "Collect student documents"},
            {title: "Upload passport / ID"},
            {title: "Submit to institution"},
          ],
        },
      },
      include: {tasks: true, documents: true},
    });

    await notify(
      user.id,
      "Application created",
      `${app.studentName} — ${app.institution}`,
      `/applications/${app.id}`,
    );

    return Response.json({item: app}, {status: 201});
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError(error.issues[0]?.message ?? "Invalid");
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to create application", 500);
  }
}
