import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws"; // Import the ws package
import { env } from "./env";

// 1. Set the WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws; // This is the crucial line

// 2. Create the adapter and pass in the connection string
const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

// 3. Create the Prisma Client with the adapter
export const prisma = new PrismaClient({ adapter });
