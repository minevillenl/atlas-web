/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from "@tanstack/react-start/server";

import { Route as rootRouteImport } from "./routes/__root";
import { Route as AdminRouteImport } from "./routes/admin";
import { Route as MainRouteImport } from "./routes/_main";
import { Route as AuthRouteImport } from "./routes/_auth";
import { Route as AdminIndexRouteImport } from "./routes/admin/index";
import { Route as MainIndexRouteImport } from "./routes/_main/index";
import { Route as MainActivityRouteImport } from "./routes/_main/activity";
import { Route as AuthLoginRouteImport } from "./routes/_auth/login";
import { Route as MainTemplatesIndexRouteImport } from "./routes/_main/templates/index";
import { Route as MainServersIndexRouteImport } from "./routes/_main/servers/index";
import { Route as MainGroupsIndexRouteImport } from "./routes/_main/groups/index";
import { Route as MainTemplatesNewRouteImport } from "./routes/_main/templates/new";
import { Route as MainTemplatesEditRouteImport } from "./routes/_main/templates/edit";
import { Route as MainServersServerIdRouteImport } from "./routes/_main/servers/$serverId";
import { Route as MainGroupsGroupIdRouteImport } from "./routes/_main/groups/$groupId";
import { Route as MainServersServerIdIndexRouteImport } from "./routes/_main/servers/$serverId/index";
import { Route as MainServersServerIdPlayersRouteImport } from "./routes/_main/servers/$serverId/players";
import { Route as MainServersServerIdFilesIndexRouteImport } from "./routes/_main/servers/$serverId/files/index";
import { Route as MainServersServerIdFilesNewRouteImport } from "./routes/_main/servers/$serverId/files/new";
import { Route as MainServersServerIdFilesEditRouteImport } from "./routes/_main/servers/$serverId/files/edit";
import { ServerRoute as ApiUploadProgressServerRouteImport } from "./routes/api/upload-progress";
import { ServerRoute as ApiUploadServerRouteImport } from "./routes/api/upload";
import { ServerRoute as ApiTemplateUploadServerRouteImport } from "./routes/api/template-upload";
import { ServerRoute as ApiChunkedUploadServerRouteImport } from "./routes/api/chunked-upload";
import { ServerRoute as ApiSplatServerRouteImport } from "./routes/api/$";
import { ServerRoute as ApiAuthSplatServerRouteImport } from "./routes/api/auth/$";

const rootServerRouteImport = createServerRootRoute();

const AdminRoute = AdminRouteImport.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => rootRouteImport,
} as any);
const MainRoute = MainRouteImport.update({
  id: "/_main",
  getParentRoute: () => rootRouteImport,
} as any);
const AuthRoute = AuthRouteImport.update({
  id: "/_auth",
  getParentRoute: () => rootRouteImport,
} as any);
const AdminIndexRoute = AdminIndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute,
} as any);
const MainIndexRoute = MainIndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => MainRoute,
} as any);
const MainActivityRoute = MainActivityRouteImport.update({
  id: "/activity",
  path: "/activity",
  getParentRoute: () => MainRoute,
} as any);
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AuthRoute,
} as any);
const MainTemplatesIndexRoute = MainTemplatesIndexRouteImport.update({
  id: "/templates/",
  path: "/templates/",
  getParentRoute: () => MainRoute,
} as any);
const MainServersIndexRoute = MainServersIndexRouteImport.update({
  id: "/servers/",
  path: "/servers/",
  getParentRoute: () => MainRoute,
} as any);
const MainGroupsIndexRoute = MainGroupsIndexRouteImport.update({
  id: "/groups/",
  path: "/groups/",
  getParentRoute: () => MainRoute,
} as any);
const MainTemplatesNewRoute = MainTemplatesNewRouteImport.update({
  id: "/templates/new",
  path: "/templates/new",
  getParentRoute: () => MainRoute,
} as any);
const MainTemplatesEditRoute = MainTemplatesEditRouteImport.update({
  id: "/templates/edit",
  path: "/templates/edit",
  getParentRoute: () => MainRoute,
} as any);
const MainServersServerIdRoute = MainServersServerIdRouteImport.update({
  id: "/servers/$serverId",
  path: "/servers/$serverId",
  getParentRoute: () => MainRoute,
} as any);
const MainGroupsGroupIdRoute = MainGroupsGroupIdRouteImport.update({
  id: "/groups/$groupId",
  path: "/groups/$groupId",
  getParentRoute: () => MainRoute,
} as any);
const MainServersServerIdIndexRoute =
  MainServersServerIdIndexRouteImport.update({
    id: "/",
    path: "/",
    getParentRoute: () => MainServersServerIdRoute,
  } as any);
