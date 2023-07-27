import { Router } from "express";
import gamesRouter from "./jogos.routes.js";

const router = Router();

router.use(gamesRouter);

export default router;
