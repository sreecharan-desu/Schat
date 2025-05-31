import WebSocket from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";
import url from "url";

dotenv.config();

// Expected body input 
// {
//   "to": "target@gmail.com",
//   "message": "Hey!"
// }

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

interface ExtWebSocket extends WebSocket {
  userEmail?: string;
}

const clientsMap = new Map<string, ExtWebSocket>(); // email ➝ socket

// Function to broadcast current online users to all clients
function broadcastOnlineStatus() {
  const onlineUsers = Array.from(clientsMap.keys());

  clientsMap.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "status_update",
          onlineUsers,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
}

wss.on("connection", (ws: ExtWebSocket, req: IncomingMessage) => {
  const query = url.parse(req.url || "", true).query;
  const token = query.token as string;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    ws.userEmail = (decoded as any).email;

    clientsMap.set(ws.userEmail!, ws);
    console.log(`🔗 ${ws.userEmail} connected`);

    // Broadcast updated online status to everyone
    broadcastOnlineStatus();

    ws.on("message", (data: string) => {
      try {
        const { to, message } = JSON.parse(data);

        const targetSocket = clientsMap.get(to);
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          // Send message to recipient
          targetSocket.send(
            JSON.stringify({
              from: ws.userEmail,
              message,
              timestamp: new Date().toISOString(),
            })
          );

          // Send acknowledgment to sender
          ws.send(
            JSON.stringify({
              type: "ack",
              status: "sent",
              to,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          console.log(`User ${to} is not connected`);

          // Notify sender that user is offline
          ws.send(
            JSON.stringify({
              type: "ack",
              status: "failed",
              to,
              reason: "User is offline",
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (err) {
        console.log("Invalid message format:", err);
        // Notify sender about invalid format
        ws.send(
          JSON.stringify({
            type: "ack",
            status: "failed",
            reason: "Invalid message format",
            timestamp: new Date().toISOString(),
          })
        );
      }
    });


    ws.on("close", () => {
      console.log(`${ws.userEmail} disconnected`);
      if (ws.userEmail) {
        clientsMap.delete(ws.userEmail);
        // Broadcast updated online status on disconnect
        broadcastOnlineStatus();
      }
    });
  } catch (err) {
    ws.close(); // invalid token
  }
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
