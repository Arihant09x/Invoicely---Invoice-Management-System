import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const app = createApp();

async function main() {
  // ensure DB connection on boot
  await prisma.$connect();
  console.log("Database connected successfully");

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
