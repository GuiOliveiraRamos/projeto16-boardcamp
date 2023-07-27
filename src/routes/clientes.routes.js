import { Router } from "express";
import {
  getCustomers,
  getCustomersById,
  newCustomer,
  updateCustomer,
} from "../controllers/clientes.controllers.js";

const customersRouter = Router();

customersRouter.post("/customers", newCustomer);
customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersById);
customersRouter.put("/customers/:id", updateCustomer);

export default customersRouter;
