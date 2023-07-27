import { Router } from "express";
import {
  getCustomers,
  newCustomer,
} from "../controllers/clientes.controllers.js";

const customersRouter = Router();

customersRouter.post("/customers", newCustomer);
customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id");
customersRouter.put("/customers/:id");

export default customersRouter;
