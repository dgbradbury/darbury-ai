import fs from "fs";
import path from "path";

// Shared building blocks for opengraph-image.tsx files (satori/ImageResponse).
// Brand: Ink #191D23, Teal #189B93, Barlow Condensed display, Inter body.

export const OG_SIZE = { width: 1200, height: 630 };

export function loadOgFonts() {
  const read = (f: string) => fs.readFileSync(path.join(process.cwd(), "assets", f));
  return [
    {
      name: "Barlow Condensed",
      data: read("BarlowCondensed-Bold.ttf"),
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Inter",
      data: read("Inter-Medium.ttf"),
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}

/** Reads a file from /public and returns it as a data URI (satori-safe). */
export function publicImageDataUri(publicPath: string): string | null {
  const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  if (!fs.existsSync(file)) return null;
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

/** Blueprint-grid page frame used by every OG image. */
export function OgFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#191D23",
        backgroundImage:
          "linear-gradient(rgba(51,75,73,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(51,75,73,0.35) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        padding: "60px 70px",
        position: "relative",
      }}
    >
      {children}
      {/* Teal baseline bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: 10,
          backgroundColor: "#189B93",
        }}
      />
    </div>
  );
}
