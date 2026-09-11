"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
const httpStatus_1 = require("../utils/httpStatus");
function notFound(_req, res) {
    return res.status(httpStatus_1.httpStatus.NOT_FOUND).json({ message: "Route not found" });
}
