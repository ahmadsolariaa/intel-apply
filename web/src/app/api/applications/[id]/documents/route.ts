import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

import {jsonError, requireUser} from "@/server/auth";
import {prisma} from "@/server/db";

type Params = {params: Promise<{id: string}>};

export async function POST(request: Request, {params}: Params) {
  try {
    const user = await requireUser();
    const {id} = await params;
    const app = await prisma.application.findFirst({where: {id, userId: user.id}});
    if (!app) return jsonError("Not found", 404);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("file is required");

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const dir = path.join(process.cwd(), "public", "uploads", id);
    await mkdir(dir, {recursive: true});
    const stored = `${Date.now()}-${safeName}`;
    await writeFile(path.join(dir, stored), bytes);

    const doc = await prisma.applicationDocument.create({
      data: {
        applicationId: id,
        name: form.get("name")?.toString() || file.name,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: bytes.length,
        storagePath: `/uploads/${id}/${stored}`,
      },
    });

    return Response.json({item: doc}, {status: 201});
  } catch (error) {
    if ((error as {status?: number}).status === 401) return jsonError("Unauthorized", 401);
    return jsonError("Upload failed", 500);
  }
}
