import { Router } from "express";
import {
  getAllRentals,
  newRental,
} from "../controllers/alugueis.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getAllRentals);
rentalsRouter.post("/rentals", newRental);

export default rentalsRouter;
