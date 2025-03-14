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
        const receivedMessage = JSON.parse(message.toString())

        if (receivedMessage.type === "join") {
          console.log(`wants to join website room id: ${receivedMessage.websiteId}`);

          // If user isn't already in the correct room, add them
          if (!rooms.has(receivedMessage.websiteId)) {
            rooms.set(receivedMessage.websiteId, new Set());

            // Store this WebSocket in the correct room
            rooms.get(receivedMessage.websiteId)!.add(ws);

            // Track which room this client is in
            userWebsiteId = receivedMessage.websiteId;
          }
        }

        if (receivedMessage.type === "standard") {
          if (rooms.get(receivedMessage.data.websiteId) === undefined) {
            console.log(`$didnt see a room for this website Id`, receivedMessage.data.websiteId);
            return
          }

          console.log(`Message received from website with id: ${receivedMessage.data.websiteId}`);

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

          // Cleanup room if no clients remain
          rooms.delete(userWebsiteId);
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
