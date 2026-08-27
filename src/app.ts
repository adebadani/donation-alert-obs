import express, { Application } from "express";
import cors from "cors";
import path from "path";
import donationRoutes from "./routes/donation.routes";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/widgets/alert", (_req, res) => {
    res.sendFile(path.join(__dirname, "../public/alert-widget.html"));
  });

  app.use("/api/donations", donationRoutes);

  return app;
}
