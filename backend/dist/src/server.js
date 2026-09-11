"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const app = (0, app_1.createApp)();
async function main() {
    // ensure DB connection on boot
    await prisma_1.prisma.$connect();
    console.log("Database connected successfully");
    app.listen(env_1.env.PORT, () => {
        console.log(`Server running on port ${env_1.env.PORT}`);
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
