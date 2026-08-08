import {z} from "zod";

import {createSession, jsonError, verifyPassword} from "@/server/auth";
import {prisma} from "@/server/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({where: {email: body.email.toLowerCase()}});

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession({id: user.id, email: user.email, name: user.name});
    return Response.json({
      user: {id: user.id, email: user.email, name: user.name},
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload");
    }
    return jsonError("Login failed", 500);
  }
}
