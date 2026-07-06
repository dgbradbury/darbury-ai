import { ImageResponse } from "next/og";
import { getProject, getAllProjects } from "@/lib/content";
import { OG_SIZE, OgFrame, loadOgFonts, publicImageDataUri } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const lockup = await publicImageDataUri("/images/darbury-lockup-white.png");
  const shot = project?.image ? await publicImageDataUri(project.image) : null;

  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flex: 1, gap: 50 }}>
          {/* Text column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              flex: 1,
              paddingBottom: 20,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {lockup && (
              <img
                src={lockup}
                alt=""
                style={{ height: 52, alignSelf: "flex-start", marginBottom: "auto" }}
              />
            )}
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 22,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#189B93",
                marginBottom: 20,
              }}
            >
              {project?.category ?? "AI Portfolio"}
            </div>
            <div
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 700,
                fontSize: 84,
                lineHeight: 1.02,
                textTransform: "uppercase",
                color: "#F0F2F3",
              }}
            >
              {project?.title ?? "Darbury AI"}
            </div>
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 26,
                lineHeight: 1.4,
                color: "#78919E",
                marginTop: 22,
              }}
            >
              {project?.tagline ?? ""}
            </div>
          </div>

          {/* Screenshot column */}
          {shot && (
            <div
              style={{
                display: "flex",
                width: 420,
                alignItems: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot}
                alt=""
                style={{
                  width: 420,
                  height: 420,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "2px solid #334B49",
                }}
              />
            </div>
          )}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: loadOgFonts() }
  );
}
