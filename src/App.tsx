// Why URL.createObjectURL(file) is the magic
// * It creates a temporary blob URL pointing to that file in memory.
// * Example: blob:http://localhost:5173/2d6e123a-abc1-43ff-b2d0…
// * You can use that URL in <img> or <video> just like a normal URL.
// * No upload to a server is needed; the browser streams directly from memory.
// * This is the core of how Instagram/TikTok-style apps feel instant when you “record → preview → post.”

import { useEffect, useState } from "react";

type Item = { url: string; kind: "image" | "video" };

export default function App() {
  const [items, setItems] = useState<Item[]>([]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const next: Item[] = files.map((file) => {
      const url = URL.createObjectURL(file);
      const kind: Item["kind"] = file.type.startsWith("video/")
        ? "video"
        : "image";
      return { url, kind };
    });

    // Prepend so latest appears first
    setItems((curr) => [...next, ...curr]);

    // allow picking the same file again if desired
    e.currentTarget.value = "";
  };

  // Revoke blob URLs when component unmounts or items change (avoid memory leaks)
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.url));
    };
  }, []);

  const clearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Tiny Reels</h1>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          onChange={onPick}
        />
        <button onClick={clearAll}>Clear</button>
      </div>

      {/* Masonry via CSS columns */}
      <div className="masonry">
        {items.map((it, i) => (
          <div className="masonry-item" key={it.url + i}>
            {it.kind === "video" ? (
              <video
                src={it.url}
                playsInline
                autoPlay
                loop
                muted
                controls
                style={{ width: "100%", display: "block", borderRadius: 12 }}
              />
            ) : (
              <img
                src={it.url}
                alt={`preview-${i}`}
                style={{ width: "100%", display: "block", borderRadius: 12 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* quick styles */}
      <style>{`
        .masonry {
          column-count: 2;
          column-gap: 12px;
        }
        @media (min-width: 640px) {
          .masonry { column-count: 3; }
        }
        @media (min-width: 1024px) {
          .masonry { column-count: 4; }
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
