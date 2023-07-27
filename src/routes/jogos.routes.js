import { Router } from "express";
import { getGames, newGame } from "../controllers/jogos.controllers.js";

const gamesRouter = Router();

gamesRouter.post("/games", newGame);
gamesRouter.get("/games", getGames);

export default gamesRouter;
