// Interface for a chat message
export interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

// Interface for status update messages from WebSocket
export interface StatusUpdate {
  type: 'status_update';
  onlineUsers: string[];
  timestamp: string;
}

// Interface for acknowledgment messages
export interface Ack {
  type: 'ack';
  status: 'sent' | 'failed';
  to: string;
  reason?: string;
  timestamp: string;
}

// Interface for history messages
export interface History {
  type: 'history';
  messages: Message[];
  withUser: string;
}

// Global WebSocket instance
let ws: WebSocket | null = null;
// Counter for reconnection attempts
let reconnectAttempts = 0;
// Maximum number of reconnection attempts
const maxReconnectAttempts = 5;
// Flag to control reconnection behavior
let shouldReconnect = true;

// Function to extract the current user's email from the JWT token
const getCurrentUserEmail = (): string | null => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.email || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
  return null;
};

// Function to connect to the WebSocket server
export const connectWebSocket = (
  token: string,
  onMessage: (data: Message | StatusUpdate | Ack | History) => void
) => {
  const WEBSOCKET_URL = `${import.meta.env.VITE_WEBSOCKET_URL}?token=${token}`;
  console.log('Connecting to WebSocket:', WEBSOCKET_URL);
  ws = new WebSocket(WEBSOCKET_URL);

  // Handle WebSocket connection open
  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  };

  // Handle incoming messages
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'history') {
      onMessage(data as History);
    } else if (data.type === 'status_update') {
      onMessage(data as StatusUpdate);
    } else if (data.type === 'ack') {
      onMessage(data as Ack);
    } else {
      const currentUserEmail = getCurrentUserEmail();
      const message: Message = {
        from: data.from,
        to: currentUserEmail || '',
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      onMessage(message);
    }
  };

  // Handle WebSocket disconnection
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    ws = null;
    if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
        reconnectAttempts++;
        connectWebSocket(token, onMessage);
      }, 2000);
    }
  };

  // Handle WebSocket errors
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

// Function to send a message via WebSocket
export const sendMessage = (message: Message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ to: message.to, message: message.message }));
  } else {
    console.warn('WebSocket is not open. Message not sent:', message);
  }
};

// Function to request chat history for a specific user
export const requestHistory = (withUser: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'request_history', withUser }));
  } else {
    console.warn('WebSocket is not open. History request not sent for:', withUser);
  }
};

// Function to disconnect from the WebSocket server
export const disconnectWebSocket = () => {
  console.log('Attempting to disconnect WebSocket');
  shouldReconnect = false;
  if (ws) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'User logout');
      console.log('WebSocket close initiated');
    } else {
      console.log('WebSocket already closed or not connected');
    }
    ws = null;
  } else {
    console.log('No WebSocket instance to disconnect');
  }
};