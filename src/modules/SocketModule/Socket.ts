import { TGem, SocketSet } from "./types";
import { TAttributes, createEmptyAttributes } from "@modules/AttributeModule";

export class Socket {
  constructor(public sockets: SocketSet) {}

  insertGem(socketId: string, gem: TGem): boolean {
    const socket = this.sockets.find((s) => s.id === socketId);
    if (!socket || socket.gem) return false;
    if (socket.color !== gem.color && socket.color !== "any") return false;
    socket.gem = gem;
    return true;
  }

  removeGem(socketId: string): TGem | null {
    const socket = this.sockets.find((s) => s.id === socketId);
    if (!socket?.gem) return null;
    const gem = socket.gem;
    socket.gem = undefined;
    return gem;
  }

  getTotalAttributes(): TAttributes {
    const result: TAttributes = {};
    for (const socket of this.sockets) {
      const gemAttr: Record<string, number> = socket.gem?.bonusAttributes ?? {};
      for (const [key, val] of Object.entries(gemAttr)) {
        result[key] = (result[key] ?? 0) + val;
      }
    }
    return result;
  }
}
