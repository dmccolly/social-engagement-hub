import React, { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Heading from "@tiptap/extension-heading";

/** ENV helper (works in CRA and Vite) */
const ENV = (k) =>
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[k]) ||
  (typeof process !== "undefined" && process.env && process.env[k]);

const CLOUD_NAME = ENV("REACT_APP_CLOUDINARY_CLOUD_NAME");
const UPLOAD_PRESET = ENV("REACT_APP_CLOUDINARY_UPLOAD_PRESET");
const XANO_API_URL = ENV("REACT_APP_XANO_API_URL"); // optional (used in onSave)

/** Convert YouTube URLs to embeddable src */
function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
  } catch {}
  return null;
}

/** Unsigned upload to Cloudinary
 *  - NEVER send api_key or signature in unsigned flow
 *  - Use /auto/upload to route image/video/audio correctly
 */
async function uploadUnsignedToCloudinary(file, folder = "social-hub") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Missing REACT_APP_CLOUDINARY_CLOUD_NAME or REACT_APP_CLOUDINARY_UPLOAD_PRESET"
    );
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  if (folder) form.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${t}`);
  }
  return res.json();
}

/** Minimal button/input UI helpers */
const Btn = (p) => (
  <button
    type="button"
    {...p}
    style={{
      background: "#222",
      color: "#e9e9e9",
      border: "1px solid #2e2e2e",
      borderRadius: 10,
      padding: "8px 10px",
      cursor: "pointer",
      ...p.style,
    }}
  />
);
const Text = (p) => (
  <input
    type="text"
    {...p}
    style={{
      background: "#222",
      color: "#e9e9e9",
      border: "1px solid #2e2e2e",
      borderRadius: 8,
      padding: "8px 10px",
      minWidth: 200,
      ...p.style,
    }}
  />
);
const Row = (p) => (
  <div
    {...p}
    style={{
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
      ...p.style,
    }}
  />
);

export default function RichBlogEditor({
  initialHTML = "<p>Start writing…</p>",
  folder = "social-hub",
  onSave, // optional: (html) => void  or async
}) {
  const [status, setStatus] = useState("Ready.");
  const fileRef = useRef(null);
  const ytRef = useRef(null);
  const capRef = useRef(null);
  const linkRef = useRef(null);
  const colorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Heading.configure({ levels: [2, 3] }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: "nofollow noopener", target: "_blank" },
      }),
    ],
    content: initialHTML,
  });

  /** Insert figure/media HTML into the editor */
  const insertMediaHtml = (secureUrl, mime, caption) => {
    let html;
    if (mime?.startsWith("image/")) {
      html = `<figure><img src="${secureUrl}" alt=""><figcaption>${caption || ""}</figcaption></figure>`;
    } else if (mime?.startsWith("audio/")) {
      html = `<figure><audio controls src="${secureUrl}"></audio><figcaption>${caption || ""}</figcaption></figure>`;
    } else if (mime?.startsWith("video/")) {
      html = `<figure><video controls src="${secureUrl}"></video><figcaption>${caption || ""}</figcaption></figure>`;
    } else {
      html = `<p><a href="${secureUrl}" target="_blank" rel="noopener">Download file</a></p>`;
    }
    editor?.commands.insertContent(html);
  };

  /** Upload selected file and insert */
  const onUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return setStatus("Choose a file first.");
    setStatus("Uploading…");
    try {
      const json = await uploadUnsignedToCloudinary(file, folder);
      // Use the original file's MIME to decide which HTML to insert
      insertMediaHtml(json.secure_url, file.type || "application/octet-stream", capRef.current?.value);
      setStatus("Uploaded and inserted.");
      if (fileRef.current) fileRef.current.value = "";
      if (capRef.current) capRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert(e.message);
      setStatus("Upload failed.");
    }
  };

  /** YouTube embed */
  const onEmbedYouTube = () => {
    const raw = ytRef.current?.value?.trim();
    const embed = toYouTubeEmbed(raw || "");
    if (!embed) return setStatus("Not a valid YouTube URL.");
    editor?.commands.insertContent(
      `<iframe src="${embed}" allowfullscreen loading="lazy" style="width:100%;aspect-ratio:16/9;border:0"></iframe>`
    );
    setStatus("YouTube embedded.");
    if (ytRef.current) ytRef.current.value = "";
  };

  /** Link handlers */
  const onAddLink = () => {
    const url = linkRef.current?.value?.trim();
    if (!url) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const onRemoveLink = () => editor?.chain().focus().unsetLink().run();

  /** Typography */
  const onUnderline = () => {
    const hasUnderline = editor?.getAttributes("textStyle")?.textDecoration === "underline";
    editor?.chain().focus().setMark("textStyle", { textDecoration: hasUnderline ? "none" : "underline" }).run();
  };
  const onColor = () => {
    const val = colorRef.current?.value;
    if (!val) return;
    editor?.chain().focus().setColor(val).run();
  };
  const onClearColor = () => editor?.chain().focus().unsetColor().run();

  /** Export / Save */
  const exportHTML = async () => {
    const html = editor?.getHTML() || "";
    try {
      await navigator.clipboard.writeText(html);
      setStatus("HTML copied to clipboard.");
    } catch {
      setStatus("HTML ready (copy failed). Check console.");
      console.log(html);
    }
  };
  const saveToXano = async () => {
    const html = editor?.getHTML() || "";
    if (!XANO_API_URL) {
      setStatus("Missing REACT_APP_XANO_API_URL; copy HTML instead.");
      return;
    }
    setStatus("Saving to Xano…");
    try {
      const res = await fetch(`${XANO_API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }), // extend with title, tags, etc. if needed
      });
      if (!res.ok) throw new Error(`Xano save failed: ${res.status}`);
      setStatus("Saved to Xano.");
    } catch (e) {
      console.error(e);
      alert(e.message);
      setStatus("Save failed.");
    }
  };
  const onSaveClick = async () => {
    const html = editor?.getHTML() || "";
    if (typeof onSave === "function") {
      setStatus("Saving…");
      try {
        await onSave(html);
        setStatus("Saved.");
      } catch (e) {
        console.error(e);
        setStatus("Save failed (onSave).");
      }
    } else {
      await saveToXano();
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16, color: "#e9e9e9" }}>
      {/* Page styling */}
      <style>
        {`
          body { background:#111; }
          .rbe-toolbar {
            position: sticky; top: 0; z-index: 5; background: #141414cc;
            backdrop-filter: blur(6px);
            border: 1px solid #2a2a2a; border-radius: 12px; padding: 10px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px;
          }
          .rbe-editor {
            margin-top: 12px; background:#1b1b1b; border:1px solid #2a2a2a; border-radius:12px; min-height:420px; padding:12px;
          }
          .rbe-editor .ProseMirror { outline: none; min-height: 388px; }
          .rbe-status { margin-top: 8px; color:#9aa0a6; }
          figure { margin: 1rem 0; }
          figure > figcaption { font-size:12px; color:#bdbdbd; }
          iframe { width: 100%; aspect-ratio: 16 / 9; border:0; display:block; }
          audio, video { width:100%; display:block; }
        `}
      </style>

      <h2>Blog Composer</h2>

      <div className="rbe-toolbar">
        <Row>
          <Btn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
          <Btn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
          <Btn onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</Btn>
          <Btn onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</Btn>
          <Btn onClick={onUnderline}>Underline</Btn>
        </Row>

        <Row>
          <input ref={colorRef} type="color" onChange={onColor} title="Text color" />
          <Btn onClick={onClearColor}>Clear Color</Btn>
        </Row>

        <Row>
          <Text ref={linkRef} placeholder="https:// Add link…" style={{ minWidth: 260 }} />
          <Btn onClick={onAddLink}>Add/Update Link</Btn>
          <Btn onClick={onRemoveLink}>Remove Link</Btn>
        </Row>

        <Row>
          <Text ref={ytRef} placeholder="YouTube URL…" style={{ minWidth: 260 }} />
          <Btn onClick={onEmbedYouTube}>Embed YouTube</Btn>
        </Row>

        <Row>
          <Text ref={capRef} placeholder="Caption (optional)" style={{ minWidth: 240 }} />
          <input ref={fileRef} type="file" accept="image/*,audio/*,video/*" />
          <Btn onClick={onUpload}>Upload</Btn>
        </Row>

        <Row>
          <Btn onClick={exportHTML}>Export HTML</Btn>
          <Btn onClick={onSaveClick}>Save</Btn>
        </Row>
      </div>

      <div className="rbe-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="rbe-status">{status}</div>
    </div>
  );
}