const MainServersServerIdPlayersRoute =
  MainServersServerIdPlayersRouteImport.update({
    id: "/players",
    path: "/players",
    getParentRoute: () => MainServersServerIdRoute,
  } as any);
const MainServersServerIdFilesIndexRoute =
  MainServersServerIdFilesIndexRouteImport.update({
    id: "/files/",
    path: "/files/",
    getParentRoute: () => MainServersServerIdRoute,
  } as any);
const MainServersServerIdFilesNewRoute =
  MainServersServerIdFilesNewRouteImport.update({
    id: "/files/new",
    path: "/files/new",
    getParentRoute: () => MainServersServerIdRoute,
  } as any);
const MainServersServerIdFilesEditRoute =
  MainServersServerIdFilesEditRouteImport.update({
    id: "/files/edit",
    path: "/files/edit",
    getParentRoute: () => MainServersServerIdRoute,
  } as any);
const ApiUploadProgressServerRoute = ApiUploadProgressServerRouteImport.update({
  id: "/api/upload-progress",
  path: "/api/upload-progress",
  getParentRoute: () => rootServerRouteImport,
} as any);
const ApiUploadServerRoute = ApiUploadServerRouteImport.update({
  id: "/api/upload",
  path: "/api/upload",
  getParentRoute: () => rootServerRouteImport,
} as any);
const ApiTemplateUploadServerRoute = ApiTemplateUploadServerRouteImport.update({
  id: "/api/template-upload",
  path: "/api/template-upload",
  getParentRoute: () => rootServerRouteImport,
} as any);
const ApiChunkedUploadServerRoute = ApiChunkedUploadServerRouteImport.update({
  id: "/api/chunked-upload",
  path: "/api/chunked-upload",
  getParentRoute: () => rootServerRouteImport,
} as any);
const ApiSplatServerRoute = ApiSplatServerRouteImport.update({
  id: "/api/$",
  path: "/api/$",
  getParentRoute: () => rootServerRouteImport,
} as any);
const ApiAuthSplatServerRoute = ApiAuthSplatServerRouteImport.update({
  id: "/api/auth/$",
  path: "/api/auth/$",
  getParentRoute: () => rootServerRouteImport,
} as any);

