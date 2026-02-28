import type {FastifyReply} from "fastify";

type SseClient = { reply: FastifyReply; lastPing: number };

const channels = new Map<string, Set<SseClient>>();

/** Register a reply as a live SSE client for a named channel */
export function subscribe(channel: string, reply: FastifyReply) {
    if (!channels.has(channel)) channels.set(channel, new Set());

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders();

    const client: SseClient = {reply, lastPing: Date.now()};
    channels.get(channel)!.add(client);

    // Heartbeat so proxies/nginx don't close idle connections
    const hb = setInterval(() => {
        try {
            reply.raw.write(": heartbeat\n\n");
            client.lastPing = Date.now();
        } catch {
            clearInterval(hb);
            channels.get(channel)?.delete(client);
        }
    }, 20_000);

    reply.raw.on("close", () => {
        clearInterval(hb);
        channels.get(channel)?.delete(client);
    });
}

/** Broadcast a typed event to all clients on a channel */
export function broadcast<T>(channel: string, event: string, data: T) {
    const clients = channels.get(channel);
    if (!clients?.size) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
        try {
            client.reply.raw.write(payload);
        } catch {
            clients.delete(client);
        }
    }
}

export function clientCount(channel: string): number {
    return channels.get(channel)?.size ?? 0;
}