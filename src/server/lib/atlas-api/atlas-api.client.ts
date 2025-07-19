import {
  type ApiResponse,
  ApiResponseSchema,
  type CommandResponse,
  CommandResponseSchema,
  type CreateServerRequest,
  CreateServerRequestSchema,
  type DeleteResponse,
  DeleteResponseSchema,
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
  ServersResponseSchema,
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
    this.baseUrl =
      baseUrl || process.env.ATLAS_API_URL || "http://localhost:9090";
    this.apiKey = apiKey || process.env.ATLAS_API_KEY || "";

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

    return this.request(url, {}, ServersResponseSchema);
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
      `/api/v1/servers/${id}/logs?lines=230`,
      {},
      ServerLogsResponseSchema
    );
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
  connectToServer: (id: string) => getAtlasClient().connectToServer(id),
};

export default atlas;
