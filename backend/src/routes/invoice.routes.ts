import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  bulkSchema,
  invoiceCreateSchema,
  invoiceListQuerySchema,
  invoiceUpdateSchema,
} from "../utils/zodSchemas";

const router = Router();

router.use(authenticate);

router.get("/", validate(invoiceListQuerySchema), InvoiceController.list);
router.get("/export", InvoiceController.exportCsv);

router.get("/:id", InvoiceController.getById);
router.post("/", validate(invoiceCreateSchema), InvoiceController.create);
router.patch("/:id", validate(invoiceUpdateSchema), InvoiceController.update);
router.delete("/:id", InvoiceController.delete);

router.post("/bulk", validate(bulkSchema), InvoiceController.bulk);

export default router;
