// import { parse } from 'node:url';
// import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http';
// import next from 'next';
// import { WebSocket, WebSocketServer } from 'ws';
// import { Socket } from 'node:net';
// import { webSocketMessageSchema } from './types';

// const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
// const handle = nextApp.getRequestHandler();
// const clients: Set<WebSocket> = new Set();

// nextApp.prepare().then(() => {
//   const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
//     handle(req, res, parse(req.url || '', true));
//   });

//   const wss = new WebSocketServer({ noServer: true });

//   wss.on('connection', (ws: WebSocket) => {
//     clients.add(ws);

//     ws.on('message', (message: Buffer, isBinary: boolean) => {
//       const receivedMessage = webSocketMessageSchema.parse(JSON.parse(message.toString()))

//       if (receivedMessage.type === "standard") {
//         console.log(`Message received from website: ${receivedMessage.data.websiteId}`);
//       }

//       clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN && receivedMessage.type !== "ping") {
//           client.send(message, { binary: isBinary });
//         }
//       });
//     })

//     ws.on('close', () => {
//       clients.delete(ws);
//       console.log('Client disconnected');
//     });
//   })

//   server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
//     const { pathname } = parse(req.url || "/", true);

//     if (pathname === "/_next/webpack-hmr") {
//       nextApp.getUpgradeHandler()(req, socket, head);
//     }

//     if (pathname === "/api/ws") {
//       wss.handleUpgrade(req, socket, head, (ws) => {
//         wss.emit('connection', ws, req);
//       });
//     }
//   })

//   server.listen(3000);
//   console.log('Server listening on port 3000');
// })


import { parse } from "node:url";
import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";
import { Socket } from "node:net";
import { z } from "zod"

const webSocketStandardMessageSchema = z.object({
  type: z.literal("standard"),
  data: z.object({
    websiteId: z.string(),
    updated: z.enum(["website", "page", "usedComponent"])
  })
});
const webSocketMessageJoinSchema = z.object({
  type: z.literal("join"),
  websiteId: z.string(),
});
const webSocketMessagePingSchema = z.object({
  type: z.literal("ping"),
});

const webSocketMessageSchema = z.union([webSocketStandardMessageSchema, webSocketMessageJoinSchema, webSocketMessagePingSchema])

const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();

// Store clients in rooms based on websiteId
const rooms: Map<string, Set<WebSocket>> = new Map();

nextApp.prepare().then(() => {
  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res, parse(req.url || "", true));
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    let userWebsiteId: string | null = null; // Track which room the user is in

    ws.on("message", (message: Buffer, isBinary: boolean) => {
      try {
        const receivedMessage = webSocketMessageSchema.parse(JSON.parse(message.toString()))

        if (receivedMessage.type === "join") {
          console.log(`Message received to join website room: ${receivedMessage.websiteId}`);

          // If user isn't already in the correct room, add them
          if (!rooms.has(receivedMessage.websiteId)) {
            rooms.set(receivedMessage.websiteId, new Set());
          }

          // Store this WebSocket in the correct room
          rooms.get(receivedMessage.websiteId)!.add(ws);
          userWebsiteId = receivedMessage.websiteId; // Track which room this client is in
        }

        if (receivedMessage.type === "standard") {
          if (rooms.get(receivedMessage.data.websiteId) === undefined) {
            console.log(`$didnt see room for this websiteId`);
            return
          }
          console.log(`Message received for website: ${receivedMessage.data.websiteId}`);

          // Broadcast ONLY to users in the same room
          rooms.get(receivedMessage.data.websiteId)!.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {

              client.send(JSON.stringify(receivedMessage), { binary: isBinary });
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (userWebsiteId && rooms.has(userWebsiteId)) {
        rooms.get(userWebsiteId)!.delete(ws);
        if (rooms.get(userWebsiteId)!.size === 0) {
          rooms.delete(userWebsiteId); // Cleanup if no clients remain
        }
      }
      console.log("Client disconnected");
    });
  });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const { pathname } = parse(req.url || "/", true);

    if (pathname === "/_next/webpack-hmr") {
      nextApp.getUpgradeHandler()(req, socket, head);
    }

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server.listen(3000);
  console.log("Server listening on port 3000");
});