export interface FileRoutesByFullPath {
  "/admin": typeof AdminRouteWithChildren;
  "/login": typeof AuthLoginRoute;
  "/activity": typeof MainActivityRoute;
  "/": typeof MainIndexRoute;
  "/admin/": typeof AdminIndexRoute;
  "/groups/$groupId": typeof MainGroupsGroupIdRoute;
  "/servers/$serverId": typeof MainServersServerIdRouteWithChildren;
  "/templates/edit": typeof MainTemplatesEditRoute;
  "/templates/new": typeof MainTemplatesNewRoute;
  "/groups": typeof MainGroupsIndexRoute;
  "/servers": typeof MainServersIndexRoute;
  "/templates": typeof MainTemplatesIndexRoute;
  "/servers/$serverId/players": typeof MainServersServerIdPlayersRoute;
  "/servers/$serverId/": typeof MainServersServerIdIndexRoute;
  "/servers/$serverId/files/edit": typeof MainServersServerIdFilesEditRoute;
  "/servers/$serverId/files/new": typeof MainServersServerIdFilesNewRoute;
  "/servers/$serverId/files": typeof MainServersServerIdFilesIndexRoute;
}
export interface FileRoutesByTo {
  "/login": typeof AuthLoginRoute;
  "/activity": typeof MainActivityRoute;
  "/": typeof MainIndexRoute;
  "/admin": typeof AdminIndexRoute;
  "/groups/$groupId": typeof MainGroupsGroupIdRoute;
  "/templates/edit": typeof MainTemplatesEditRoute;
  "/templates/new": typeof MainTemplatesNewRoute;
  "/groups": typeof MainGroupsIndexRoute;
  "/servers": typeof MainServersIndexRoute;
  "/templates": typeof MainTemplatesIndexRoute;
  "/servers/$serverId/players": typeof MainServersServerIdPlayersRoute;
  "/servers/$serverId": typeof MainServersServerIdIndexRoute;
  "/servers/$serverId/files/edit": typeof MainServersServerIdFilesEditRoute;
  "/servers/$serverId/files/new": typeof MainServersServerIdFilesNewRoute;
  "/servers/$serverId/files": typeof MainServersServerIdFilesIndexRoute;
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  "/_auth": typeof AuthRouteWithChildren;
  "/_main": typeof MainRouteWithChildren;
  "/admin": typeof AdminRouteWithChildren;
  "/_auth/login": typeof AuthLoginRoute;
  "/_main/activity": typeof MainActivityRoute;
  "/_main/": typeof MainIndexRoute;
  "/admin/": typeof AdminIndexRoute;
  "/_main/groups/$groupId": typeof MainGroupsGroupIdRoute;
  "/_main/servers/$serverId": typeof MainServersServerIdRouteWithChildren;
  "/_main/templates/edit": typeof MainTemplatesEditRoute;
  "/_main/templates/new": typeof MainTemplatesNewRoute;
  "/_main/groups/": typeof MainGroupsIndexRoute;
  "/_main/servers/": typeof MainServersIndexRoute;
  "/_main/templates/": typeof MainTemplatesIndexRoute;
  "/_main/servers/$serverId/players": typeof MainServersServerIdPlayersRoute;
  "/_main/servers/$serverId/": typeof MainServersServerIdIndexRoute;
  "/_main/servers/$serverId/files/edit": typeof MainServersServerIdFilesEditRoute;
  "/_main/servers/$serverId/files/new": typeof MainServersServerIdFilesNewRoute;
  "/_main/servers/$serverId/files/": typeof MainServersServerIdFilesIndexRoute;
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | "/admin"
    | "/login"
    | "/activity"
    | "/"
    | "/admin/"
    | "/groups/$groupId"
    | "/servers/$serverId"
    | "/templates/edit"
    | "/templates/new"
    | "/groups"
    | "/servers"
    | "/templates"
    | "/servers/$serverId/players"
    | "/servers/$serverId/"
    | "/servers/$serverId/files/edit"
    | "/servers/$serverId/files/new"
    | "/servers/$serverId/files";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/login"
    | "/activity"
    | "/"
    | "/admin"
    | "/groups/$groupId"
    | "/templates/edit"
    | "/templates/new"
    | "/groups"
    | "/servers"
    | "/templates"
    | "/servers/$serverId/players"
    | "/servers/$serverId"
    | "/servers/$serverId/files/edit"
    | "/servers/$serverId/files/new"
    | "/servers/$serverId/files";
  id:
    | "__root__"
    | "/_auth"
    | "/_main"
    | "/admin"
    | "/_auth/login"
    | "/_main/activity"
    | "/_main/"
    | "/admin/"
    | "/_main/groups/$groupId"
    | "/_main/servers/$serverId"
    | "/_main/templates/edit"
    | "/_main/templates/new"
    | "/_main/groups/"
    | "/_main/servers/"
    | "/_main/templates/"
    | "/_main/servers/$serverId/players"
    | "/_main/servers/$serverId/"
    | "/_main/servers/$serverId/files/edit"
    | "/_main/servers/$serverId/files/new"
    | "/_main/servers/$serverId/files/";
  fileRoutesById: FileRoutesById;
}
export interface RootRouteChildren {
  AuthRoute: typeof AuthRouteWithChildren;
  MainRoute: typeof MainRouteWithChildren;
  AdminRoute: typeof AdminRouteWithChildren;
}
export interface FileServerRoutesByFullPath {
  "/api/$": typeof ApiSplatServerRoute;
  "/api/chunked-upload": typeof ApiChunkedUploadServerRoute;
  "/api/template-upload": typeof ApiTemplateUploadServerRoute;
  "/api/upload": typeof ApiUploadServerRoute;
  "/api/upload-progress": typeof ApiUploadProgressServerRoute;
  "/api/auth/$": typeof ApiAuthSplatServerRoute;
}
export interface FileServerRoutesByTo {
  "/api/$": typeof ApiSplatServerRoute;
  "/api/chunked-upload": typeof ApiChunkedUploadServerRoute;
  "/api/template-upload": typeof ApiTemplateUploadServerRoute;
  "/api/upload": typeof ApiUploadServerRoute;
  "/api/upload-progress": typeof ApiUploadProgressServerRoute;
  "/api/auth/$": typeof ApiAuthSplatServerRoute;
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport;
  "/api/$": typeof ApiSplatServerRoute;
  "/api/chunked-upload": typeof ApiChunkedUploadServerRoute;
  "/api/template-upload": typeof ApiTemplateUploadServerRoute;
  "/api/upload": typeof ApiUploadServerRoute;
  "/api/upload-progress": typeof ApiUploadProgressServerRoute;
  "/api/auth/$": typeof ApiAuthSplatServerRoute;
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath;
  fullPaths:
    | "/api/$"
    | "/api/chunked-upload"
    | "/api/template-upload"
    | "/api/upload"
    | "/api/upload-progress"
    | "/api/auth/$";
  fileServerRoutesByTo: FileServerRoutesByTo;
  to:
    | "/api/$"
    | "/api/chunked-upload"
    | "/api/template-upload"
    | "/api/upload"
    | "/api/upload-progress"
    | "/api/auth/$";
  id:
    | "__root__"
    | "/api/$"
    | "/api/chunked-upload"
    | "/api/template-upload"
    | "/api/upload"
    | "/api/upload-progress"
    | "/api/auth/$";
  fileServerRoutesById: FileServerRoutesById;
}
export interface RootServerRouteChildren {
  ApiSplatServerRoute: typeof ApiSplatServerRoute;
  ApiChunkedUploadServerRoute: typeof ApiChunkedUploadServerRoute;
  ApiTemplateUploadServerRoute: typeof ApiTemplateUploadServerRoute;
  ApiUploadServerRoute: typeof ApiUploadServerRoute;
  ApiUploadProgressServerRoute: typeof ApiUploadProgressServerRoute;
  ApiAuthSplatServerRoute: typeof ApiAuthSplatServerRoute;
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/admin": {
      id: "/admin";
      path: "/admin";
      fullPath: "/admin";
      preLoaderRoute: typeof AdminRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/_main": {
      id: "/_main";
      path: "";
      fullPath: "";
      preLoaderRoute: typeof MainRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/_auth": {
      id: "/_auth";
      path: "";
      fullPath: "";
      preLoaderRoute: typeof AuthRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/admin/": {
      id: "/admin/";
      path: "/";
      fullPath: "/admin/";
      preLoaderRoute: typeof AdminIndexRouteImport;
      parentRoute: typeof AdminRoute;
    };
    "/_main/": {
      id: "/_main/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof MainIndexRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/activity": {
      id: "/_main/activity";
      path: "/activity";
      fullPath: "/activity";
      preLoaderRoute: typeof MainActivityRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_auth/login": {
      id: "/_auth/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof AuthLoginRouteImport;
      parentRoute: typeof AuthRoute;
    };
    "/_main/templates/": {
      id: "/_main/templates/";
      path: "/templates";
      fullPath: "/templates";
      preLoaderRoute: typeof MainTemplatesIndexRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/servers/": {
      id: "/_main/servers/";
      path: "/servers";
      fullPath: "/servers";
      preLoaderRoute: typeof MainServersIndexRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/groups/": {
      id: "/_main/groups/";
      path: "/groups";
      fullPath: "/groups";
      preLoaderRoute: typeof MainGroupsIndexRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/templates/new": {
      id: "/_main/templates/new";
      path: "/templates/new";
      fullPath: "/templates/new";
      preLoaderRoute: typeof MainTemplatesNewRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/templates/edit": {
      id: "/_main/templates/edit";
      path: "/templates/edit";
      fullPath: "/templates/edit";
      preLoaderRoute: typeof MainTemplatesEditRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/servers/$serverId": {
      id: "/_main/servers/$serverId";
      path: "/servers/$serverId";
      fullPath: "/servers/$serverId";
      preLoaderRoute: typeof MainServersServerIdRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/groups/$groupId": {
      id: "/_main/groups/$groupId";
      path: "/groups/$groupId";
      fullPath: "/groups/$groupId";
      preLoaderRoute: typeof MainGroupsGroupIdRouteImport;
      parentRoute: typeof MainRoute;
    };
    "/_main/servers/$serverId/": {
      id: "/_main/servers/$serverId/";
      path: "/";
      fullPath: "/servers/$serverId/";
      preLoaderRoute: typeof MainServersServerIdIndexRouteImport;
      parentRoute: typeof MainServersServerIdRoute;
    };
    "/_main/servers/$serverId/players": {
      id: "/_main/servers/$serverId/players";
      path: "/players";
      fullPath: "/servers/$serverId/players";
      preLoaderRoute: typeof MainServersServerIdPlayersRouteImport;
      parentRoute: typeof MainServersServerIdRoute;
    };
    "/_main/servers/$serverId/files/": {
      id: "/_main/servers/$serverId/files/";
      path: "/files";
      fullPath: "/servers/$serverId/files";
      preLoaderRoute: typeof MainServersServerIdFilesIndexRouteImport;
      parentRoute: typeof MainServersServerIdRoute;
    };
    "/_main/servers/$serverId/files/new": {
      id: "/_main/servers/$serverId/files/new";
      path: "/files/new";
      fullPath: "/servers/$serverId/files/new";
      preLoaderRoute: typeof MainServersServerIdFilesNewRouteImport;
      parentRoute: typeof MainServersServerIdRoute;
    };
    "/_main/servers/$serverId/files/edit": {
      id: "/_main/servers/$serverId/files/edit";
      path: "/files/edit";
      fullPath: "/servers/$serverId/files/edit";
      preLoaderRoute: typeof MainServersServerIdFilesEditRouteImport;
      parentRoute: typeof MainServersServerIdRoute;
    };
  }
}
declare module "@tanstack/react-start/server" {
  interface ServerFileRoutesByPath {
    "/api/upload-progress": {
      id: "/api/upload-progress";
      path: "/api/upload-progress";
      fullPath: "/api/upload-progress";
      preLoaderRoute: typeof ApiUploadProgressServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
    "/api/upload": {
      id: "/api/upload";
      path: "/api/upload";
      fullPath: "/api/upload";
      preLoaderRoute: typeof ApiUploadServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
    "/api/template-upload": {
      id: "/api/template-upload";
      path: "/api/template-upload";
      fullPath: "/api/template-upload";
      preLoaderRoute: typeof ApiTemplateUploadServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
    "/api/chunked-upload": {
      id: "/api/chunked-upload";
      path: "/api/chunked-upload";
      fullPath: "/api/chunked-upload";
      preLoaderRoute: typeof ApiChunkedUploadServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
    "/api/$": {
      id: "/api/$";
      path: "/api/$";
      fullPath: "/api/$";
      preLoaderRoute: typeof ApiSplatServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
    "/api/auth/$": {
      id: "/api/auth/$";
      path: "/api/auth/$";
      fullPath: "/api/auth/$";
      preLoaderRoute: typeof ApiAuthSplatServerRouteImport;
      parentRoute: typeof rootServerRouteImport;
    };
  }
}

interface AuthRouteChildren {
  AuthLoginRoute: typeof AuthLoginRoute;
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthLoginRoute: AuthLoginRoute,
};

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);

interface MainServersServerIdRouteChildren {
  MainServersServerIdPlayersRoute: typeof MainServersServerIdPlayersRoute;
  MainServersServerIdIndexRoute: typeof MainServersServerIdIndexRoute;
  MainServersServerIdFilesEditRoute: typeof MainServersServerIdFilesEditRoute;
  MainServersServerIdFilesNewRoute: typeof MainServersServerIdFilesNewRoute;
  MainServersServerIdFilesIndexRoute: typeof MainServersServerIdFilesIndexRoute;
}

const MainServersServerIdRouteChildren: MainServersServerIdRouteChildren = {
  MainServersServerIdPlayersRoute: MainServersServerIdPlayersRoute,
  MainServersServerIdIndexRoute: MainServersServerIdIndexRoute,
  MainServersServerIdFilesEditRoute: MainServersServerIdFilesEditRoute,
  MainServersServerIdFilesNewRoute: MainServersServerIdFilesNewRoute,
  MainServersServerIdFilesIndexRoute: MainServersServerIdFilesIndexRoute,
};

const MainServersServerIdRouteWithChildren =
  MainServersServerIdRoute._addFileChildren(MainServersServerIdRouteChildren);

interface MainRouteChildren {
  MainActivityRoute: typeof MainActivityRoute;
  MainIndexRoute: typeof MainIndexRoute;
  MainGroupsGroupIdRoute: typeof MainGroupsGroupIdRoute;
  MainServersServerIdRoute: typeof MainServersServerIdRouteWithChildren;
  MainTemplatesEditRoute: typeof MainTemplatesEditRoute;
  MainTemplatesNewRoute: typeof MainTemplatesNewRoute;
  MainGroupsIndexRoute: typeof MainGroupsIndexRoute;
  MainServersIndexRoute: typeof MainServersIndexRoute;
  MainTemplatesIndexRoute: typeof MainTemplatesIndexRoute;
}

const MainRouteChildren: MainRouteChildren = {
  MainActivityRoute: MainActivityRoute,
  MainIndexRoute: MainIndexRoute,
  MainGroupsGroupIdRoute: MainGroupsGroupIdRoute,
  MainServersServerIdRoute: MainServersServerIdRouteWithChildren,
  MainTemplatesEditRoute: MainTemplatesEditRoute,
  MainTemplatesNewRoute: MainTemplatesNewRoute,
  MainGroupsIndexRoute: MainGroupsIndexRoute,
  MainServersIndexRoute: MainServersIndexRoute,
  MainTemplatesIndexRoute: MainTemplatesIndexRoute,
};

const MainRouteWithChildren = MainRoute._addFileChildren(MainRouteChildren);

interface AdminRouteChildren {
  AdminIndexRoute: typeof AdminIndexRoute;
}

const AdminRouteChildren: AdminRouteChildren = {
  AdminIndexRoute: AdminIndexRoute,
};

const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);

const rootRouteChildren: RootRouteChildren = {
  AuthRoute: AuthRouteWithChildren,
  MainRoute: MainRouteWithChildren,
  AdminRoute: AdminRouteWithChildren,
};
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
const rootServerRouteChildren: RootServerRouteChildren = {
  ApiSplatServerRoute: ApiSplatServerRoute,
  ApiChunkedUploadServerRoute: ApiChunkedUploadServerRoute,
  ApiTemplateUploadServerRoute: ApiTemplateUploadServerRoute,
  ApiUploadServerRoute: ApiUploadServerRoute,
  ApiUploadProgressServerRoute: ApiUploadProgressServerRoute,
  ApiAuthSplatServerRoute: ApiAuthSplatServerRoute,
};
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>();
