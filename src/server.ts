import { createServer } from "http";
import { createApp } from "./app";
import { setupWebSocket } from "./websocket";
import { env } from "./config/env";

const app = createApp();
const server = createServer(app);

setupWebSocket(server);

server.listen(env.port, () => {
  console.log(`HTTP server listening on port ${env.port}`);
  console.log(`WebSocket widget endpoint: ws://localhost:${env.port}/widgets/alert?streamKey=<key>`);
});
