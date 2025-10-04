// src/components/UploadButton.tsx
import React from "react";
import { openCloudinaryWidget, UploadedAsset } from "@/lib/cloudinaryWidget";

async function saveToXanoAndWebflow(asset: UploadedAsset) {
  // TODO: replace with your existing pipeline.
  // Example (pseudo):
  // await fetch("/.netlify/functions/xano-proxy", { method:"POST", body: JSON.stringify(asset) });
  // await fetch("/.netlify/functions/webflow-sync", { method:"POST", body: JSON.stringify({ publicId: asset.publicId, url: asset.url }) });
  console.log("[DEMO] Save to backend:", asset);
}

export default function UploadButton() {
  const startUpload = () => {
    openCloudinaryWidget(async (asset) => {
      console.log("[Uploaded]", asset);
      try { await saveToXanoAndWebflow(asset); }
      catch (e) { console.error("Post-upload pipeline failed:", e); }
    });
  };

  return (
    <button type="button" onClick={startUpload} aria-label="Upload files"
      style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #111827", background:"#111827", color:"#fff" }}>
      Upload files
    </button>
  );
}
