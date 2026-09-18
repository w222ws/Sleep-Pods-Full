import { Router } from "express";
import {
  createPod,
  getPodById,
  getPods,
} from "../controllers/pod.controller.js";
const router = Router();

router.get("/", getPods);
router.get("/:id", getPodById);
router.post("/", createPod);

export default router;
