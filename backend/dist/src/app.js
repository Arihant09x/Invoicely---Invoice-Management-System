"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN === "*"
            ? true
            : env_1.env.CORS_ORIGIN.split(",").map((s) => s.trim()),
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "production" ? "combined" : "dev"));
    app.get("/health", (_req, res) => res.json({ ok: true }));
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/invoices", invoice_routes_1.default);
    app.use("/api/dashboard", dashboard_routes_1.default);
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
