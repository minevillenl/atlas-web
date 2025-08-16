export type LogType = "error" | "warning" | "success" | "info" | "debug" | "status";
export type LogVariant = "red" | "yellow" | "green" | "blue" | "orange" | "purple";

export interface LogLine {
  rawTimestamp: string | null;
  timestamp: Date | null;
  message: string;
  logType?: string;
}

export interface LogStyle {
  type: LogType;
  variant: LogVariant;
  color: string;
}