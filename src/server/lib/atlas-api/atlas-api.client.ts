import { env } from "@/env";

import {
  type ActivitiesResponse,
  ActivitiesResponseSchema,
  type ActivityFilters,
  type ApiResponse,
  ApiResponseSchema,
  type ChunkedUploadChunkResponse,
  ChunkedUploadChunkResponseSchema,
  type ChunkedUploadCompleteResponse,
  ChunkedUploadCompleteResponseSchema,
  type ChunkedUploadStartResponse,
  ChunkedUploadStartResponseSchema,
  type CommandResponse,
  CommandResponseSchema,
  type CreateServerRequest,
  CreateServerRequestSchema,
  type DeleteResponse,
  DeleteResponseSchema,
  FileDeleteResponseSchema,
  type FileMkdirResponse,
  FileMkdirResponseSchema,
  type FileRenameRequest,
  FileRenameRequestSchema,
  FileRenameResponseSchema,
  type FileUploadResponse,
  FileUploadResponseSchema,
  type FilesResponse,
  FilesResponseSchema,
  type GroupResponse,
  GroupResponseSchema,
  type GroupsResponse,
  GroupsResponseSchema,
  type PlayerCountResponse,
  PlayerCountResponseSchema,
  type ScaleRequest,
  ScaleRequestSchema,
  type ScalingConfig,
  ScalingConfigSchema,
  type ScalingGroup,
  ScalingGroupResponse,
  type Server,
  type ServerCommand,
  ServerCommandSchema,
  type ServerCountResponse,
  ServerCountResponseSchema,
  type ServerListFilters,
  type ServerLogsResponse,
  ServerLogsResponseSchema,
  ServerSchema,
  type ServersResponse,
  type SystemMetrics,
  SystemMetricsSchema,
  type SystemStatus,
  SystemStatusSchema,
  type UtilizationResponse,
  UtilizationResponseSchema,
} from "./atlas-api.schemas";

