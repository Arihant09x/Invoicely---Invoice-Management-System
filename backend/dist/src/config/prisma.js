"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_neon_1 = require("@prisma/adapter-neon");
const serverless_1 = require("@neondatabase/serverless");
const ws_1 = __importDefault(require("ws")); // Import the ws package
const env_1 = require("./env");
// 1. Set the WebSocket constructor for Neon
serverless_1.neonConfig.webSocketConstructor = ws_1.default; // This is the crucial line
// 2. Create the adapter and pass in the connection string
const adapter = new adapter_neon_1.PrismaNeon({ connectionString: env_1.env.DATABASE_URL });
// 3. Create the Prisma Client with the adapter
exports.prisma = new client_1.PrismaClient({ adapter });
