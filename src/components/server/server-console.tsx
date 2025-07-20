import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import ConsoleLine from "@/components/server/console-line";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWebSocketContext } from "@/contexts/websocket-context";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { parseLog } from "@/lib/logs";
import { orpc } from "@/lib/orpc";
import { Server } from "@/server/lib/atlas-api/atlas-api.schemas";
import { LogLine } from "@/types/console";

const removeAnsiCodes = (str: string): string => {
  const ansiEscapeCodePattern = /\x1b\[[0-9;]*[a-zA-Z]/g;
  const otherWeirdCharactersPattern = /[\x00-\x1F\x7F-\x9F]/g;

  return str
    .replace(ansiEscapeCodePattern, "")
    .replace(otherWeirdCharactersPattern, "")
    .replace(">....", "")
    .replace("]:", "]")
    .replace("[?1h=[?2004h", "");
};

const ServerConsole = ({ server }: { server: Server }) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [history, setHistory] = usePersistedState<string[]>(
    `${server.name}:command_history`,
    []
  );
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [isProcessingInitial, setIsProcessingInitial] = useState(true);
  const [websocketLogs, setWebsocketLogs] = useState<LogLine[]>([]);
  const [backgroundProcessed, setBackgroundProcessed] = useState<Set<number>>(
    new Set()
  );
  const [initialProcessed, setInitialProcessed] = useState<Set<number>>(
    new Set()
  );
  const [lastKnownStatus, setLastKnownStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { sendMessage, isConnected, subscribe } = useWebSocketContext();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 5;
    setAutoScroll(isAtBottom);
  }, []);

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      const newIndex = Math.min(historyIndex + 1, history!.length - 1);

      setHistoryIndex(newIndex);
      e.currentTarget.value = history![newIndex] || "";

      e.preventDefault();
    }

    if (e.key === "ArrowDown") {
      const newIndex = Math.max(historyIndex - 1, -1);

      setHistoryIndex(newIndex);
      e.currentTarget.value = history![newIndex] || "";
    }

    const command = e.currentTarget.value;
    if (e.key === "Enter" && command.length > 0) {
      setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
      setHistoryIndex(-1);

      // Send command via WebSocket if connected
      if (isConnected) {
        sendMessage({
          type: "server-command",
          command: command,
          id: crypto.randomUUID(),
        });
      }

      e.currentTarget.value = "";
      e.currentTarget.focus();
    }
  };

  const { data: logsFetched, isLoading } = useQuery(
    orpc.atlas.getServerLogs.queryOptions({
      input: { server: server.serverId },
    })
  );

  const processedLogs = useMemo(() => {
    if (!logsFetched?.logs || logsFetched.logs.length === 0) return [];

    const result: LogLine[] = [];
    let previousLog: LogLine | undefined;

    for (const rawLog of logsFetched.logs) {
      const cleanLog = removeAnsiCodes(rawLog);
      if (cleanLog.trim() === "") continue;

      const parsedLog = parseLog(cleanLog, previousLog ?? null);
      if (parsedLog) {
        result.push(parsedLog);
        previousLog = parsedLog;
      }
    }

    return result;
  }, [logsFetched?.logs]);

  const totalLogsCount = processedLogs.length + websocketLogs.length;

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || totalLogsCount === 0) return;

    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;

    const estimatedItemHeight = 20;
    const buffer = 35;

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / estimatedItemHeight) - buffer
    );
    const endIndex = Math.min(
      totalLogsCount,
      Math.ceil((scrollTop + clientHeight) / estimatedItemHeight) + buffer
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [totalLogsCount]);

  const handleScrollWithRange = useCallback(() => {
    handleScroll();
    updateVisibleRange();
  }, [handleScroll, updateVisibleRange]);

  const status = lastKnownStatus ?? server.serverInfo?.status ?? "UNKNOWN";
  const isRunning = status === "RUNNING";

  // Initialize lastKnownStatus with current server status
  useEffect(() => {
    if (lastKnownStatus === null && status !== "UNKNOWN") {
      setLastKnownStatus(status);
    }
  }, [status, lastKnownStatus]);

  // Subscribe to WebSocket log messages (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = subscribe((message) => {
      console.log(
        "[CONSOLE] All WebSocket messages:",
        message.type,
        message.serverId,
        "Expected serverId:",
        server.serverId
      );
      if (message.type === "log" && message.serverId === server.serverId) {
        console.log("[CONSOLE] Log message received:", message.message);
        const rawLogLine = message.message;
        if (typeof rawLogLine === "string" && rawLogLine.trim()) {
          console.log("[CONSOLE] Processing log:", rawLogLine);
          const cleanLog = removeAnsiCodes(rawLogLine);
          const parsedLog = parseLog(cleanLog, null);

          if (parsedLog) {
            console.log("[CONSOLE] Parsed log successfully:", parsedLog);
            setWebsocketLogs((prevLogs) => {
              const newLogs = [...prevLogs, parsedLog];

              // Trigger scroll update for new WebSocket logs
              setTimeout(() => {
                if (autoScroll && containerRef.current) {
                  const container = containerRef.current;
                  container.style.scrollBehavior = "auto";
                  container.scrollTop = container.scrollHeight;
                }
              }, 0);

              return newLogs;
            });
          } else {
            console.log("[CONSOLE] Failed to parse log:", cleanLog);
          }
        } else {
          console.log("[CONSOLE] Invalid log message:", rawLogLine);
        }
      } else if (
        message.type === "status-update" &&
        message.serverId === server.serverId
      ) {
        const newStatus = message.data?.status;
        if (newStatus && newStatus !== lastKnownStatus) {
          setLastKnownStatus(newStatus);

          // Create status change log entry
          const statusMessage = `Server is now ${newStatus.toLowerCase()}`;
          const statusLog: LogLine = {
            rawTimestamp: null,
            timestamp: new Date(),
            logType: "status",
            message: statusMessage,
            id: `status-${Date.now()}`,
          };

          setWebsocketLogs((prevLogs) => {
            const newLogs = [...prevLogs, statusLog];

            // Trigger scroll update for status change
            setTimeout(() => {
              if (autoScroll && containerRef.current) {
                const container = containerRef.current;
                container.style.scrollBehavior = "auto";
                container.scrollTop = container.scrollHeight;
              }
            }, 0);

            return newLogs;
          });
        }
      }
    });

    return unsubscribe;
  }, [isClient, subscribe, server.serverId, autoScroll, lastKnownStatus]);

  // Background processing for remaining logs (not in initial 50)
  useEffect(() => {
    if (totalLogsCount === 0 || isProcessingInitial) return;

    const processBackground = () => {
      const newest35Start = Math.max(0, totalLogsCount - 35);

      // Find logs that aren't in the initial 35 and need background processing
      const toProcess: number[] = [];

      for (let i = 0; i < newest35Start; i++) {
        if (!backgroundProcessed.has(i)) {
          toProcess.push(i);
        }
      }

      // Process a few at a time to avoid blocking
      const batchSize = 10;
      const batch = toProcess.slice(0, batchSize);

      if (batch.length > 0) {
        setBackgroundProcessed((prev) => {
          const newSet = new Set(prev);
          batch.forEach((index) => newSet.add(index));
          return newSet;
        });

        // Continue processing more batches
        if (toProcess.length > batchSize) {
          setTimeout(processBackground, 16); // ~60fps
        }
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(processBackground);
    } else {
      setTimeout(processBackground, 0);
    }
  }, [totalLogsCount, isProcessingInitial, backgroundProcessed]);

  // Process initial 50 newest messages while loader is showing
  useEffect(() => {
    if (totalLogsCount > 0) {
      updateVisibleRange();

      // Process the newest 35 messages first
      const newest35Start = Math.max(0, totalLogsCount - 35);
      const newInitialProcessed = new Set<number>();

      for (let i = newest35Start; i < totalLogsCount; i++) {
        newInitialProcessed.add(i);
      }

      setInitialProcessed(newInitialProcessed);
      setIsProcessingInitial(false);
    } else if (!isLoading) {
      // Only set processing to false if we're not loading (so we show "No logs available")
      setIsProcessingInitial(false);
    }
  }, [totalLogsCount, updateVisibleRange, isLoading]);

  // Scroll to bottom when processing finishes
  useEffect(() => {
    if (!isProcessingInitial && autoScroll && containerRef.current) {
      const container = containerRef.current;
      container.style.scrollBehavior = "auto";
      container.scrollTop = container.scrollHeight;
    }
  }, [isProcessingInitial, autoScroll]);

  useEffect(() => {
    if (
      autoScroll &&
      containerRef.current &&
      totalLogsCount > 0 &&
      !isProcessingInitial
    ) {
      const container = containerRef.current;
      container.style.scrollBehavior = "auto";
      container.scrollTop = container.scrollHeight;
    }
  }, [totalLogsCount, autoScroll, isProcessingInitial]);

  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className={
            "console-container relative h-[300px] overflow-x-hidden overflow-y-auto rounded-md p-3 pb-2 font-mono text-xs sm:h-[400px] sm:p-6 sm:pb-4 lg:h-[508px]"
          }
          style={{
            scrollbarWidth: isLoading || isProcessingInitial ? "none" : "thin",
            msOverflowStyle: isLoading || isProcessingInitial ? "none" : "auto",
            scrollBehavior: "auto",
          }}
          onScroll={handleScrollWithRange}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .console-container::-webkit-scrollbar {
                width: ${isLoading || isProcessingInitial ? "0px" : "8px"};
                opacity: ${isLoading || isProcessingInitial ? "0" : "1"};
                transition: opacity 200ms ease;
              }
              .console-container::-webkit-scrollbar-track {
                background: transparent;
              }
              .console-container::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.5);
                border-radius: 4px;
              }
              .console-container::-webkit-scrollbar-thumb:hover {
                background-color: rgba(156, 163, 175, 0.7);
              }
            `,
            }}
          />
          {isLoading || isProcessingInitial ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2Icon className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : totalLogsCount === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <p>No logs available</p>
            </div>
          ) : (
            <div className="space-y-0">
              {processedLogs.map((log, index) => {
                const isInViewport =
                  index >= visibleRange.start && index < visibleRange.end;
                const isInitialProcessed = initialProcessed.has(index);
                const isBackgroundProcessed = backgroundProcessed.has(index);
                const shouldShowProcessed =
                  isInViewport || isInitialProcessed || isBackgroundProcessed;

                if (shouldShowProcessed) {
                  return (
                    <div
                      key={`http-${index}`}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                    >
                      <ConsoleLine line={log} />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`http-${index}`}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className="whitespace-pre-wrap text-gray-400"
                      style={{ minHeight: "20px" }}
                    >
                      {log.message}
                    </div>
                  );
                }
              })}
              {websocketLogs.map((log, index) => {
                const globalIndex = processedLogs.length + index;

                return (
                  <div
                    key={`ws-${index}`}
                    ref={(el) => {
                      itemRefs.current[globalIndex] = el;
                    }}
                  >
                    <ConsoleLine line={log} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-3 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4">
          <div className="flex">
            <Input
              onKeyDown={handleCommandKeyDown}
              placeholder={
                !isConnected
                  ? "Connecting to server..."
                  : !isRunning
                    ? "Server must be running to send commands"
                    : "Enter server command..."
              }
              className="bg-background h-12 text-sm sm:h-10 sm:text-base"
              disabled={!isRunning || isLoading || !isConnected}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerConsole;
