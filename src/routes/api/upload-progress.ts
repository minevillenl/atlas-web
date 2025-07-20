import { createServerFileRoute } from "@tanstack/react-start/server";

import { auth } from "@/server/lib/auth";

const uploadStreams = new Map<string, ReadableStreamDefaultController>();

export function sendProgressUpdate(uploadId: string, progress: number) {
  const controller = uploadStreams.get(uploadId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify({ progress })}\n\n`);
    } catch {
      uploadStreams.delete(uploadId);
    }
  }
}

export function closeProgressStream(uploadId: string) {
  const controller = uploadStreams.get(uploadId);
  if (controller) {
    try {
      controller.close();
    } catch {}
    uploadStreams.delete(uploadId);
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/upload-progress"
).methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const uploadId = url.searchParams.get("uploadId");

    if (!uploadId) {
      return new Response("Missing uploadId parameter", { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        uploadStreams.set(uploadId, controller);

        controller.enqueue(`data: ${JSON.stringify({ connected: true })}\n\n`);
      },
      cancel() {
        uploadStreams.delete(uploadId);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  },
});
