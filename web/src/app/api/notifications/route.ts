import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.notification.findMany({
      where: {userId: user.id},
      orderBy: {createdAt: "desc"},
      take: 20,
    });
    const unread = items.filter((n) => !n.read).length;
    return Response.json({items, unread});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to load notifications", 500);
  }
}

export async function PATCH() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: {userId: user.id, read: false},
      data: {read: true},
    });
    return Response.json({ok: true});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Failed to update notifications", 500);
  }
}
