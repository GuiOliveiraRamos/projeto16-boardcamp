import { Router } from "express";
import {
  endRental,
  getAllRentals,
  newRental,
} from "../controllers/alugueis.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getAllRentals);
rentalsRouter.post("/rentals", newRental);
rentalsRouter.post("/rentals/:id/return", endRental);

export default rentalsRouter;
