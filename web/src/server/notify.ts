import {prisma} from "./db";

export async function notify(
  userId: string,
  title: string,
  body = "",
  href = "",
) {
  return prisma.notification.create({
    data: {userId, title, body, href},
  });
}
