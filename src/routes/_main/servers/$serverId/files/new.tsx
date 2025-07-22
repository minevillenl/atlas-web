import { useState } from "react";

import { Editor } from "@monaco-editor/react";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerWriteFileMutation } from "@/hooks/mutations/use-server-write-file-mutation";

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
  const { serverId } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [content, setContent] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const currentPath = search.path || "/";

  const saveFileMutation = useServerWriteFileMutation(
    serverId,
    "", // Will be set when saving
    () => {
      setSaveDialogOpen(false);
      setFileName("");
      // Navigate back to files list
      navigate({
        to: `/servers/${serverId}/files`,
        search: { path: currentPath },
      });
    }
  );

  const handleBack = () => {
    if (content.trim()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }

    navigate({
      to: `/servers/${serverId}/files`,
      search: { path: currentPath },
    });
  };

  const handleSave = () => {
    setSaveDialogOpen(true);
  };

  const confirmSave = () => {
    if (!fileName.trim()) return;

    const filePath =
      currentPath === "/"
        ? `/${fileName.trim()}`
        : `${currentPath}/${fileName.trim()}`;

    // Update the mutation with the correct file path
    saveFileMutation.mutate({
      server: serverId,
      file: filePath,
      content: content,
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
          <div>
            <h1 className="text-xl font-semibold">New File</h1>
            <p className="text-muted-foreground text-sm">
              Current directory: /home/container{currentPath}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saveFileMutation.isPending}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save As...
          </Button>
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

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save File</DialogTitle>
            <DialogDescription>
              Enter a filename to save your new file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example.txt"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmSave();
                  }
                }}
              />
              <p className="text-muted-foreground text-xs">
                Will be saved to: /home/container{currentPath === "/" ? "" : currentPath}/{fileName || "filename"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setFileName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSave}
              disabled={!fileName.trim() || saveFileMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/files/new")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      path: (search.path as string) || "/",
    };
  },
});