import type { Request, Response } from "express";
import { httpStatus } from "../utils/httpStatus";

export function notFound(_req: Request, res: Response) {
  return res.status(httpStatus.NOT_FOUND).json({ message: "Route not found" });
}
