import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useMutation } from "@tanstack/react-query";

import { env } from "@/env";
import { orpc } from "@/lib/orpc";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionFailed: boolean;
  sendMessage: (_message: any) => void;
  subscribe: (_callback: (_message: WebSocketMessage) => void) => () => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const activeConnections = new Map<string, boolean>();

interface WebSocketProviderProps {
  children: ReactNode;
  serverId: string;
}

export const WebSocketProvider = ({
  children,
  serverId,
}: WebSocketProviderProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const subscribersRef = useRef<Set<(_message: WebSocketMessage) => void>>(
    new Set()
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const tokenMutation = useMutation(
    orpc.atlas.getWebSocketToken.mutationOptions()
  );

  const connectRef = useRef<() => Promise<void>>(undefined);

  connectRef.current = async () => {
    if (isConnecting || isConnected || ws || activeConnections.get(serverId)) {
      return;
    }

    try {
      activeConnections.set(serverId, true);
      setIsConnecting(true);

      const tokenData = await tokenMutation.mutateAsync({ server: serverId });

      const wsUrl = `${env.VITE_ATLAS_WEBSOCKET_URL}/api/v1/servers/${serverId}/ws?auth=${tokenData.token}`;
      const socket = new WebSocket(wsUrl);
      setWs(socket);

      socket.addEventListener("open", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionFailed(false);
        reconnectAttemptsRef.current = 0;
      });

      socket.addEventListener("message", (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === "log") {
          console.log("[WEBSOCKET] Log message received:", data);
        }

        if (data.type === "auth-challenge") {
          tokenMutation
            .mutateAsync({ server: serverId })
            .then((tokenData) => {
              socket.send(
                JSON.stringify({
                  type: "auth",
                  token: tokenData.token,
                })
              );
            })
            .catch(() => {
              socket.close();
            });
          return;
        }

        if (data.type === "auth-result") {
          if (
            data.success !== true &&
            data.message !== "Authentication successful"
          ) {
            socket.close();
          }
          return;
        }

        subscribersRef.current.forEach((callback) => {
          callback(data);
        });
      });

      socket.addEventListener("close", () => {
        setIsConnected(false);
        setIsConnecting(false);
        setWs(null);
        activeConnections.delete(serverId);

        if (reconnectAttemptsRef.current < 3) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else {
          setConnectionFailed(true);
        }
      });

      socket.addEventListener("error", () => {
        setIsConnecting(false);
        setIsConnected(false);
        activeConnections.delete(serverId);
      });
    } catch {
      setIsConnecting(false);
      activeConnections.delete(serverId);
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

  const sendMessage = useCallback(
    (message: any) => {
      if (!ws || !isConnected || ws.readyState !== WebSocket.OPEN) {
        return;
      }

      try {
        ws.send(JSON.stringify(message));
      } catch {}
    },
    [ws, isConnected]
  );

  const subscribe = useCallback(
    (callback: (_message: WebSocketMessage) => void) => {
      subscribersRef.current.add(callback);

      return () => {
        subscribersRef.current.delete(callback);
      };
    },
    []
  );

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    connectionFailed,
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
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
