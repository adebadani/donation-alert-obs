import { WebSocket } from "ws";
import { DonationAlertEvent } from "../types/donation";

interface TrackedSocket extends WebSocket {
  isAlive?: boolean;
}

class SocketManager {
  private rooms = new Map<string, Set<TrackedSocket>>();

  addClient(streamKey: string, socket: TrackedSocket): void {
    if (!this.rooms.has(streamKey)) {
      this.rooms.set(streamKey, new Set());
    }
    this.rooms.get(streamKey)!.add(socket);
  }

  removeClient(streamKey: string, socket: TrackedSocket): void {
    const room = this.rooms.get(streamKey);
    if (!room) return;
    room.delete(socket);
    if (room.size === 0) this.rooms.delete(streamKey);
  }

  broadcast(streamKey: string, event: DonationAlertEvent): number {
    const room = this.rooms.get(streamKey);
    if (!room || room.size === 0) return 0;

    const payload = JSON.stringify(event);
    let delivered = 0;
    for (const socket of room) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
        delivered++;
      }
    }
    return delivered;
  }

  connectedCount(streamKey: string): number {
    return this.rooms.get(streamKey)?.size ?? 0;
  }
}

export const socketManager = new SocketManager();
export type { TrackedSocket };
