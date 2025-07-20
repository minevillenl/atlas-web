import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { getLogType } from "@/lib/logs";
import { cn } from "@/lib/utils";
import { LogLine } from "@/types/console";

const ConsoleLine = React.memo(({
  line,
  noTimestamp,
}: {
  line: LogLine;
  noTimestamp?: boolean;
}) => {
  const { timestamp, message, rawTimestamp, logType } = line;
  const { type, variant } = getLogType(message, logType);

  const formattedTime = timestamp
    ? timestamp.toLocaleString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const tooltip = (type: string, timestamp: string | null) => {
    const square = (
      <div
        className={cn(
          "h-4 w-3 flex-shrink-0 rounded-[3px] sm:h-full sm:w-2",
          type === "error"
            ? "bg-red-500/60 sm:bg-red-500/40"
            : type === "warning"
              ? "bg-orange-500/60 sm:bg-orange-500/40"
              : type === "debug"
                ? "bg-yellow-500/60 sm:bg-yellow-500/40"
                : type === "info"
                  ? "bg-blue-600/60 sm:bg-blue-600/40"
                  : "bg-green-500/60 sm:bg-green-500/40"
        )}
      />
    );
    return timestamp ? (
      <TooltipProvider delayDuration={0} disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>{square}</TooltipTrigger>
          <TooltipContent
            sideOffset={5}
            className="bg-popover border-border z-[99999]"
          >
            <div className="text text-muted-foreground max-w-md text-xs break-all">
              <pre>{timestamp}</pre>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      square
    );
  };

  return (
    <div
      className={cn(
        "group flex flex-row items-stretch gap-2 py-1.5 font-mono text-xs sm:gap-3 sm:py-0.5",
        type === "error"
          ? "bg-red-500/10 hover:bg-red-500/15"
          : type === "warning"
            ? "bg-yellow-500/10 hover:bg-yellow-500/15"
            : type === "debug"
              ? "bg-orange-500/10 hover:bg-orange-500/15"
              : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
      )}
    >
      {/* Mobile: Simple colored bar */}
      <div
        className={cn(
          "w-1 flex-shrink-0 rounded-[1px] sm:hidden",
          type === "error"
            ? "bg-red-500"
            : type === "warning"
              ? "bg-orange-500"
              : type === "debug"
                ? "bg-yellow-500"
                : type === "info"
                  ? "bg-blue-600"
                  : "bg-green-500"
        )}
      />

      {/* Desktop: Full layout with tooltip */}
      <div className="hidden items-start gap-x-2 sm:flex">
        {tooltip(type, rawTimestamp)}
        {!noTimestamp && formattedTime !== null && (
          <span className="text-muted-foreground w-fit flex-shrink-0 px-2 select-none text-xs">
            {formattedTime}
          </span>
        )}

        <Badge
          variant={variant}
          className="w-14 justify-center px-1 py-0 text-[10px]"
        >
          {type}
        </Badge>
      </div>

      <span className="text-foreground font-mono text-xs dark:text-gray-200 min-w-0 flex-1">
        {message}
      </span>
    </div>
  );
});

ConsoleLine.displayName = "ConsoleLine";

export default ConsoleLine;
