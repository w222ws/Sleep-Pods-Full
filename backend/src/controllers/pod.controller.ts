import express, { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getPods = async (req: Request, res: Response) => {
  try {
    const pods = await prisma.pod.findMany({
      where: { isActive: true },
    });
    res.json(pods);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
// импортируем запросы ответы, с типом сразу, с экспресс, так? ну и присму типо имортируем
// ту тему чтобы у нас одна страница работала а не куча) потом еще все вспомним, по коммитим)
// дальше експортируем функцию получения всех капсул, в ассинк режиме, с блоком тру кетч чтоб если падало то нормально, конст капсул,  ассинх обращ в присму, комнаты и фильтр по активным, типу выбор ток активные, ну и ответ кидаем в жсон чтоб читалось когда пришло с сервера) так??
