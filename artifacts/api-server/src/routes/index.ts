import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import ticketsRouter from "./tickets";
import packagesRouter from "./packages";
import bookingsRouter from "./bookings";
import ledgerRouter from "./ledger";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(ticketsRouter);
router.use(packagesRouter);
router.use(bookingsRouter);
router.use(ledgerRouter);
router.use(adminRouter);

export default router;
