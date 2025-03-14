const { parse } = require("node:url");
const { createServer, Server, IncomingMessage, ServerResponse } = require("node:http");
const next = require("next");
const { WebSocket, WebSocketServer } = require("ws");
const { Socket } = require("node:net");

const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();

// Store clients in rooms based on websiteId
const rooms = new Map();

nextApp.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res, parse(req.url || "", true));
    });

    const wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws) => {
        let userWebsiteId = null; // Track which room the user is in

        ws.on("message", (message, isBinary) => {
            try {
                const receivedMessage = JSON.parse(message.toString())

                if (receivedMessage.type === "join") {
                    console.log(`wants to join website room id: ${receivedMessage.websiteId}`);

                    // If user isn't already in the correct room, add them
                    if (!rooms.has(receivedMessage.websiteId)) {
                        rooms.set(receivedMessage.websiteId, new Set());

                        // Store this WebSocket in the correct room
                        rooms.get(receivedMessage.websiteId).add(ws);

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
                    rooms.get(receivedMessage.data.websiteId).forEach((client) => {
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
                rooms.get(userWebsiteId).delete(ws);

                if (rooms.get(userWebsiteId).size === 0) {

                    // Cleanup room if no clients remain
                    rooms.delete(userWebsiteId);
                }
            }

            console.log("Client disconnected");
        });
    });

    server.on("upgrade", (req, socket, head) => {
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
