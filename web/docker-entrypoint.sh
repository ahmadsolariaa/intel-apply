#!/bin/sh
set -e

echo "Applying Prisma schema..."
npx prisma db push --skip-generate

echo "Checking seed..."
node <<'NODE'
const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");
const prisma = new PrismaClient();

(async () => {
  const count = await prisma.user.count();
  if (count === 0) {
    console.log("No users found — running seed");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
  } else {
    console.log(`Skip seed (${count} users already exist)`);
  }
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
NODE

PORT="${PORT:-3000}"
echo "Starting Next.js on 0.0.0.0:${PORT}"
exec npx next start --hostname 0.0.0.0 --port "${PORT}"
