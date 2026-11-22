import { Router } from "express";
import { databaseHealthController } from "../controllers/database.controller.js";

const healthRouter = Router();

healthRouter.get("/database", databaseHealthController);

export default healthRouter;