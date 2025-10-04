// netlify/functions/pdf-proxy.mts
import type { Handler } from "@netlify/functions";

const MAX_STREAM_BYTES = 15 * 1024 * 1024; // ~15MB ceiling for proxying

export const handler: Handler = async (event) => {
  try {
    const url = new URL(event.rawUrl).searchParams.get("url");
    if (!url) return { statusCode: 400, body: "Missing url param" };

    const head = await fetch(url, { method: "HEAD" });
    const len = Number(head.headers.get("content-length") || "0");
    if (len && len > MAX_STREAM_BYTES) {
      return {
        statusCode: 413,
        body: JSON.stringify({
          error: "PDF too large for proxy",
          message: "Load directly from Cloudinary URL instead of proxy.",
          url
        })
      };
    }

    const res = await fetch(url);
    return {
      statusCode: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/pdf",
        "cache-control": "public, max-age=3600"
      },
      body: Buffer.from(await res.arrayBuffer()).toString("base64"),
      isBase64Encoded: true
    };
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || "proxy error" };
  }
};