export class AtlasApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || env.ATLAS_API_URL;
    this.apiKey = apiKey || env.ATLAS_API_KEY;

    if (!this.apiKey) {
      throw new Error(
        "Atlas API key is required. Set ATLAS_API_KEY environment variable."
      );
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Atlas API Error: ${data.error || response.statusText}`);
    }

    if (schema) {
      return schema.parse(data);
    }

    return data;
  }

  async getStatus(): Promise<SystemStatus> {
    return this.request("/api/v1/status", {}, SystemStatusSchema);
  }

  async getServers(filters?: ServerListFilters): Promise<ServersResponse> {
    let url = "/api/v1/servers";

    if (filters) {
      const params = new URLSearchParams();
      if (filters.group) params.append("group", filters.group);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request(url, {});
  }

  async createServer(
    serverData: CreateServerRequest
  ): Promise<ApiResponse<Server>> {
    CreateServerRequestSchema.parse(serverData);
    return this.request(
      "/api/v1/servers",
      {
        method: "POST",
        body: JSON.stringify(serverData),
      },
      ApiResponseSchema(ServerSchema)
    );
  }

  async getServer(id: string): Promise<ApiResponse<Server>> {
    return this.request(
      `/api/v1/servers/${id}`,
      {},
      ApiResponseSchema(ServerSchema)
    );
  }

  async deleteServer(id: string): Promise<DeleteResponse> {
    return this.request(
      `/api/v1/servers/${id}`,
      {
        method: "DELETE",
      },
      DeleteResponseSchema
    );
  }

  async startServer(id: string): Promise<ApiResponse<Server>> {
    return this.request(
      `/api/v1/servers/${id}/start`,
      {
        method: "POST",
      },
      ApiResponseSchema(ServerSchema)
    );
  }

  async stopServer(id: string): Promise<ApiResponse<Server>> {
    return this.request(
      `/api/v1/servers/${id}/stop`,
      {
        method: "POST",
      },
      ApiResponseSchema(ServerSchema)
    );
  }

  async restartServer(id: string): Promise<ApiResponse<Server>> {
    return this.request(
      `/api/v1/servers/${id}/restart`,
      {
        method: "POST",
      },
      ApiResponseSchema(ServerSchema)
    );
  }

  async executeServerCommand(
    id: string,
    command: ServerCommand
  ): Promise<ApiResponse<CommandResponse>> {
    ServerCommandSchema.parse(command);
    return this.request(
      `/api/v1/servers/${id}/command`,
      {
        method: "POST",
        body: JSON.stringify(command),
      },
      ApiResponseSchema(CommandResponseSchema)
    );
  }

  async getGroups(): Promise<GroupsResponse> {
    return this.request("/api/v1/groups", {}, GroupsResponseSchema);
  }

  async getGroup(group: string): Promise<GroupResponse> {
    return this.request(`/api/v1/groups/${group}`, {}, GroupResponseSchema);
  }

  async scaleGroup(
    group: string,
    scaleData: ScaleRequest
  ): Promise<ApiResponse<ScalingGroup>> {
    ScaleRequestSchema.parse(scaleData);
    return this.request(
      `/api/v1/groups/${group}/scale`,
      {
        method: "POST",
        body: JSON.stringify(scaleData),
      },
      ScalingGroupResponse
    );
  }

  async getScalingConfig(): Promise<ApiResponse<ScalingConfig>> {
    return this.request(
      "/api/v1/scaling",
      {},
      ApiResponseSchema(ScalingConfigSchema)
    );
  }

  async getMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return this.request(
      "/api/v1/metrics",
      {},
      ApiResponseSchema(SystemMetricsSchema)
    );
  }

  async getUtilization(): Promise<UtilizationResponse> {
    return this.request("/api/v1/utilization", {}, UtilizationResponseSchema);
  }

  async getPlayerCount(): Promise<PlayerCountResponse> {
    return this.request("/api/v1/players/count", {}, PlayerCountResponseSchema);
  }

  async getServerCount(): Promise<ServerCountResponse> {
    return this.request("/api/v1/servers/count", {}, ServerCountResponseSchema);
  }

  async getServerLogs(id: string): Promise<ServerLogsResponse> {
    return this.request(
      `/api/v1/servers/${id}/logs`,
      {},
      ServerLogsResponseSchema
    );
  }

  async getServerFiles(id: string, path?: string): Promise<FilesResponse> {
    const encodedPath = path ? encodeURIComponent(path) : "";
    const url = `/api/v1/servers/${id}/files${encodedPath ? `?path=${encodedPath}` : ""}`;
    return this.request(url, {}, FilesResponseSchema);
  }

  async getServerFileContents(id: string, file: string): Promise<string> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/servers/${id}/files/contents?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    return response.text();
  }

  async writeServerFileContents(
    id: string,
    file: string,
    content: string
  ): Promise<string> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/servers/${id}/files/contents?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      body: content,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    return response.text();
  }

  async deleteServerFile(id: string, file: string): Promise<string> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/servers/${id}/files/contents?file=${encodedFile}`;
    return this.request(url, { method: "DELETE" }, FileDeleteResponseSchema);
  }

  async renameServerFile(
    id: string,
    renameData: FileRenameRequest
  ): Promise<string> {
    FileRenameRequestSchema.parse(renameData);
    const url = `/api/v1/servers/${id}/files/rename`;
    return this.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(renameData),
      },
      FileRenameResponseSchema
    );
  }

  async downloadServerFile(id: string, file: string): Promise<Blob> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/servers/${id}/files/download?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    return response.blob();
  }

  async createServerFolder(
    id: string,
    path: string
  ): Promise<FileMkdirResponse> {
    const url = `/api/v1/servers/${id}/files/mkdir`;
    return this.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ path }),
      },
      FileMkdirResponseSchema
    );
  }

  async uploadServerFile(
    id: string,
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ): Promise<FileUploadResponse> {
    const encodedPath = encodeURIComponent(path);
    const url = `/api/v1/servers/${id}/files/upload?path=${encodedPath}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const result = FileUploadResponseSchema.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error}`));
          }
        } else {
          reject(
            new Error(`Atlas API Error: ${xhr.responseText || xhr.statusText}`)
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      xhr.open("POST", `${this.baseUrl}${url}`);
      xhr.setRequestHeader("Authorization", `Bearer ${this.apiKey}`);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      // Set timeout to 10 minutes for large files
      xhr.timeout = 10 * 60 * 1000;

      xhr.send(file);
    });
  }

  async startChunkedUpload(
    id: string,
    path: string,
    totalSize: number
  ): Promise<ChunkedUploadStartResponse> {
    const url = `/api/v1/servers/${id}/files/upload/start`;
    return this.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ path, totalSize }),
      },
      ChunkedUploadStartResponseSchema
    );
  }

  async uploadChunk(
    id: string,
    uploadId: string,
    chunkNumber: number,
    chunkData: Blob
  ): Promise<ChunkedUploadChunkResponse> {
    const url = `/api/v1/servers/${id}/files/upload/${uploadId}/chunk/${chunkNumber}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      body: chunkData,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return ChunkedUploadChunkResponseSchema.parse(data);
  }

  async completeChunkedUpload(
    id: string,
    uploadId: string
  ): Promise<ChunkedUploadCompleteResponse> {
    const url = `/api/v1/servers/${id}/files/upload/${uploadId}/complete`;
    return this.request(
      url,
      {
        method: "POST",
      },
      ChunkedUploadCompleteResponseSchema
    );
  }

  async chunkedUploadFile(
    id: string,
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ): Promise<ChunkedUploadCompleteResponse> {
    // Start the upload session
    const startResponse = await this.startChunkedUpload(id, path, file.size);
    const { uploadId, chunkSize, totalChunks } = startResponse.data;

    // Upload chunks
    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
      const start = (chunkNumber - 1) * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const chunkResponse = await this.uploadChunk(
        id,
        uploadId,
        chunkNumber,
        chunk
      );

      if (onProgress) {
        onProgress(chunkResponse.data.progress * 100);
      }
    }

    // Complete the upload
    const completeResponse = await this.completeChunkedUpload(id, uploadId);

    if (onProgress) {
      onProgress(100);
    }

    return completeResponse;
  }

  async generateWebSocketToken(
    id: string
  ): Promise<ApiResponse<{ token: string; expiresAt: number }>> {
    return this.request(`/api/v1/servers/${id}/ws/token`, {
      method: "POST",
    });
  }

  connectToServer(id: string): WebSocket {
    const wsUrl = `${this.baseUrl.replace(/^http/, "ws")}/api/v1/servers/${id}/ws`;
    const ws = new WebSocket(wsUrl, ["atlas-protocol"]);

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          type: "auth",
          token: this.apiKey,
        })
      );
    });

    return ws;
  }

  async getRecentActivities(filters?: ActivityFilters): Promise<ActivitiesResponse> {
    let url = "/api/v1/activity/recent";
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.offset) params.append("offset", filters.offset.toString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.request(url, {}, ActivitiesResponseSchema);
  }

  async getServerActivities(serverId: string, filters?: ActivityFilters): Promise<ActivitiesResponse> {
    let url = `/api/v1/activity/servers/${serverId}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.offset) params.append("offset", filters.offset.toString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.request(url, {}, ActivitiesResponseSchema);
  }

  async getGroupActivities(groupName: string, filters?: ActivityFilters): Promise<ActivitiesResponse> {
    let url = `/api/v1/activity/groups/${groupName}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.offset) params.append("offset", filters.offset.toString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.request(url, {}, ActivitiesResponseSchema);
  }

  // Template File Management
  async getTemplateFiles(path?: string): Promise<FilesResponse> {
    const encodedPath = path ? encodeURIComponent(path) : "";
    const url = `/api/v1/templates/files${encodedPath ? `?path=${encodedPath}` : ""}`;
    return this.request(url, {}, FilesResponseSchema);
  }

  async getTemplateFileContents(file: string): Promise<string> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/templates/files/contents?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    return response.text();
  }

  async writeTemplateFileContents(
    file: string,
    content: string
  ): Promise<string> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/templates/files/contents?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      body: content,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas API Error: ${errorText || response.statusText}`);
    }

    return response.text();
  }

  async deleteTemplateFile(file: string): Promise<DeleteResponse> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/templates/files/contents?file=${encodedFile}`;
    return this.request(url, { method: "DELETE" }, FileDeleteResponseSchema);
  }

  async renameTemplateFile(renameData: FileRenameRequest): Promise<ApiResponse<{path: string}>> {
    const url = "/api/v1/templates/files/rename";
    return this.request(
      url,
      {
        method: "POST",
        body: JSON.stringify(renameData),
      },
      FileRenameResponseSchema
    );
  }

  async downloadTemplateFile(file: string): Promise<Blob> {
    const encodedFile = encodeURIComponent(file);
    const url = `/api/v1/templates/files/download?file=${encodedFile}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Atlas API Error: ${response.statusText}`);
    }

    return response.blob();
  }

  async createTemplateFolder(path: string): Promise<FileMkdirResponse> {
    const url = "/api/v1/templates/files/mkdir";
    return this.request(
      url,
      {
        method: "POST",
        body: JSON.stringify({ path }),
      },
      FileMkdirResponseSchema
    );
  }

  async uploadTemplateFile(
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ): Promise<FileUploadResponse> {
    const encodedPath = encodeURIComponent(path);
    const url = `/api/v1/templates/files/upload?path=${encodedPath}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const result = FileUploadResponseSchema.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error}`));
          }
        } else {
          reject(
            new Error(`Atlas API Error: ${xhr.responseText || xhr.statusText}`)
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      xhr.open("POST", `${this.baseUrl}${url}`);
      xhr.setRequestHeader("Authorization", `Bearer ${this.apiKey}`);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      // Set timeout to 10 minutes for large files
      xhr.timeout = 10 * 60 * 1000;

      xhr.send(file);
    });
  }
}

let atlasClient: AtlasApiClient | null = null;

export function getAtlasClient(): AtlasApiClient {
  if (!atlasClient) {
    atlasClient = new AtlasApiClient();
  }

  return atlasClient;
}

export function createAtlasClient(
  baseUrl?: string,
  apiKey?: string
): AtlasApiClient {
  return new AtlasApiClient(baseUrl, apiKey);
}

const atlas = {
  getStatus: () => getAtlasClient().getStatus(),
  getServers: (filters?: ServerListFilters) =>
    getAtlasClient().getServers(filters),
  createServer: (serverData: CreateServerRequest) =>
    getAtlasClient().createServer(serverData),
  getServer: (id: string) => getAtlasClient().getServer(id),
  deleteServer: (id: string) => getAtlasClient().deleteServer(id),
  startServer: (id: string) => getAtlasClient().startServer(id),
  stopServer: (id: string) => getAtlasClient().stopServer(id),
  restartServer: (id: string) => getAtlasClient().restartServer(id),
  executeServerCommand: (id: string, command: ServerCommand) =>
    getAtlasClient().executeServerCommand(id, command),
  getGroups: () => getAtlasClient().getGroups(),
  getGroup: (group: string) => getAtlasClient().getGroup(group),
  scaleGroup: (group: string, scaleData: ScaleRequest) =>
    getAtlasClient().scaleGroup(group, scaleData),
  getScalingConfig: () => getAtlasClient().getScalingConfig(),
  getMetrics: () => getAtlasClient().getMetrics(),
  getUtilization: () => getAtlasClient().getUtilization(),
  getPlayerCount: () => getAtlasClient().getPlayerCount(),
  getServerCount: () => getAtlasClient().getServerCount(),
  getServerLogs: (id: string) => getAtlasClient().getServerLogs(id),
  getServerFiles: (id: string, path?: string) =>
    getAtlasClient().getServerFiles(id, path),
  getServerFileContents: (id: string, file: string) =>
    getAtlasClient().getServerFileContents(id, file),
  writeServerFileContents: (id: string, file: string, content: string) =>
    getAtlasClient().writeServerFileContents(id, file, content),
  deleteServerFile: (id: string, file: string) =>
    getAtlasClient().deleteServerFile(id, file),
  renameServerFile: (id: string, renameData: FileRenameRequest) =>
    getAtlasClient().renameServerFile(id, renameData),
  downloadServerFile: (id: string, file: string) =>
    getAtlasClient().downloadServerFile(id, file),
  createServerFolder: (id: string, path: string) =>
    getAtlasClient().createServerFolder(id, path),
  uploadServerFile: (
    id: string,
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ) => getAtlasClient().uploadServerFile(id, path, file, onProgress),
  chunkedUploadFile: (
    id: string,
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ) => getAtlasClient().chunkedUploadFile(id, path, file, onProgress),
  generateWebSocketToken: (id: string) =>
    getAtlasClient().generateWebSocketToken(id),
  connectToServer: (id: string) => getAtlasClient().connectToServer(id),
  getRecentActivities: (filters?: ActivityFilters) =>
    getAtlasClient().getRecentActivities(filters),
  getServerActivities: (serverId: string, filters?: ActivityFilters) =>
    getAtlasClient().getServerActivities(serverId, filters),
  getGroupActivities: (groupName: string, filters?: ActivityFilters) =>
    getAtlasClient().getGroupActivities(groupName, filters),
  // Template File Management
  getTemplateFiles: (path?: string) =>
    getAtlasClient().getTemplateFiles(path),
  getTemplateFileContents: (file: string) =>
    getAtlasClient().getTemplateFileContents(file),
  writeTemplateFileContents: (file: string, content: string) =>
    getAtlasClient().writeTemplateFileContents(file, content),
  deleteTemplateFile: (file: string) =>
    getAtlasClient().deleteTemplateFile(file),
  renameTemplateFile: (renameData: FileRenameRequest) =>
    getAtlasClient().renameTemplateFile(renameData),
  downloadTemplateFile: (file: string) =>
    getAtlasClient().downloadTemplateFile(file),
  createTemplateFolder: (path: string) =>
    getAtlasClient().createTemplateFolder(path),
  uploadTemplateFile: (
    path: string,
    file: File,
    onProgress?: (_progress: number) => void
  ) => getAtlasClient().uploadTemplateFile(path, file, onProgress),
};

export default atlas;
