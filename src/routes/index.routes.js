import { Router } from "express";
import gamesRouter from "./jogos.routes.js";
import customersRouter from "./clientes.routes.js";

const router = Router();

router.use(gamesRouter);
router.use(customersRouter);

export default router;
