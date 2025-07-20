export type LogType = "error" | "warning" | "success" | "info" | "debug";
export type LogVariant =
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "orange"
  | "primary";

export type LogLine = {
  rawTimestamp: string | null;
  logType: string | null;
  timestamp: Date | null;
  message: string;
  id?: string;
};

export type LogStyle = {
  type: LogType;
  variant: LogVariant;
  color: string;
};

export type Message = {
  event: string;
  args: string[];
};
