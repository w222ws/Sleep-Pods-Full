import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPods = asyncHandler(async (req: Request, res: Response) => {
  const pods = await prisma.pod.findMany({
    where: { isActive: true },
  });
  res.json(pods);
});

export const getPodById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const pod = await prisma.pod.findUnique({
    where: { id: id as string },
  });

  if (!pod) {
    res.status(404);
    throw new Error("Капсула не знайдена");
  }

  res.json(pod);
});

export const createPod = asyncHandler(async (req: Request, res: Response) => {
  const newPod = await prisma.pod.create({
    data: req.body,
  });

  res.status(201).json(newPod);
});
