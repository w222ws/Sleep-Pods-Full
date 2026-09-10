import express, { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getPods = async (req: Request, res: Response) => {
  try {
    const pods = await prisma.pod.findMany({
      where: { isActive: true },
    });
    res.json(pods);
  } catch (error) {
    res.status(500).json({ message: "Помилка серверу" });
  }
};

export const getPodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pod = await prisma.pod.findUnique({
      where: { id: id as string },
    });

    if (!pod) {
      return res.status(404).json({ message: "Капсула не знайдена" });
    }

    res.json(pod);
  } catch (error) {
    res.status(500).json({ message: "Ловимо помилку" });
  }
};
