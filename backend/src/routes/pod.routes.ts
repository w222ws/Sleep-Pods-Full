import { Router } from "express";
import {
  createPod,
  getPodById,
  getPods,
} from "../controllers/pod.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { createPodSchema } from "../schemas/pod.schema.js";

const router = Router();

router.get("/", getPods);
router.get("/:id", getPodById);
router.post("/", validate(createPodSchema), createPod);

export default router;
