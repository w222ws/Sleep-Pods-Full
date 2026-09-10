import { Router } from "express";
import { getPodById, getPods } from "../controllers/pod.controller.js";
const router = Router();

router.get("/", getPods);
router.get("/:id", getPodById);

export default router;
