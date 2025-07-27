import { useCallback, useEffect, useState } from "react";

import { Editor } from "@monaco-editor/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateWriteFileMutation } from "@/hooks/mutations/use-template-write-file-mutation";

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
    env: "ini",
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
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [content, setContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  const currentPath = search.path;

  const saveFileMutation = useTemplateWriteFileMutation("", () => {
    navigate({
      to: "/templates",
      search: { path: currentPath },
    });
  });

  useEffect(() => {
    setHasChanges(content.length > 0 || fileName.length > 0);
  }, [content, fileName]);

  const handleSave = useCallback(() => {
    if (!fileName.trim()) return;

    const filePath =
      currentPath === "/"
        ? `/${fileName}`
        : `${currentPath}/${fileName}`;

    saveFileMutation.mutate({
      file: filePath,
      content: content,
    });
  }, [fileName, currentPath, saveFileMutation, content]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }

    navigate({
      to: "/templates",
      search: { path: currentPath },
    });
  };

  const language = fileName ? getLanguageFromFileName(fileName) : "plaintext";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Template Manager</h1>
              <p className="text-muted-foreground text-sm">Create new template file</p>
            </div>
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
            disabled={!fileName.trim() || saveFileMutation.isPending}
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

      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="fileName">File Name</Label>
          <Input
            type="text"
            id="fileName"
            placeholder="e.g. config.yml"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
      </div>

      <Card
        className="overflow-hidden bg-[#1E1E1E] py-4"
        style={{ height: "648px" }}
      >
        <CardContent className="flex h-full p-0 py-0">
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
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/_main/templates/new")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      path: (search.path as string) || "/",
    };
  },
});