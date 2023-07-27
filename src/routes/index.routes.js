import { Router } from "express";
import gamesRouter from "./jogos.routes.js";
import customersRouter from "./clientes.routes.js";
import rentalsRouter from "./alugueis.routes.js";

const router = Router();

router.use(gamesRouter);
router.use(customersRouter);
router.use(rentalsRouter);

export default router;
