import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { env } from "@/env";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: any) => void;
  subscribe: (callback: (message: WebSocketMessage) => void) => () => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  serverId: string;
}

export const WebSocketProvider = ({ children, serverId }: WebSocketProviderProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const subscribersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Token generation mutation
  const tokenMutation = useMutation(orpc.atlas.getWebSocketToken.mutationOptions());

  const connectRef = useRef<() => Promise<void>>();

  connectRef.current = async () => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      
      // Get fresh token
      const tokenData = await tokenMutation.mutateAsync({ server: serverId });

      // Connect with token
      const wsUrl = `${env.VITE_ATLAS_WEBSOCKET_URL}/api/v1/servers/${serverId}/ws?auth=${tokenData.token}`;
      const socket = new WebSocket(wsUrl);
      setWs(socket);

      socket.addEventListener("open", () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
      });

      socket.addEventListener("message", (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        // Handle auth challenges - always get fresh token when challenged
        if (data.type === "auth-challenge") {
          tokenMutation.mutateAsync({ server: serverId }).then(tokenData => {
            tokenRef.current = tokenData.token;
            socket.send(JSON.stringify({
              type: "auth",
              token: tokenData.token
            }));
          }).catch(error => {
            console.error("Failed to refresh token for auth challenge:", error);
            socket.close();
          });
          return; // Don't forward auth-challenge to subscribers
        }

        // Handle auth results
        if (data.type === "auth-result") {
          if (data.success === true || data.message === "Authentication successful") {
            console.log("WebSocket re-authentication successful");
          } else {
            console.error("WebSocket re-authentication failed:", data.message || data);
            socket.close();
          }
          return; // Don't forward auth-result to subscribers
        }
        
        // Notify all subscribers of other messages
        subscribersRef.current.forEach(callback => {
          callback(data);
        });
      });

      socket.addEventListener("close", () => {
        setIsConnected(false);
        setIsConnecting(false);
        setWs(null);

        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        }
      });

      socket.addEventListener("error", () => {
        setIsConnecting(false);
        setIsConnected(false);
      });

    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setIsConnecting(false);
    }
  };

  const connect = useCallback(() => {
    connectRef.current?.();
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws) {
      ws.close();
    }
    
    setWs(null);
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, [ws]);

  const sendMessage = useCallback((message: any) => {
    if (!ws) {
      console.warn("WebSocket not available for sending message:", message);
      return;
    }
    
    if (!isConnected) {
      console.warn("WebSocket not connected for sending message:", message);
      return;
    }
    
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not in OPEN state:", ws.readyState, "for message:", message);
      return;
    }
    
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Failed to send WebSocket message:", error, message);
    }
  }, [ws, isConnected]);

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    subscribersRef.current.add(callback);
    
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Initial connection
  useEffect(() => {
    connectRef.current?.();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (ws) {
        ws.close();
      }
    };
  }, [serverId]); // Only depend on serverId

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    sendMessage,
    subscribe,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};