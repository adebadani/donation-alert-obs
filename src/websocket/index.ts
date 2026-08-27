import { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { URL } from "url";
import { socketManager, TrackedSocket } from "./socketManager";
import { isValidStreamKey } from "../config/streamKeys";

const ALERT_PATH = "/widgets/alert";
const HEARTBEAT_INTERVAL_MS = 30_000;

export function setupWebSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    const { pathname, searchParams } = new URL(
      request.url ?? "",
      `http://${request.headers.host}`
    );

    if (pathname !== ALERT_PATH) {
      socket.destroy();
      return;
    }

    const streamKey = searchParams.get("streamKey");
    if (!streamKey || !isValidStreamKey(streamKey)) {
      console.log(`[ws] rejected connection, invalid streamKey: ${streamKey}`);
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, streamKey);
    });
  });

  wss.on("connection", (ws: TrackedSocket, _request: IncomingMessage, streamKey: string) => {
    ws.isAlive = true;
    socketManager.addClient(streamKey, ws);
    console.log(`[ws] widget connected, streamKey=${streamKey}, total=${socketManager.connectedCount(streamKey)}`);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      socketManager.removeClient(streamKey, ws);
      console.log(`[ws] widget disconnected, streamKey=${streamKey}, total=${socketManager.connectedCount(streamKey)}`);
    });

    ws.on("error", () => {
      socketManager.removeClient(streamKey, ws);
    });
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients as Set<TrackedSocket>) {
      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => clearInterval(heartbeat));
}
