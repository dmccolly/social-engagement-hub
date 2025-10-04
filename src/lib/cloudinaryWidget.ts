// src/lib/cloudinaryWidget.ts
export type UploadedAsset = {
  name: string;
  title: string;
  type: "image" | "video" | "raw";
  url: string;
  thumbnail: string;
  size: number;
  duration?: number | "";
  width?: number;
  height?: number;
  publicId: string;
  format?: string;
  cloudinaryData: any;
};

declare global {
  interface Window { cloudinary: any; openCloudinaryWidget?: any; }
}

const CLOUD_NAME = "dzrw8nopf";      // <-- your cloud
const UPLOAD_PRESET = "HIBF_MASTER"; // <-- your unsigned preset

function thumbFrom(info: any): string {
  const url = info?.secure_url || "";
  if (!url) return "";
  if (info.resource_type === "image") {
    return url.replace("/upload/", "/upload/w_300,h_300,c_fill,q_auto,f_auto/");
  }
  if (info.resource_type === "video") {
    return url.replace("/upload/", "/upload/so_0,w_300,h_300,c_fill,q_auto,f_jpg/").replace(/\.[^.]+$/, ".jpg");
  }
  return "";
}

export function normalize(info: any): UploadedAsset {
  return {
    name: `${info.original_filename}${info.format ? "." + info.format : ""}`,
    title: info.original_filename,
    type: info.resource_type,
    url: info.secure_url,
    thumbnail: thumbFrom(info),
    size: info.bytes,
    duration: info.duration ?? "",
    width: info.width,
    height: info.height,
    publicId: info.public_id,
    format: info.format,
    cloudinaryData: info
  };
}

type Options = Partial<{ maxChunkSize: number; folder: string; multiple: boolean; }>;

export function openCloudinaryWidget(onAsset: (a: UploadedAsset) => void, onClose?: () => void, options: Options = {}) {
  // If you included public/cloudinary-upload.html and are loading it in an iframe,
  // you can call window.openCloudinaryWidget from there. Otherwise, use this local instance.
  const createLocal = !!window.cloudinary && typeof window.cloudinary.createUploadWidget === "function";

  if (!createLocal && typeof window.openCloudinaryWidget === "function") {
    // Delegate to the global function if served from the HTML page
    return window.openCloudinaryWidget((asset: UploadedAsset) => onAsset(asset), onClose, options);
  }

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      resourceType: "auto",
      multiple: options.multiple ?? true,
      folder: options.folder ?? "uploads",
      maxChunkSize: options.maxChunkSize ?? 20 * 1024 * 1024, // 20 MB
      sources: ["local","url","camera","google_drive","dropbox"]
    },
    (error: any, result: any) => {
      if (error) {
        console.error("[Cloudinary] widget error", error);
        return;
      }
      if (!result) return;
      if (result.event === "success" && result.info) onAsset(normalize(result.info));
      if (result.event === "close") onClose?.();
    }
  );
  widget.open();
}
