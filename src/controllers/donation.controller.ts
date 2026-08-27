import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { donationSchema } from "../schemas/donation.schema";
import { isValidStreamKey } from "../config/streamKeys";
import { socketManager } from "../websocket/socketManager";
import { Donation } from "../types/donation";

export function createDonation(req: Request, res: Response): void {
  const { streamKey } = req.params;

  if (!isValidStreamKey(streamKey)) {
    res.status(404).json({ error: "Stream key not found" });
    return;
  }

  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    return;
  }

  const donation: Donation = {
    id: randomUUID(),
    streamKey,
    donatorName: parsed.data.donatorName,
    amount: parsed.data.amount,
    currency: parsed.data.currency ?? "IDR",
    message: parsed.data.message ?? "",
    createdAt: new Date().toISOString(),
  };

  const deliveredTo = socketManager.broadcast(streamKey, {
    type: "donation",
    data: donation,
  });

  res.status(201).json({ donation, deliveredTo });
}
