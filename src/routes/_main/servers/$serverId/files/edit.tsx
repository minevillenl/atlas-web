import { useEffect, useState } from "react";

import { Editor } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useServerWriteFileMutation } from "@/hooks/mutations/use-server-write-file-mutation";
import { orpc } from "@/lib/orpc";

const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const extensionToLanguage: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    properties: "properties",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    pl: "perl",
    lua: "lua",
    sql: "sql",
    dockerfile: "dockerfile",
    makefile: "makefile",
    mk: "makefile",
    md: "markdown",
    markdown: "markdown",
    log: "log",
    txt: "plaintext",
  };

  return extensionToLanguage[extension || ""] || "plaintext";
};

const RouteComponent = () => {
  const { serverId } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  const filePath = search.path;
  const fileName = filePath?.split("/").pop() || "";

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  const {
    data: fileContent,
    isLoading: isLoadingContent,
    error,
  } = useQuery({
    ...orpc.atlas.getServerFileContents.queryOptions({
      input: { server: serverId, file: filePath || "" },
    }),
  });

  const saveFileMutation = useServerWriteFileMutation(
    serverId,
    filePath || "",
    () => {
      setOriginalContent(content);
      setHasChanges(false);
    }
  );

  useEffect(() => {
    if (fileContent) {
      setContent(fileContent);
      setOriginalContent(fileContent);
      setHasChanges(false);
    } else if (error && !isLoadingContent) {
      // File doesn't exist, start with empty content for new file creation
      setContent("");
      setOriginalContent("");
      setHasChanges(false);
    }
  }, [fileContent, error, isLoadingContent]);

  useEffect(() => {
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleSave = () => {
    if (!hasChanges || !filePath) return;
    saveFileMutation.mutate({
      server: serverId,
      file: filePath,
      content: content,
    });
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }

    navigate({
      to: `/servers/${serverId}/files`,
      search: { path: filePath?.split("/").slice(0, -1).join("/") || "/" },
    });
  };

  const language = filePath ? getLanguageFromFileName(fileName) : "plaintext";

  if (!server) {
    return <div>Loading...</div>;
  }

  // Only show error if it's not a "file not found" error (which is expected for new files)
  if (
    error &&
    !error.message?.includes("404") &&
    !error.message?.includes("not found") &&
    !error.message?.includes("does not exist")
  ) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Edit File</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="text-destructive">
                <Loader2 className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">Failed to load file</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {error.message || "An error occurred while loading the file"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Edit File</h1>
            <p className="text-muted-foreground text-sm">{filePath}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-muted-foreground text-sm">
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveFileMutation.isPending}
            size="sm"
          >
            {saveFileMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Card
        className="overflow-hidden bg-[#1E1E1E] py-4"
        style={{ height: "648px" }}
      >
        <CardContent className="flex h-full p-0 py-0">
          {isLoadingContent ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div
              className="-mt-px flex h-full w-full pl-4"
              style={{ border: "none", outline: "none" }}
            >
              <Editor
                height="600px"
                language={language}
                value={content}
                onChange={(value) => setContent(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderWhitespace: "selection",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  overviewRulerBorder: false,
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: "none",
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                  glyphMargin: false,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/files/edit")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      path: search.path as string,
    };
  },
});
