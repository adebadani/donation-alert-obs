import { Router } from "express";
import { createDonation } from "../controllers/donation.controller";

const router = Router();

// POST /api/donations/:streamKey
router.post("/:streamKey", createDonation);

export default router;
