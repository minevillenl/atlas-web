import { createServerFileRoute } from "@tanstack/react-start/server";

import { auth } from "@/server/lib/auth";

// Store active upload progress streams
const uploadStreams = new Map<string, ReadableStreamDefaultController>();

export function sendProgressUpdate(uploadId: string, progress: number) {
  const controller = uploadStreams.get(uploadId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify({ progress })}\n\n`);
    } catch (error) {
      // Stream might be closed, remove it
      uploadStreams.delete(uploadId);
    }
  }
}

export function closeProgressStream(uploadId: string) {
  const controller = uploadStreams.get(uploadId);
  if (controller) {
    try {
      controller.close();
    } catch (error) {
      // Already closed
    }
    uploadStreams.delete(uploadId);
  }
}

export const ServerRoute = createServerFileRoute("/api/upload-progress").methods({
  GET: async ({ request }) => {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get upload ID from query params
    const url = new URL(request.url);
    const uploadId = url.searchParams.get("uploadId");

    if (!uploadId) {
      return new Response("Missing uploadId parameter", { status: 400 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Store controller for progress updates
        uploadStreams.set(uploadId, controller);
        
        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ connected: true })}\n\n`);
      },
      cancel() {
        // Clean up when client disconnects
        uploadStreams.delete(uploadId);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  },
});