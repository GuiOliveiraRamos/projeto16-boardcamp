import { Router } from "express";
import {
  deleteRentals,
  endRental,
  getAllRentals,
  newRental,
} from "../controllers/alugueis.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getAllRentals);
rentalsRouter.post("/rentals", newRental);
rentalsRouter.post("/rentals/:id/return", endRental);
rentalsRouter.delete("/rentals/:id", deleteRentals);

export default rentalsRouter;
