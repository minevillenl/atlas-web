import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import ConsoleLine from "@/components/server/console-line";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
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

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || processedLogs.length === 0) return;

    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;

    const estimatedItemHeight = 20;
    const buffer = 100;

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / estimatedItemHeight) - buffer
    );
    const endIndex = Math.min(
      processedLogs.length,
      Math.ceil((scrollTop + clientHeight) / estimatedItemHeight) + buffer
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [processedLogs.length]);

  const handleScrollWithRange = useCallback(() => {
    handleScroll();
    updateVisibleRange();
  }, [handleScroll, updateVisibleRange]);

  const status = server.serverInfo?.status ?? "UNKNOWN";
  const isRunning = status === "RUNNING";

  useEffect(() => {
    if (processedLogs.length > 0) {
      updateVisibleRange();

      setIsProcessingInitial(false);
    } else {
      setIsProcessingInitial(true);
    }
  }, [processedLogs.length, updateVisibleRange]);

  useEffect(() => {
    if (
      !isProcessingInitial &&
      autoScroll &&
      containerRef.current &&
      processedLogs.length > 0
    ) {
      const container = containerRef.current;
      container.style.scrollBehavior = "auto";
      container.scrollTop = container.scrollHeight;

      updateVisibleRange();
    }
  }, [
    isProcessingInitial,
    autoScroll,
    processedLogs.length,
    updateVisibleRange,
  ]);

  useEffect(() => {
    if (
      autoScroll &&
      containerRef.current &&
      processedLogs.length > 0 &&
      !isProcessingInitial
    ) {
      const container = containerRef.current;
      const shouldScroll =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50;

      if (shouldScroll) {
        container.style.scrollBehavior = "auto";
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [processedLogs.length, autoScroll, isProcessingInitial]);

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
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isLoading || isProcessingInitial ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Loader2Icon className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>

          <div
            className={`transition-opacity duration-200 ${isLoading || isProcessingInitial ? "opacity-0" : "opacity-100"}`}
          >
            {processedLogs.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <p>No logs available</p>
              </div>
            ) : (
              <div className="space-y-0">
                {processedLogs.map((log, index) => {
                  const isVisible =
                    index >= visibleRange.start && index < visibleRange.end;

                  if (isVisible) {
                    return (
                      <div
                        key={index}
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
                        key={index}
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
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pt-1 pb-3 sm:px-4 sm:pt-1 sm:pb-4">
          <div className="flex">
            <Input
              onKeyDown={handleCommandKeyDown}
              placeholder="Enter server command..."
              className="bg-background h-12 text-sm sm:h-10 sm:text-base"
              disabled={!isRunning || isLoading}
            />
          </div>
          {!isRunning && (
            <p className="text-muted-foreground mt-2 text-xs">
              Server must be running to send commands
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerConsole;
