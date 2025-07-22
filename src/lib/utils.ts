import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GROUP_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#F59E0B",
  "#EF4444",
  "#EAB308",
  "#06B6D4",
  "#7C3AED",
  "#F43F5E",
  "#A855F7",
  "#0EA5E9",
  "#84CC16",
  "#059669",
  "#FCD34D",
  "#DC2626",
  "#A78BFA",
  "#F472B6",
  "#FB923C",
  "#4ADE80",
  "#22D3EE",
  "#60A5FA",
  "#C084FC",
  "#F87171",
  "#FBBF24",
  "#34D399",
  "#38BDF8",
  "#818CF8",
  "#E879F9",
  "#FB7185",
  "#FDE047",
  "#86EFAC",
  "#5EEAD4",
  "#7DD3FC",
  "#93C5FD",
  "#A5B4FC",
  "#C4B5FD",
  "#DDD6FE",
  "#F0ABFC",
  "#F9A8D4",
  "#FDA4AF",
  "#FCA5A5",
  "#FDBA74",
  "#FCD34D",
  "#FDE68A",
  "#BEF264",
  "#86EFAC",
  "#6EE7B7",
  "#5EEAD4",
  "#67E8F9",
  "#7DD3FC",
  "#93C5FD",
  "#A5B4FC",
  "#C4B5FD",
  "#DDD6FE",
  "#E9D5FF",
  "#F3E8FF",
  "#FCE7F3",
  "#FEE2E2",
  "#FFEDD5",
  "#FEF3C7",
  "#ECFCCB",
  "#D9F99D",
  "#BBF7D0",
  "#A7F3D0",
  "#99F6E4",
  "#A5F3FC",
  "#BAE6FD",
  "#CBD5E1",
  "#E2E8F0",
  "#F1F5F9",
  "#F8FAFC",
  "#1E40AF",
  "#166534",
  "#B45309",
  "#6B21A8",
  "#BE123C",
  "#0F766E",
  "#4338CA",
  "#DC2626",
  "#E11D48",
  "#365314",
  "#0E7490",
  "#581C87",
  "#BE185D",
  "#6D28D9",
  "#0369A1",
  "#4D7C0F",
  "#047857",
  "#B91C1C",
  "#C084FC",
  "#F97316",
  "#65A30D",
  "#0D9488",
  "#0284C7",
  "#4F46E5",
];

/**
 * Get a consistent color for a group based on its name
 * This ensures the same group always gets the same color across all pages
 */
export function getGroupColor(groupName: string): string {
  const hash = groupName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GROUP_COLORS[hash % GROUP_COLORS.length];
}

/**
 * MIME types that can be edited in a text editor
 */
export const EDITABLE_MIME_TYPES = [
  // Text files
  "text/plain",
  "text/html",
  "text/css",
  "text/csv",
  "text/xml",
  "text/x-log",
  "text/yaml",
  "text/x-yaml",
  "text/x-toml",
  "text/x-ini",
  "text/x-properties",
  "text/x-sh",
  "text/x-python",
  "text/x-java-source",
  "text/x-c",
  "text/x-cpp",
  "text/x-csharp",
  "text/x-go",
  "text/x-rust",
  "text/x-php",
  "text/x-ruby",
  "text/x-perl",
  "text/x-lua",
  "text/x-sql",
  "text/x-dockerfile",
  "text/x-makefile",
  
  // Application types that are text-based
  "application/json",
  "application/xml",
  "application/javascript",
  "application/typescript",
  "application/yaml",
  "application/x-yaml",
  "application/x-toml",
  "application/x-ini",
  "application/x-properties",
  "application/x-sh",
  "application/x-python",
  "application/x-java-source",
  "application/x-dockerfile",
  "application/x-httpd-php",
  "application/sql",
  "application/x-sql",
  
  // Configuration files
  "application/x-nginx-conf",
  "application/x-apache-conf",
  "application/x-systemd-unit",
  
  // Markup and markdown
  "text/markdown",
  "text/x-markdown",
  "application/x-markdown",
  
  // Generic binary (often misdetected text files)
  "application/octet-stream",
] as const;

/**
 * Check if a file is editable based on its MIME type
 */
export function isFileEditable(mimeType: string): boolean {
  return EDITABLE_MIME_TYPES.includes(mimeType as any);
}

/**
 * Check if a file is editable based on its MIME type and name
 */
export function isFileEditableByNameAndType(fileName: string, mimeType: string): boolean {
  // First check if MIME type is editable
  if (isFileEditable(mimeType)) return true;
  
  // If MIME type is generic binary, check file extension
  if (mimeType === "application/octet-stream") {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const editableExtensions = [
      "txt", "md", "json", "xml", "yaml", "yml", "toml", "ini", "cfg", "conf",
      "env", "properties", "sh", "bash", "zsh", "fish", "py", "js", "jsx",
      "ts", "tsx", "html", "htm", "css", "scss", "sass", "less", "java",
      "c", "cpp", "cc", "cxx", "cs", "go", "rs", "php", "rb", "pl", "lua",
      "sql", "dockerfile", "makefile", "mk", "log"
    ];
    return editableExtensions.includes(extension || "");
  }
  
  return false;
}
